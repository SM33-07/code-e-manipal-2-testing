import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import { getReviewById, updateReview } from '@/services/judgingService';
import { sanitizeScore, isValidUUID } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

type Ctx = { params: { id: string } };

/**
 * GET /api/judging/reviews/:id
 * Judge/Admin — fetch a single review (must belong to the calling judge).
 */
export const GET = withAuth(async (_req, { user, params }) => {
  try {
    const id = params!.id;
    if (!isValidUUID(id)) return Errors.BAD_REQUEST('Invalid review ID');

    const supabase = await createSupabaseServerClient();
    const review   = await getReviewById(supabase, id, user.id);

    if (!review) return Errors.NOT_FOUND('Review');

    return successResponse(review);
  } catch (err) {
    logger.error('GET /api/judging/reviews/[id]', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'judge');

/**
 * PUT /api/judging/reviews/:id
 * Judge/Admin — update scores / feedback on an existing review.
 *
 * Once is_complete is true the review is locked — re-opening requires admin.
 *
 * Body: same optional fields as POST
 */
export const PUT = withAuth(async (req, { user, params }) => {
  try {
    const id = params!.id;
    if (!isValidUUID(id)) return Errors.BAD_REQUEST('Invalid review ID');

    const supabase = await createSupabaseServerClient();
    const existing = await getReviewById(supabase, id, user.id);

    if (!existing) return Errors.NOT_FOUND('Review');

    // Prevent editing a finalised review (unless admin re-opens)
    if (existing.is_complete && user.id === existing.judge_id) {
      return Errors.BAD_REQUEST(
        'This review is already finalised. Contact an admin to re-open it.'
      );
    }

    const body = await req.json();

    const {
      score_innovation,
      score_technical,
      score_presentation,
      score_impact,
      feedback,
      is_complete,
    } = body;

    const scoreFields: Record<string, unknown> = {
      score_innovation,
      score_technical,
      score_presentation,
      score_impact,
    };

    const updates: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(scoreFields)) {
      if (val === undefined || val === null) continue;
      const sanitized = sanitizeScore(val);
      if (sanitized === undefined) {
        return Errors.BAD_REQUEST(`${key} must be an integer between 1 and 10`);
      }
      updates[key] = sanitized;
    }

    if (typeof feedback === 'string') updates.feedback    = feedback.trim();
    if (is_complete !== undefined)    updates.is_complete = Boolean(is_complete);

    if (Object.keys(updates).length === 0) {
      return Errors.BAD_REQUEST('No valid fields provided to update');
    }

    const updated = await updateReview(supabase, id, user.id, updates);

    // Sync submission status if is_complete changed
    if ('is_complete' in updates) {
      const newStatus = updates.is_complete ? 'reviewed' : 'under_review';
      await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', existing.submission_id);
    }

    logger.info('PUT /api/judging/reviews/[id]', {
      reviewId: id,
      judgeId:  user.id,
      updates:  Object.keys(updates),
    });

    return successResponse(updated);
  } catch (err) {
    logger.error('PUT /api/judging/reviews/[id]', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'judge');
