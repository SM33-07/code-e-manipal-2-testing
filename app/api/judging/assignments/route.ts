import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import { getJudgeAssignments } from '@/services/judgingService';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/judging/assignments
 * Judge/Admin — returns the current judge's assigned submissions.
 *
 * Each assignment includes the full submission + any existing review
 * by this judge, so the frontend can show progress at a glance.
 *
 * Query params:
 *   status — filter by submission status (submitted | under_review | reviewed)
 */
export const GET = withAuth(async (req, { user }) => {
  try {
    const supabase    = createSupabaseServerClient();
    const assignments = await getJudgeAssignments(supabase, user.id);

    // Optional status filter applied in-memory (avoids complex join query)
    const status = req.nextUrl.searchParams.get('status');
    const filtered = status
      ? assignments.filter((a) => (a.submissions as any)?.status === status)
      : assignments;

    logger.info('GET /api/judging/assignments', {
      judgeId: user.id,
      total:   filtered.length,
    });

    return successResponse(filtered, {
      total:     filtered.length,
      completed: filtered.filter(
        (a) => (a.judge_reviews as any)?.[0]?.is_complete === true
      ).length,
    });
  } catch (err) {
    logger.error('GET /api/judging/assignments', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'judge');
