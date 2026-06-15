import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, Errors } from "@/lib/utils/response";
import {
  listSubmissions,
  createSubmission,
} from "@/services/submissionService";
import { getTeamByUserId, createTeam } from "@/services/teamService";

// ─── GET ALL ───────────────────────────
export async function GET() {
  try {
    const { submissions, total } = await listSubmissions(
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
    
    // Auto-resolve team
    let teamId = body.team_id;
    if (!teamId && user) {
      const userTeam = await getTeamByUserId(user.id);
      if (userTeam) {
        teamId = userTeam.id;
      } else if (body.teamName) {
        const newTeam = await createTeam(body.teamName, user.id);
        teamId = newTeam.id;
      } else {
         return Errors.BAD_REQUEST("You must be part of a team or provide a teamName to submit.");
      }
    }
    
    body.team_id = teamId;
    const submission = await createSubmission(body);

    return successResponse(submission, undefined, 201);
  } catch (err) {
    console.error("🔥 POST ERROR:", err);
    return Errors.INTERNAL();
  }
});