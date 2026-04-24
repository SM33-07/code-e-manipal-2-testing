import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsData } from '@/types';

export async function getAnalytics(supabase: SupabaseClient): Promise<AnalyticsData> {
  const [subResult, teamResult, reviewResult] = await Promise.all([
    supabase.from('submissions').select('status, category').is('deleted_at', null),
    supabase.from('teams').select('id', { count: 'exact', head: true }),
    supabase.from('judge_reviews').select('score_innovation, score_technical, score_presentation, score_impact').eq('is_complete', true),
  ]);

  const subs = subResult.data ?? [];
  const reviews = reviewResult.data ?? [];

  const category_breakdown = subs.reduce((acc: Record<string, number>, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    total_submissions: subs.length,
    submitted_count:   subs.filter(s => s.status !== 'draft').length,
    reviewed_count:    subs.filter(s => s.status === 'reviewed').length,
    total_teams:       teamResult.count ?? 0,
    category_breakdown,
    avg_scores: {
      innovation:   avg(reviews.map(r => r.score_innovation).filter(Boolean)),
      technical:    avg(reviews.map(r => r.score_technical).filter(Boolean)),
      presentation: avg(reviews.map(r => r.score_presentation).filter(Boolean)),
      impact:       avg(reviews.map(r => r.score_impact).filter(Boolean)),
    },
  };
}