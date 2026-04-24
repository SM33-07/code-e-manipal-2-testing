import { SupabaseClient } from "@supabase/supabase-js";

// ─── LIST ─────────────────────────────
export async function listSubmissions(
  supabase: SupabaseClient,
  { limit, offset }: { limit: number; offset: number },
  filters: any
) {
  let query = supabase
    .from("submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    submissions: data || [],
    total: count || 0,
  };
}

// ─── GET BY ID ─────────────────────────
export async function getSubmissionById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

// ─── CREATE ────────────────────────────
export async function createSubmission(
  supabase: SupabaseClient,
  input: any
) {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      team_id: input.team_id,
      title: input.title,
      summary: input.summary,
      category: input.category,
      technologies: input.technologies || [],
      github_url: input.github_url,
      demo_url: input.demo_url,
      docs_url: input.docs_url,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ─── UPDATE ────────────────────────────
export async function updateSubmission(
  supabase: SupabaseClient,
  id: string,
  input: any
) {
  const { data, error } = await supabase
    .from("submissions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ─── DELETE (HARD) ─────────────────────
export async function deleteSubmission(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}