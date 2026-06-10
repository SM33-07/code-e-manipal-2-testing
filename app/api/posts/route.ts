import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { listPosts, createPost } from '@/services/postService';
import { logger } from '@/lib/utils/logger';

// ─────────────────────────────────────────────
// GET /api/posts?limit=10&offset=0
// Public endpoint — lists all non-deleted posts
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit  = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '10'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);

    const supabase = await createSupabaseServerClient();
    const { posts, total } = await listPosts(supabase, { limit, offset });

    logger.info('GET /api/posts', { limit, offset, returned: posts.length });

    return successResponse(posts, {
      pagination: { limit, offset, total, hasMore: offset + limit < total },
    });
  } catch (err) {
    logger.error('GET /api/posts failed', { error: String(err) });
    return Errors.INTERNAL();
  }
}

// ─────────────────────────────────────────────
// POST /api/posts — Authenticated
// ─────────────────────────────────────────────
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title?.trim() || !content?.trim()) {
      return Errors.BAD_REQUEST('title and content are required');
    }
    if (title.length > 300) {
      return Errors.BAD_REQUEST('title must be 300 characters or fewer');
    }

    const supabase = await createSupabaseServerClient();
    const post = await createPost(supabase, { title: title.trim(), content: content.trim(), userId: user.id });

    logger.info('POST /api/posts', { postId: post.id, userId: user.id });
    return successResponse(post, undefined, 201);
  } catch (err) {
    logger.error('POST /api/posts failed', { error: String(err) });
    return Errors.INTERNAL();
  }
});