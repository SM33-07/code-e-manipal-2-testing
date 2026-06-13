import { query } from '@/lib/db';

/**
 * List all non-deleted posts with pagination
 */
export async function listPosts({ limit, offset }: { limit: number; offset: number }) {
  const { rows } = await query(
    'SELECT COUNT(*) OVER()::int AS total_count, * FROM public.posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  const posts = rows.map((r: any) => {
    const { total_count, ...post } = r;
    return post;
  });

  return {
    posts,
    total,
  };
}

/**
 * Create a new announcement post
 */
export async function createPost(input: { title: string; content: string; userId: string }) {
  const { rows } = await query(
    'INSERT INTO public.posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
    [input.title, input.content, input.userId]
  );
  return rows[0];
}

/**
 * Retrieve a post by ID
 */
export async function getPostById(id: string) {
  const { rows } = await query('SELECT * FROM public.posts WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
}

/**
 * Update an existing post
 */
export async function updatePost(id: string, updates: Record<string, unknown>) {
  const keys = Object.keys(updates);
  if (keys.length === 0) {
    return getPostById(id);
  }

  const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
  const values = keys.map((key) => updates[key]);

  const { rows } = await query(
    `UPDATE public.posts SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0];
}

/**
 * Soft delete a post (owner action)
 */
export async function softDeletePost(id: string) {
  await query('UPDATE public.posts SET deleted_at = NOW() WHERE id = $1', [id]);
}

/**
 * Hard delete a post (admin action)
 */
export async function hardDeletePost(id: string) {
  await query('DELETE FROM public.posts WHERE id = $1', [id]);
}
