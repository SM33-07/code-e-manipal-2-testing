import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, Errors } from "@/lib/utils/response";
import {
  listSubmissions,
  createSubmission,
} from "@/services/submissionService";
import { getTeamByUserId, createTeam } from "@/services/teamService";
import { sanitizeString, isValidUrl, sanitizeStringArray } from "@/lib/utils/validate";
import { logger } from "@/lib/utils/logger";

// Valid submission categories
const VALID_CATEGORIES = ['web', 'mobile', 'ai-ml', 'blockchain', 'iot', 'game', 'other'];

// ─── GET ALL (Authenticated) ───────────────────────────
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '20'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const { submissions, total } = await listSubmissions(
      { limit, offset },
      { category, search }
    );

    logger.info('GET /api/submissions', { limit, offset, returned: submissions.length });
    return successResponse(submissions, { total });
  } catch (err) {
    logger.error('GET /api/submissions failed', { error: String(err) });
    return Errors.INTERNAL();
  }
});

// ─── CREATE (Authenticated + Validated) ────────────────
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();

    // ── Validate title ──
    const title = sanitizeString(body.title, 200);
    if (!title) {
      return Errors.BAD_REQUEST("title is required and must be 1–200 characters");
    }

    // ── Validate summary ──
    const summary = sanitizeString(body.summary, 500);
    if (!summary) {
      return Errors.BAD_REQUEST("summary is required and must be 1–500 characters");
    }

    // ── Validate category ──
    const category = typeof body.category === 'string' ? body.category.trim().toLowerCase() : '';
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return Errors.BAD_REQUEST(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // ── Validate URLs (optional but must be valid if provided) ──
    const github_url = body.github_url || null;
    const demo_url = body.demo_url || null;
    const docs_url = body.docs_url || null;

    if (github_url && !isValidUrl(github_url)) {
      return Errors.BAD_REQUEST("github_url must be a valid URL");
    }
    if (demo_url && !isValidUrl(demo_url)) {
      return Errors.BAD_REQUEST("demo_url must be a valid URL");
    }
    if (docs_url && !isValidUrl(docs_url)) {
      return Errors.BAD_REQUEST("docs_url must be a valid URL");
    }

    // ── Validate technologies ──
    const technologies = sanitizeStringArray(body.technologies);

    // ── Auto-resolve team ──
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

    const submission = await createSubmission({
      team_id: teamId,
      title,
      summary,
      category,
      technologies,
      github_url,
      demo_url,
      docs_url,
    });

    logger.info('POST /api/submissions', { submissionId: submission.id, userId: user.id });
    return successResponse(submission, undefined, 201);
  } catch (err) {
    logger.error('POST /api/submissions failed', { error: String(err) });
    return Errors.INTERNAL();
  }
});