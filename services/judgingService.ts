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