import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { getLatestActiveAnnouncement } from '@/services/announcementService';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/announcements
 * Retrieve the latest active announcement.
 * Role requirement: participant or higher (any logged in user).
 */
export const GET = withAuth(async (req) => {
  try {
    const announcement = await getLatestActiveAnnouncement();
    return successResponse(announcement);
  } catch (err) {
    logger.error('GET /api/announcements', { error: String(err) });
    return Errors.INTERNAL('Failed to fetch announcements.');
  }
}, 'participant');
