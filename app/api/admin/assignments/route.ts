import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { successResponse, Errors } from '@/lib/utils/response';
import {
  assignJudge,
  removeJudgeAssignment,
  autoAssignAllJudges,
} from '@/services/judgingService';
import { isValidUUID } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/assignments
 * Admin — list all judge assignments with submission + judge details.
 */
export const GET = withAuth(async (req) => {
  try {
    const supabase = createSupabaseServerClient();
    const judgeId  = req.nextUrl.searchParams.get('judge_id');

    let query = supabase
      .from('judge_assignments')
      .select(`
        *,
        submissions(id, title, category, status),
        profiles:judge_id(id, name, email, avatar_url)
      `)
      .order('assigned_at', { ascending: false });

    if (judgeId) {
      if (!isValidUUID(judgeId)) return Errors.BAD_REQUEST('Invalid judge_id');
      query = query.eq('judge_id', judgeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return successResponse(data);
  } catch (err) {
    logger.error('GET /api/admin/assignments', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');

/**
 * POST /api/admin/assignments
 * Admin — manually assign a judge to a submission,
 *         OR trigger auto-assign of all judges to all submitted submissions.
 *
 * Body (manual):    { action: 'assign',    judge_id, submission_id }
 * Body (unassign):  { action: 'unassign',  judge_id, submission_id }
 * Body (auto):      { action: 'auto_assign' }
 */
export const POST = withAuth(async (req) => {
  try {
    const body   = await req.json();
    const action = body.action as string;

    // ── Auto assign ───────────────────────────────────────────
    if (action === 'auto_assign') {
      // Use admin client so it bypasses RLS for bulk upsert
      const adminClient = createSupabaseAdminClient();
      const count = await autoAssignAllJudges(adminClient);

      logger.info('POST /api/admin/assignments (auto_assign)', { assigned: count });
      return successResponse({ action: 'auto_assign', assigned: count });
    }

    // ── Manual assign / unassign ──────────────────────────────
    const { judge_id, submission_id } = body;

    if (!judge_id || !isValidUUID(judge_id)) {
      return Errors.BAD_REQUEST('A valid judge_id is required');
    }
    if (!submission_id || !isValidUUID(submission_id)) {
      return Errors.BAD_REQUEST('A valid submission_id is required');
    }

    const supabase = createSupabaseServerClient();

    // Verify the user is actually a judge (or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', judge_id)
      .single();

    if (!profile) return Errors.NOT_FOUND('Judge');

    if (profile.role === 'participant') {
      return Errors.BAD_REQUEST(`User "${profile.name}" is not a judge or admin`);
    }

    if (action === 'unassign') {
      await removeJudgeAssignment(supabase, judge_id, submission_id);
      logger.info('POST /api/admin/assignments (unassign)', { judge_id, submission_id });
      return successResponse({ action: 'unassign', judge_id, submission_id });
    }

    // Default: assign
    await assignJudge(supabase, judge_id, submission_id);

    logger.info('POST /api/admin/assignments (assign)', { judge_id, submission_id });
    return successResponse({ action: 'assign', judge_id, submission_id }, undefined, 201);

  } catch (err) {
    logger.error('POST /api/admin/assignments', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
