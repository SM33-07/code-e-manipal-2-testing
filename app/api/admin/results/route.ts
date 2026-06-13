import { withAuth } from '@/lib/middleware/withAuth';
import { query } from '@/lib/db';
import { successResponse, Errors } from '@/lib/utils/response';
import { getCached, setCached } from '@/lib/utils/cache';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/results
 * Admin only — returns all reviewed submissions ranked by average total score.
 *
 * Query params:
 *   category    — filter by category
 *   min_reviews — only include submissions with at least N complete reviews (default 1)
 */
export const GET = withAuth(async (req) => {
  try {
    const p = req.nextUrl.searchParams;
    const category = p.get('category') || null;
    const minReviews = Math.max(parseInt(p.get('min_reviews') ?? '1'), 1);

    const cacheKey = `results:${category ?? 'all'}:${minReviews}`;
    const cached = getCached<{ data: any; meta: any }>(cacheKey);
    if (cached) {
      return successResponse(cached.data, cached.meta);
    }

    const { rows } = await query(
      'SELECT * FROM public.get_ranked_results($1, $2)',
      [category, minReviews]
    );

    const ranked = (rows ?? []).map((row: any) => ({
      id: row.submission_id,
      title: row.title,
      summary: row.summary,
      category: row.category,
      status: row.status,
      created_at: row.created_at,
      team_id: row.team_id,
      teams: { id: row.team_id, name: row.team_name, hackathon: '' },
      computed: {
        avg_innovation: Number(row.avg_innovation),
        avg_technical: Number(row.avg_technical),
        avg_presentation: Number(row.avg_presentation),
        avg_impact: Number(row.avg_impact),
        total_score: Number(row.total_score),
        review_count: Number(row.review_count),
        rank: Number(row.rank_num),
      },
    }));

    const meta = {
      total: ranked.length,
      category: category ?? 'all',
      min_reviews: minReviews,
    };

    setCached(cacheKey, { data: ranked, meta }, 30_000);

    logger.info('GET /api/admin/results', {
      total: ranked.length,
      category: category ?? 'all',
    });

    return successResponse(ranked, meta);
  } catch (err) {
    logger.error('GET /api/admin/results', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');