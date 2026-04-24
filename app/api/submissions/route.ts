import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse } from "@/lib/utils/response";
import {
  listSubmissions,
  createSubmission,
} from "@/services/submissionService";

// ─── GET ALL ───────────────────────────
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { submissions, total } = await listSubmissions(
      supabase,
      { limit: 20, offset: 0 },
      {}
    );

    return successResponse(submissions, { total });
  } catch (err) {
    console.error("🔥 GET ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
}

// ─── CREATE ────────────────────────────
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();

    const supabase = await createSupabaseServerClient();

    const submission = await createSubmission(supabase, body);

    return successResponse(submission, undefined, 201);
  } catch (err) {
    console.error("🔥 POST ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
});