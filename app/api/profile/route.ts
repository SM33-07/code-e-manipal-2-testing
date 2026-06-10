import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import { updateProfile } from '@/services/profileService';
import { sanitizeString, isValidUrl } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/profile
 * Returns the currently authenticated user's profile.
 */
export const GET = withAuth(async (_req, { profile }) => {
  return successResponse(profile);
});

/**
 * PUT /api/profile
 * Updates name and/or avatar_url for the current user.
 *
 * Body: { name?: string; avatar_url?: string }
 */
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name, avatar_url } = body;

    const updates: { name?: string; avatar_url?: string } = {};

    if (name !== undefined) {
      const clean = sanitizeString(name, 100);
      if (!clean) return Errors.BAD_REQUEST('name must be 1–100 non-empty characters');
      updates.name = clean;
    }

    if (avatar_url !== undefined) {
      if (avatar_url !== null && !isValidUrl(avatar_url)) {
        return Errors.BAD_REQUEST('avatar_url must be a valid URL');
      }
      updates.avatar_url = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      return Errors.BAD_REQUEST('Provide at least one field to update: name or avatar_url');
    }

    const supabase = await createSupabaseServerClient();
    const updated = await updateProfile(supabase, user.id, updates);

    logger.info('PUT /api/profile', { userId: user.id });
    return successResponse(updated);
  } catch (err) {
    logger.error('PUT /api/profile', { error: String(err) });
    return Errors.INTERNAL();
  }
});
