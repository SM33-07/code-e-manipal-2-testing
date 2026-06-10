import type { SupabaseClient } from '@supabase/supabase-js';

export async function listPosts(
  supabase: SupabaseClient,
  { limit, offset }: { limit: number; offset: number }
) {
  const query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    posts: data || [],
    total: count || 0,
  };
}

export async function createPost(
  supabase: SupabaseClient,
  input: { title: string; content: string; userId: string }
) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: input.title,
      content: input.content,
      user_id: input.userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPostById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function updatePost(
  supabase: SupabaseClient,
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeletePost(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function hardDeletePost(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
