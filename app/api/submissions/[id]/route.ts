import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse } from "@/lib/utils/response";
import {
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "@/services/submissionService";

// ─── GET ONE ───────────────────────────
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();

    const submission = await getSubmissionById(supabase, id);

    return successResponse(submission);
  } catch (err) {
    console.error("🔥 GET BY ID ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
}

// ─── UPDATE ────────────────────────────
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    const updated = await updateSubmission(supabase, id, body);

    return successResponse(updated);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
}

// ─── DELETE ────────────────────────────
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();

    await deleteSubmission(supabase, id);

    return successResponse({ message: "Deleted" });
  } catch (err) {
    console.error("🔥 DELETE ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
}