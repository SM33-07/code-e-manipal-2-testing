import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { query } from '@/lib/db';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/judging/assignments
 * Judge/Admin — returns the current judge's assigned submissions
 * with a `reviewed` boolean based on whether this judge has submitted a review.
 */
export const GET = withAuth(async (req, { user, profile }) => {
  try {
    const isAdmin = profile?.role === 'admin';

    let sql = '';
    const params = [user.id];

    if (isAdmin) {
      // Admins see all submissions
      sql = `
        SELECT 
          $1::uuid AS judge_id,
          s.id AS submission_id,
          json_build_object(
            'id', s.id,
            'title', s.title,
            'summary', s.summary,
            'description', s.description,
            'category', s.category,
            'technologies', s.technologies,
            'github_url', s.github_url,
            'demo_url', s.demo_url,
            'docs_url', s.docs_url,
            'demo_video_url', s.demo_video_url,
            'status', s.status,
            'submitted_at', s.submitted_at,
            'created_at', s.created_at,
            'updated_at', s.updated_at
          ) AS submissions,
          EXISTS(
            SELECT 1 FROM public.judge_reviews jr
            WHERE jr.submission_id = s.id AND jr.judge_id = $1
          ) AS reviewed
        FROM public.submissions s
        WHERE s.deleted_at IS NULL
        ORDER BY s.created_at DESC;
      `;
    } else {
      // Judges only see assigned submissions
      sql = `
        SELECT 
          ja.judge_id,
          ja.submission_id,
          ja.assigned_at,
          json_build_object(
            'id', s.id,
            'title', s.title,
            'summary', s.summary,
            'description', s.description,
            'category', s.category,
            'technologies', s.technologies,
            'github_url', s.github_url,
            'demo_url', s.demo_url,
            'docs_url', s.docs_url,
            'demo_video_url', s.demo_video_url,
            'status', s.status,
            'submitted_at', s.submitted_at,
            'created_at', s.created_at,
            'updated_at', s.updated_at
          ) AS submissions,
          EXISTS(
            SELECT 1 FROM public.judge_reviews jr
            WHERE jr.submission_id = ja.submission_id AND jr.judge_id = ja.judge_id
          ) AS reviewed
        FROM public.judge_assignments ja
        JOIN public.submissions s ON s.id = ja.submission_id
        WHERE ja.judge_id = $1 AND s.deleted_at IS NULL
        ORDER BY ja.assigned_at DESC;
      `;
    }

    const { rows } = await query(sql, params);

    // Optional status filter
    const status = req.nextUrl.searchParams.get('status');
    const filtered = status
      ? rows.filter(i => i.submissions?.status === status)
      : rows;

    logger.info('GET /api/judging/assignments', {
      userId: user.id,
      total:  filtered.length,
    });

    return successResponse(filtered, {
      total:     filtered.length,
      completed: filtered.filter((i: any) => i.reviewed).length,
    });
  } catch (err) {
    logger.error('GET /api/judging/assignments', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'judge');
