import type { SupabaseClient } from '@supabase/supabase-js';
import type { JudgeReview, JudgeAssignment } from '@/types';

export async function getJudgeAssignments(supabase: SupabaseClient, judgeId: string) {
  const { data, error } = await supabase
    .from('judge_assignments')
    .select('*, submissions(*, teams(name))')
    .eq('judge_id', judgeId);
  if (error) throw error;
  return data as JudgeAssignment[];
}

export async function upsertReview(supabase: SupabaseClient, review: Partial<JudgeReview> & { submission_id: string; judge_id: string }) {
  const { data, error } = await supabase
    .from('judge_reviews')
    .upsert(review, { onConflict: 'submission_id,judge_id' })
    .select()
    .single();
  if (error) throw error;
  return data as JudgeReview;
}

export async function getReviewsForSubmission(supabase: SupabaseClient, submissionId: string) {
  const { data, error } = await supabase
    .from('judge_reviews')
    .select('*, profiles(name)')
    .eq('submission_id', submissionId);
  if (error) throw error;
  return data as JudgeReview[];
}

export async function assignJudge(
  supabase: SupabaseClient,
  judgeId: string,
  submissionId: string
) {
  const { error } = await supabase
    .from('judge_assignments')
    .insert({ judge_id: judgeId, submission_id: submissionId });
  if (error) throw error;
}

export async function removeJudgeAssignment(
  supabase: SupabaseClient,
  judgeId: string,
  submissionId: string
) {
  const { error } = await supabase
    .from('judge_assignments')
    .delete()
    .eq('judge_id', judgeId)
    .eq('submission_id', submissionId);
  if (error) throw error;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function autoAssignAllJudges(supabase: SupabaseClient): Promise<number> {
  // Get all judges
  const { data: judges, error: judgeErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'judge');
  if (judgeErr) throw judgeErr;
  if (!judges || judges.length === 0) return 0;

  // Get all submitted (non-draft, non-deleted) submissions
  const { data: submissions, error: subErr } = await supabase
    .from('submissions')
    .select('id')
    .in('status', ['submitted', 'under_review', 'reviewed'])
    .is('deleted_at', null);
  if (subErr) throw subErr;
  if (!submissions || submissions.length === 0) return 0;

  // Shuffle submissions randomly
  const shuffled = shuffleArray(submissions);

  // Build assignments round-robin
  const assignments = shuffled.map((sub, i) => ({
    judge_id: judges[i % judges.length].id,
    submission_id: sub.id,
  }));

  // Clear existing auto-assignments for these submissions
  const subIds = submissions.map(s => s.id);
  await supabase
    .from('judge_assignments')
    .delete()
    .in('submission_id', subIds);

  // Bulk insert new assignments
  const { error: insertErr } = await supabase
    .from('judge_assignments')
    .insert(assignments);
  if (insertErr) throw insertErr;

  return assignments.length;
}

export async function getReviewById(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<JudgeReview | null> {
  const { data, error } = await supabase
    .from('judge_reviews')
    .select('*')
    .eq('id', id)
    .eq('judge_id', userId)
    .single();
  if (error) return null;
  return data as JudgeReview;
}

export async function updateReview(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<JudgeReview> {
  const { data, error } = await supabase
    .from('judge_reviews')
    .update(updates)
    .eq('id', id)
    .eq('judge_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as JudgeReview;
}