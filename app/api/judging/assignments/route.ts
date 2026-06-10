import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/judging/assignments
 * Judge/Admin — returns the current judge's assigned submissions
 * with a `reviewed` boolean based on whether this judge has submitted a review.
 */
export const GET = withAuth(async (req, { user, profile }) => {
  try {
    const supabase = await createSupabaseServerClient();
    const isAdmin = profile?.role === 'admin';

    // 1. Get assignments (all subs for admin)
    let items: any[] = [];
    if (isAdmin) {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      items = (data ?? []).map((s: any) => ({
        judge_id: user.id,
        submission_id: s.id,
        submissions: s,
      }));
    } else {
      const { data: assignments, error: e1 } = await supabase
        .from('judge_assignments')
        .select('judge_id, submission_id, assigned_at')
        .eq('judge_id', user.id);
      if (e1) throw e1;

      if (assignments && assignments.length > 0) {
        const subIds = assignments.map(a => a.submission_id);
        const { data: subs, error: e2 } = await supabase
          .from('submissions')
          .select('*')
          .in('id', subIds);
        if (e2) throw e2;
        const subMap = new Map((subs ?? []).map(s => [s.id, s]));
        items = assignments.map(a => ({
          ...a,
          submissions: subMap.get(a.submission_id) ?? null,
        }));
      }
    }

    // 2. Get reviews to mark reviewed status (admin sees all, judge sees own)
    const subIds = items.map(i => i.submission_id);
    let reviewQuery = supabase
      .from('judge_reviews')
      .select('submission_id')
      .in('submission_id', subIds.length ? subIds : ['none']);
    if (!isAdmin) reviewQuery = reviewQuery.eq('judge_id', user.id);
    const { data: myReviews } = await reviewQuery;

    const reviewedSet = new Set((myReviews ?? []).map(r => r.submission_id));

    // 3. Attach reviewed flag
    const result = items.map(i => ({
      ...i,
      reviewed: reviewedSet.has(i.submission_id),
    }));

    // Optional status filter
    const status = req.nextUrl.searchParams.get('status');
    const filtered = status
      ? result.filter(i => i.submissions?.status === status)
      : result;

    logger.info('GET /api/judging/assignments', {
      userId: user.id,
      total:  filtered.length,
    });

    return successResponse(filtered, {
      total:     filtered.length,
      completed: filtered.filter((i: any) => i.reviewed).length,
    });
  } catch (err) {
    console.error('GET /api/judging/assignments error:', err);
    logger.error('GET /api/judging/assignments', { error: err instanceof Error ? err.message : JSON.stringify(err) });
    return Errors.INTERNAL();
  }
}, 'judge');
