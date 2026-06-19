import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';
import { encrypt } from '@/lib/utils/crypto';

/**
 * POST /api/register
 * Public endpoint — no authentication required.
 *
 * Body: { name, team_name, phone, email }
 *
 * Round 1: Auto-creates Supabase Auth user + profile, status = approved
 * Round 2: Saves as pending, awaits admin approval
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, team_name, phone, email, password } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!name?.trim()) return Errors.BAD_REQUEST('Name is required');
    if (!team_name?.trim()) return Errors.BAD_REQUEST('Team name is required');
    if (!phone?.trim()) return Errors.BAD_REQUEST('Phone number is required');
    if (!email?.trim()) return Errors.BAD_REQUEST('Email is required');
    if (!password) return Errors.BAD_REQUEST('Password is required');

    const emailLower = email.trim().toLowerCase();
    const phoneClean = phone.trim();
    const nameClean = name.trim();
    const teamClean = team_name.trim();

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return Errors.BAD_REQUEST('Invalid email format');
    }

    // Basic phone validation (at least 10 digits)
    if (!/^\+?[\d\s\-()]{10,}$/.test(phoneClean)) {
      return Errors.BAD_REQUEST('Phone number must be at least 10 digits');
    }

    if (password.length < 6) {
      return Errors.BAD_REQUEST('Password must be at least 6 characters');
    }

    // ── Duplicate checks ────────────────────────────────────────
    const emailCheck = await query(
      'SELECT id FROM public.hackathon_registrations WHERE LOWER(email) = $1',
      [emailLower]
    );
    if (emailCheck.rows.length > 0) {
      return Errors.CONFLICT('This email is already registered');
    }

    const teamNameCheck = await query(
      'SELECT id FROM public.hackathon_registrations WHERE LOWER(team_name) = $1',
      [teamClean.toLowerCase()]
    );
    if (teamNameCheck.rows.length > 0) {
      return Errors.CONFLICT('This team name is already taken');
    }

    // Also check against existing teams table
    const existingTeam = await query(
      'SELECT id FROM public.teams WHERE LOWER(name) = $1',
      [teamClean.toLowerCase()]
    );
    if (existingTeam.rows.length > 0) {
      return Errors.CONFLICT('This team name is already taken');
    }

    // ── Determine round ─────────────────────────────────────────
    const round = parseInt(process.env.REGISTRATION_ROUND || '1', 10);

    if (round === 1) {
      // ── Round 1: Auto-approve + create auth user ────────────
      const supabase = createSupabaseAdminClient();

      // Create Supabase Auth user with the provided password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emailLower,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: nameClean,
          role: 'participant',
        },
      });

      if (authError) {
        logger.error('POST /api/register — auth user creation failed', {
          error: authError.message,
          email: emailLower,
        });
        // If user already exists in auth, still a conflict
        if (authError.message.includes('already') || authError.message.includes('exists')) {
          return Errors.CONFLICT('An account with this email already exists');
        }
        return Errors.INTERNAL('Failed to create account. Please try again.');
      }

      // Sync to Azure auth.users so the trigger creates the profile
      if (authData.user) {
        try {
          await query(
            'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [authData.user.id, emailLower, JSON.stringify({ name: nameClean, role: 'participant' })]
          );
        } catch (e) {
          logger.warn('auth.users sync note', { error: String(e) });
        }

        // Ensure profile row exists
        await query(
          `INSERT INTO public.profiles (id, name, email, avatar_url, role)
           VALUES ($1, $2, $3, '', 'participant')
           ON CONFLICT (id) DO NOTHING`,
          [authData.user.id, nameClean, emailLower]
        );
      }

      // Save registration record as approved
      await query(
        `INSERT INTO public.hackathon_registrations
         (name, team_name, phone, email, round, status)
         VALUES ($1, $2, $3, $4, $5, 'approved')`,
        [nameClean, teamClean, phoneClean, emailLower, round]
      );

      logger.info('POST /api/register — Round 1 auto-approved', {
        email: emailLower,
        teamName: teamClean,
      });

      return successResponse(
        { autoApproved: true },
        { message: 'Registration successful! You can now log in using your email and password.' },
        201
      );
    } else {
      // ── Round 2: Save as pending ────────────────────────────
      const encryptedPassword = encrypt(password);
      await query(
        `INSERT INTO public.hackathon_registrations
         (name, team_name, phone, email, round, status, encrypted_password)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
        [nameClean, teamClean, phoneClean, emailLower, round, encryptedPassword]
      );

      logger.info('POST /api/register — Round 2 pending', {
        email: emailLower,
        teamName: teamClean,
      });

      return successResponse(
        { autoApproved: false },
        { message: 'Application submitted! You will be notified once reviewed.' },
        201
      );
    }
  } catch (err) {
    logger.error('POST /api/register', { error: String(err) });
    return Errors.INTERNAL('Registration failed. Please try again.');
  }
}
