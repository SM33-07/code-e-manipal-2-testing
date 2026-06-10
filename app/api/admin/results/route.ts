import { withAuth } from '@/lib/middleware/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/utils/response';
import type { RankedSubmission } from '@/types';
import { logger } from '@/lib/utils/logger';

function avg(values: (number | null)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined);
  if (!valid.length) return 0;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
}

/**
 * GET /api/admin/results
 * Admin only — returns all reviewed submissions ranked by average total score.
 *
 * Each entry includes per-criterion averages and a computed rank.
 *
 * Query params:
 *   category — filter by category
 *   min_reviews — only include submissions with at least N complete reviews (default 1)
 */
export const GET = withAuth(async (req) => {
  try {
    const p           = req.nextUrl.searchParams;
    const category    = p.get('category') ?? undefined;
    const minReviews  = Math.max(parseInt(p.get('min_reviews') ?? '1'), 1);

    const supabase = await createSupabaseServerClient();

    // Fetch submissions
    let subQuery = supabase
      .from('submissions')
      .select('id, title, summary, category, status, created_at, team_id')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (category) subQuery = subQuery.eq('category', category);

    const { data: submissions, error: subErr } = await subQuery;
    if (subErr) throw subErr;

    // Fetch teams
    const teamIds = [...new Set((submissions ?? []).map(s => s.team_id))];
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, hackathon')
      .in('id', teamIds.length ? teamIds : ['none']);

    // Fetch complete reviews
    const subIds = (submissions ?? []).map(s => s.id);
    const { data: reviews } = await supabase
      .from('judge_reviews')
      .select('submission_id, judge_id, is_complete, score_innovation, score_technical, score_presentation, score_impact, feedback')
      .in('submission_id', subIds.length ? subIds : ['none']);

    // Fetch judge profiles for reviews
    const judgeIds = [...new Set((reviews ?? []).map(r => r.judge_id))];
    const { data: judges } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', judgeIds.length ? judgeIds : ['none']);

    // Build lookup maps
    const teamMap = new Map((teams ?? []).map(t => [t.id, t]));
    const judgeMap = new Map((judges ?? []).map(j => [j.id, j]));
    const reviewsBySub = new Map<string, any[]>();
    for (const r of (reviews ?? [])) {
      if (!reviewsBySub.has(r.submission_id)) reviewsBySub.set(r.submission_id, []);
      reviewsBySub.get(r.submission_id)!.push(r);
    }

    // Compute scores + filter by min_reviews
    const ranked: RankedSubmission[] = (submissions ?? [])
      .map((s: any) => {
        const sReviews = reviewsBySub.get(s.id) ?? [];
        const completeReviews = sReviews.filter((r: any) => r.is_complete);

        const avgInnovation   = avg(completeReviews.map((r: any) => r.score_innovation));
        const avgTechnical    = avg(completeReviews.map((r: any) => r.score_technical));
        const avgPresentation = avg(completeReviews.map((r: any) => r.score_presentation));
        const avgImpact       = avg(completeReviews.map((r: any) => r.score_impact));

        const totalScore = Math.round(
          (avgInnovation + avgTechnical + avgPresentation + avgImpact) * 100
        ) / 100;

        return {
          ...s,
          teams: teamMap.get(s.team_id) ?? null,
          judge_reviews: sReviews.map((r: any) => ({
            ...r,
            profiles: judgeMap.get(r.judge_id) ?? null,
          })),
          computed: {
            avg_innovation:   avgInnovation,
            avg_technical:    avgTechnical,
            avg_presentation: avgPresentation,
            avg_impact:       avgImpact,
            total_score:      totalScore,
            review_count:     completeReviews.length,
            rank:             0, // assigned below
          },
        };
      })
      .filter((s: any) => s.computed.review_count >= minReviews)
      // Sort by total score descending, then alphabetically by title
      .sort((a: any, b: any) => {
        if (b.computed.total_score !== a.computed.total_score) {
          return b.computed.total_score - a.computed.total_score;
        }
        return a.title.localeCompare(b.title);
      })
      // Assign rank (ties share the same rank)
      .map((s: any, idx: number, arr: any[]) => {
        const rank =
          idx > 0 && arr[idx - 1].computed.total_score === s.computed.total_score
            ? arr[idx - 1].computed.rank
            : idx + 1;
        return { ...s, computed: { ...s.computed, rank } };
      });

    logger.info('GET /api/admin/results', {
      total:    ranked.length,
      category: category ?? 'all',
    });

    return successResponse(ranked, {
      total:       ranked.length,
      category:    category ?? 'all',
      min_reviews: minReviews,
    });
  } catch (err) {
    console.error('GET /api/admin/results error:', err);
    logger.error('GET /api/admin/results', { error: err instanceof Error ? err.message : JSON.stringify(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
