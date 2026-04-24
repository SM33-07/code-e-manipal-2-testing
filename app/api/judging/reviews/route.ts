import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import { upsertReview } from '@/services/judgingService';
import { sanitizeScore, isValidUUID } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/judging/reviews
 * Judge/Admin — creates or updates (upserts) a review for a submission.
 *
 * The judge must be assigned to the submission.
 * Scores are optional per-save — judges can save partial drafts.
 * Setting is_complete: true finalises the review.
 *
 * Body:
 * {
 *   submission_id: string        (required)
 *   score_innovation?:    1–10
 *   score_technical?:     1–10
 *   score_presentation?:  1–10
 *   score_impact?:        1–10
 *   feedback?:            string
 *   is_complete?:         boolean
 * }
 */
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();

    const {
      submission_id,
      score_innovation,
      score_technical,
      score_presentation,
      score_impact,
      feedback,
      is_complete,
    } = body;

    // Validate submission_id
    if (!submission_id || !isValidUUID(submission_id)) {
      return Errors.BAD_REQUEST('A valid submission_id is required');
    }

    // Validate scores if provided
    const scoreFields: Record<string, unknown> = {
      score_innovation,
      score_technical,
      score_presentation,
      score_impact,
    };

    const sanitizedScores: Record<string, number | undefined> = {};
    for (const [key, val] of Object.entries(scoreFields)) {
      if (val === undefined || val === null) continue;
      const sanitized = sanitizeScore(val);
      if (sanitized === undefined) {
        return Errors.BAD_REQUEST(`${key} must be an integer between 1 and 10`);
      }
      sanitizedScores[key] = sanitized;
    }

    const supabase = createSupabaseServerClient();

    // Verify the judge is assigned to this submission
    const { data: assignment } = await supabase
      .from('judge_assignments')
      .select('judge_id')
      .eq('judge_id', user.id)
      .eq('submission_id', submission_id)
      .single();

    if (!assignment) {
      return Errors.FORBIDDEN();
    }

    // Upsert the review
    const review = await upsertReview(supabase, {
      submission_id,
      judge_id: user.id,
      ...sanitizedScores,
      feedback:    typeof feedback === 'string' ? feedback.trim() : undefined,
      is_complete: Boolean(is_complete),
    });

    // Sync submission status
    const newStatus = is_complete ? 'reviewed' : 'under_review';
    await supabase
      .from('submissions')
      .update({ status: newStatus })
      .eq('id', submission_id);

    logger.info('POST /api/judging/reviews', {
      reviewId:     review.id,
      submissionId: submission_id,
      judgeId:      user.id,
      is_complete,
    });

    return successResponse(review, undefined, 201);
  } catch (err) {
    logger.error('POST /api/judging/reviews', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'judge');
