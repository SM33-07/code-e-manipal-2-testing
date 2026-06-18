import { query } from '@/lib/db';

export interface Announcement {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  creator_name?: string;
}

/**
 * Get the latest active announcement
 */
export async function getLatestActiveAnnouncement(): Promise<Announcement | null> {
  const { rows } = await query(
    'SELECT * FROM public.announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
  );
  return rows[0] || null;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
  content: string,
  type: string,
  userId: string
): Promise<Announcement> {
  const { rows } = await query(
    `INSERT INTO public.announcements (content, type, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [content, type, userId]
  );
  return rows[0];
}

/**
 * List all announcements with creator profiles
 */
export async function listAnnouncements(): Promise<Announcement[]> {
  const { rows } = await query(
    `SELECT a.*, p.name AS creator_name
     FROM public.announcements a
     LEFT JOIN public.profiles p ON p.id = a.created_by
     ORDER BY a.created_at DESC`
  );
  return rows;
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementActive(
  id: string,
  isActive: boolean
): Promise<Announcement> {
  const { rows } = await query(
    'UPDATE public.announcements SET is_active = $2 WHERE id = $1 RETURNING *',
    [id, isActive]
  );
  return rows[0];
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  await query('DELETE FROM public.announcements WHERE id = $1', [id]);
}
