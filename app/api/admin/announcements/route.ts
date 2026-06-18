import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import {
  listAnnouncements,
  createAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement
} from '@/services/announcementService';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/announcements
 * Admin only — list all announcements.
 */
export const GET = withAuth(async (req) => {
  try {
    const list = await listAnnouncements();
    return successResponse(list);
  } catch (err) {
    logger.error('GET /api/admin/announcements', { error: String(err) });
    return Errors.INTERNAL('Failed to retrieve announcements list.');
  }
}, 'admin');

/**
 * POST /api/admin/announcements
 * Admin only — create a new announcement.
 * Body: { content: string, type: 'info' | 'warning' | 'urgent' | 'success' }
 */
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { content, type } = body;

    if (!content?.trim()) {
      return Errors.BAD_REQUEST('Content is required');
    }
    if (!['info', 'warning', 'urgent', 'success'].includes(type)) {
      return Errors.BAD_REQUEST('Invalid announcement type');
    }

    const announcement = await createAnnouncement(content.trim(), type, user.id);
    logger.info('Announcement created by admin', { id: announcement.id, creatorId: user.id });
    return successResponse(announcement, {}, 201);
  } catch (err) {
    logger.error('POST /api/admin/announcements', { error: String(err) });
    return Errors.INTERNAL('Failed to create announcement.');
  }
}, 'admin');

/**
 * PATCH /api/admin/announcements
 * Admin only — toggle announcement active state or delete.
 * Body: { id: string, is_active?: boolean, action?: 'delete' }
 */
export const PATCH = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { id, is_active, action } = body;

    if (!id) {
      return Errors.BAD_REQUEST('Announcement ID is required');
    }

    if (action === 'delete') {
      await deleteAnnouncement(id);
      logger.info('Announcement deleted by admin', { id });
      return successResponse({ deleted: true });
    }

    if (typeof is_active !== 'boolean') {
      return Errors.BAD_REQUEST('is_active status is required');
    }

    const updated = await toggleAnnouncementActive(id, is_active);
    logger.info('Announcement toggle active by admin', { id, is_active });
    return successResponse(updated);
  } catch (err) {
    logger.error('PATCH /api/admin/announcements', { error: String(err) });
    return Errors.INTERNAL('Failed to update announcement.');
  }
}, 'admin');
