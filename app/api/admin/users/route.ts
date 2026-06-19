import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAllProfiles, setUserRole } from '@/services/profileService';
import { isValidUUID } from '@/lib/utils/validate';
import type { UserRole } from '@/types';
import { logger } from '@/lib/utils/logger';
import { query } from '@/lib/db';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES: UserRole[] = ['participant', 'judge', 'admin'];

/**
 * GET /api/admin/users
 * Admin only — list all user profiles, optionally filtered by role.
 *
 * Query params:
 *   role — participant | judge | admin
 */
export const GET = withAuth(async (req) => {
  try {
    const role = req.nextUrl.searchParams.get('role') ?? undefined;

    if (role && !VALID_ROLES.includes(role as UserRole)) {
      return Errors.BAD_REQUEST(`role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    const profiles = await getAllProfiles(role);

    logger.info('GET /api/admin/users', { role: role ?? 'all', count: profiles.length });

    return successResponse(profiles, { total: profiles.length });
  } catch (err) {
    logger.error('GET /api/admin/users', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');

/**
 * POST /api/admin/users
 * Admin only — promote or demote a user's role.
 *
 * Body: { user_id: string; role: 'participant' | 'judge' | 'admin' }
 */
export const POST = withAuth(async (req, { user: adminUser }) => {
  try {
    const body = await req.json();
    const { action, user_id, role, email, password, name } = body;

    // ── Create User Account ────────────────────────────────────
    if (action === 'create') {
      if (!email?.trim()) return Errors.BAD_REQUEST('Email is required');
      if (!password || password.length < 6) {
        return Errors.BAD_REQUEST('Password must be at least 6 characters');
      }
      if (!name?.trim()) return Errors.BAD_REQUEST('Name is required');
      if (!role || !VALID_ROLES.includes(role as UserRole)) {
        return Errors.BAD_REQUEST(`role must be one of: ${VALID_ROLES.join(', ')}`);
      }

      const emailLower = email.trim().toLowerCase();
      const nameClean = name.trim();

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
        return Errors.BAD_REQUEST('Invalid email format');
      }

      // Check if email already exists in profiles
      const emailCheck = await query(
        'SELECT id FROM public.profiles WHERE LOWER(email) = $1',
        [emailLower]
      );
      if (emailCheck.rows.length > 0) {
        return Errors.CONFLICT('A user with this email already exists');
      }

      const supabase = createSupabaseAdminClient();

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emailLower,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: nameClean,
          role: role,
        },
      });

      if (authError) {
        logger.error('POST /api/admin/users (creation) — auth user creation failed', {
          error: authError.message,
          email: emailLower,
        });
        if (authError.message.includes('already') || authError.message.includes('exists')) {
          return Errors.CONFLICT('A user with this email already exists in authentication');
        }
        return Errors.INTERNAL('Failed to create authentication user');
      }

      if (authData.user) {
        // Sync to Azure auth.users so trigger creates profile
        try {
          await query(
            'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [authData.user.id, emailLower, JSON.stringify({ name: nameClean, role: role })]
          );
        } catch (e) {
          logger.warn('auth.users sync note', { error: String(e) });
        }

        // Upsert profile row with the designated role
        const { rows: profileRows } = await query(
          `INSERT INTO public.profiles (id, name, email, avatar_url, role)
           VALUES ($1, $2, $3, '', $4)
           ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name
           RETURNING *`,
          [authData.user.id, nameClean, emailLower, role]
        );

        logger.info('POST /api/admin/users (direct create)', {
          targetUserId: authData.user.id,
          role,
          createdBy: adminUser.id,
        });

        return successResponse(
          profileRows[0] ?? { id: authData.user.id, name: nameClean, email: emailLower, role },
          { message: 'User account created successfully' },
          201
        );
      }

      return Errors.INTERNAL('User creation failed');
    }

    // ── Update Existing Role ───────────────────────────────────
    if (!user_id || !isValidUUID(user_id)) {
      return Errors.BAD_REQUEST('A valid user_id is required');
    }

    if (!role || !VALID_ROLES.includes(role as UserRole)) {
      return Errors.BAD_REQUEST(`role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    // Prevent an admin from demoting themselves
    if (user_id === adminUser.id && role !== 'admin') {
      return Errors.BAD_REQUEST('Admins cannot remove their own admin role');
    }

    const updated = await setUserRole(user_id, role as UserRole);

    logger.info('POST /api/admin/users (role update)', {
      targetUserId: user_id,
      newRole:      role,
      changedBy:    adminUser.id,
    });

    return successResponse(updated);
  } catch (err) {
    logger.error('POST /api/admin/users', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
