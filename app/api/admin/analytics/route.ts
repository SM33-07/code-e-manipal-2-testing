import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getAnalytics } from '@/services/analyticsService';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/analytics
 * Admin only — returns aggregate dashboard stats:
 *  - submission counts by status and category
 *  - team + judge counts
 *  - average scores across all completed reviews
 *  - review completion progress
 */
export const GET = withAuth(async () => {
  try {
    const analytics = await getAnalytics();

    logger.info('GET /api/admin/analytics', {
      total_submissions: analytics.total_submissions,
      reviewed_count:    analytics.reviewed_count,
    });

    return successResponse(analytics);
  } catch (err) {
    logger.error('GET /api/admin/analytics', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
