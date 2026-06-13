import { query } from '@/lib/db';
import type { AnalyticsData } from '@/types';

interface CategoryCount { category: string; count: number; }
interface StatusCount { status: string; count: number; }
interface AvgScore { avg_innovation: number; avg_technical: number; avg_presentation: number; avg_impact: number; total_reviews: number; }

export async function getAnalytics(): Promise<AnalyticsData> {
  const [catResult, statusResult, teamResult, scoreResult] = await Promise.all([
    query<CategoryCount>('SELECT * FROM public.get_category_counts()'),
    query<StatusCount>('SELECT * FROM public.get_status_counts()'),
    query('SELECT COUNT(*)::int AS count FROM public.teams'),
    query<AvgScore>('SELECT * FROM public.get_avg_scores()'),
  ]);

  const categories = catResult.rows;
  const statuses = statusResult.rows;
  const teamCount = Number(teamResult.rows[0]?.count ?? 0);
  const scores = scoreResult.rows[0];

  const category_breakdown: Record<string, number> = {};
  for (const c of categories) {
    category_breakdown[c.category] = Number(c.count);
  }

  const totalSubmissions = statuses.reduce((sum: number, s: StatusCount) => sum + Number(s.count), 0);
  const submittedCount = statuses
    .filter((s: StatusCount) => s.status !== 'draft')
    .reduce((sum: number, s: StatusCount) => sum + Number(s.count), 0);
  const reviewedCount = Number(
    statuses.find((s: StatusCount) => s.status === 'reviewed')?.count ?? 0
  );

  return {
    total_submissions: totalSubmissions,
    submitted_count: submittedCount,
    reviewed_count: reviewedCount,
    total_teams: teamCount,
    category_breakdown,
    avg_scores: {
      innovation: scores ? Number(scores.avg_innovation) : 0,
      technical: scores ? Number(scores.avg_technical) : 0,
      presentation: scores ? Number(scores.avg_presentation) : 0,
      impact: scores ? Number(scores.avg_impact) : 0,
    },
  };
}