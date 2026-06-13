import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAllProfiles, setUserRole } from '@/services/profileService';
import { isValidUUID } from '@/lib/utils/validate';
import type { UserRole } from '@/types';
import { logger } from '@/lib/utils/logger';

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
    const { user_id, role } = body;

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
