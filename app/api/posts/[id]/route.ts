import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getPostById, updatePost, softDeletePost, hardDeletePost } from '@/services/postService';
import { logger } from '@/lib/utils/logger';

type Ctx = { params: { id: string } };

// ─────────────────────────────────────────────
// GET /api/posts/:id — Public
// ─────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();
    const post = await getPostById(supabase, id);

    if (!post) return Errors.NOT_FOUND('Post');

    return successResponse(post);
  } catch (err) {
    logger.error('GET /api/posts/[id] failed', { error: String(err), id: params.id });
    return Errors.INTERNAL();
  }
}

// ─────────────────────────────────────────────
// PUT /api/posts/:id — Owner only
// ─────────────────────────────────────────────
export const PUT = withAuth(async (req, { user, params }) => {
  const id = params?.id!;
  try {
    const supabase = await createSupabaseServerClient();
    const existing = await getPostById(supabase, id);

    if (!existing) return Errors.NOT_FOUND('Post');
    if (existing.user_id !== user.id) return Errors.FORBIDDEN();

    const body = await req.json();
    const { title, content } = body;

    if (title !== undefined && (!title.trim() || title.length > 300)) {
      return Errors.BAD_REQUEST('title must be 1–300 characters');
    }
    if (content !== undefined && !content.trim()) {
      return Errors.BAD_REQUEST('content cannot be empty');
    }

    const updated = await updatePost(supabase, id, {
      ...(title   && { title:   title.trim() }),
      ...(content && { content: content.trim() }),
    });

    logger.info('PUT /api/posts/[id]', { postId: id, userId: user.id });
    return successResponse(updated);
  } catch (err) {
    logger.error('PUT /api/posts/[id] failed', { error: String(err), id });
    return Errors.INTERNAL();
  }
});

// ─────────────────────────────────────────────
// DELETE /api/posts/:id — Owner (soft) or Admin (hard)
// ─────────────────────────────────────────────
export const DELETE = withAuth(async (_req, { user, profile, params }) => {
  const id = params?.id!;
  try {
    const supabase = await createSupabaseServerClient();
    const existing = await getPostById(supabase, id);

    if (!existing) return Errors.NOT_FOUND('Post');

    const isOwner = existing.user_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isOwner && !isAdmin) return Errors.FORBIDDEN();

    if (isAdmin) {
      // Admins can hard-delete using the service role client
      const adminClient = await createSupabaseAdminClient();
      await hardDeletePost(adminClient, id);
      logger.info('DELETE /api/posts/[id] (hard)', { postId: id, adminId: user.id });
    } else {
      // Owners get a soft delete
      await softDeletePost(supabase, id);
      logger.info('DELETE /api/posts/[id] (soft)', { postId: id, userId: user.id });
    }

    return successResponse({ id, deleted: true });
  } catch (err) {
    logger.error('DELETE /api/posts/[id] failed', { error: String(err), id });
    return Errors.INTERNAL();
  }
});