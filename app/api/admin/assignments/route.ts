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
    const judgeId  = req.nextUrl.searchParams.get('judge_id');

    const supabase = await createSupabaseServerClient();

    // Fetch assignments
    let assignQuery = supabase
      .from('judge_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (judgeId) {
      if (!isValidUUID(judgeId)) return Errors.BAD_REQUEST('Invalid judge_id');
      assignQuery = assignQuery.eq('judge_id', judgeId);
    }

    const { data: assignments, error: assignErr } = await assignQuery;
    if (assignErr) throw assignErr;

    // Fetch related submissions
    const subIds = [...new Set(assignments.map(a => a.submission_id))];
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id, title, category, status')
      .in('id', subIds.length ? subIds : ['none']);

    // Fetch related judge profiles
    const judgeIds = [...new Set(assignments.map(a => a.judge_id))];
    const { data: judges } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .in('id', judgeIds.length ? judgeIds : ['none']);

    // Join in-memory
    const subMap = new Map((submissions ?? []).map(s => [s.id, s]));
    const judgeMap = new Map((judges ?? []).map(j => [j.id, j]));
    const data = assignments.map(a => ({
      ...a,
      submissions: subMap.get(a.submission_id) ?? null,
      profiles: judgeMap.get(a.judge_id) ?? null,
    }));

    return successResponse(data);
  } catch (err) {
    console.error('GET /api/admin/assignments error:', err);
    logger.error('GET /api/admin/assignments', { error: err instanceof Error ? err.message : JSON.stringify(err) });
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
      const supabase = await createSupabaseServerClient();
      const count = await autoAssignAllJudges(supabase);

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

    const supabase = await createSupabaseServerClient();

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
    console.error('POST /api/admin/assignments error:', err);
    logger.error('POST /api/admin/assignments', { error: err instanceof Error ? err.message : JSON.stringify(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
