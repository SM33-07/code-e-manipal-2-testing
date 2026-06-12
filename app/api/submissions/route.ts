import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, Errors } from "@/lib/utils/response";
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

    return Errors.INTERNAL();
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

    return Errors.INTERNAL();
  }
});