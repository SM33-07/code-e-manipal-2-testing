import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, Errors } from "@/lib/utils/response";
import {
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "@/services/submissionService";
import { isValidUUID, sanitizeString, isValidUrl, sanitizeStringArray } from "@/lib/utils/validate";
import { logger } from "@/lib/utils/logger";

// ─── GET ONE (Authenticated) ───────────────────────────
export const GET = withAuth(async (req, { user, params }) => {
  const id = params?.id!;

  if (!isValidUUID(id)) {
    return Errors.BAD_REQUEST("Invalid submission ID format");
  }

  try {
    const submission = await getSubmissionById(id);
    if (!submission) return Errors.NOT_FOUND("Submission");

    logger.info('GET /api/submissions/[id]', { submissionId: id, userId: user.id });
    return successResponse(submission);
  } catch (err) {
    logger.error('GET /api/submissions/[id] failed', { error: String(err), id });
    return Errors.INTERNAL();
  }
});

// ─── UPDATE (Authenticated + Field Whitelist) ──────────
export const PUT = withAuth(async (req, { user, params }) => {
  const id = params?.id!;

  if (!isValidUUID(id)) {
    return Errors.BAD_REQUEST("Invalid submission ID format");
  }

  try {
    const existing = await getSubmissionById(id);
    if (!existing) return Errors.NOT_FOUND("Submission");

    const body = await req.json();

    // Build a validated update object with only allowed fields
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = sanitizeString(body.title, 200);
      if (!title) return Errors.BAD_REQUEST("title must be 1–200 characters");
      updates.title = title;
    }

    if (body.summary !== undefined) {
      const summary = sanitizeString(body.summary, 500);
      if (!summary) return Errors.BAD_REQUEST("summary must be 1–500 characters");
      updates.summary = summary;
    }

    if (body.category !== undefined) {
      const cat = typeof body.category === 'string' ? body.category.trim().toLowerCase() : '';
      if (!cat) return Errors.BAD_REQUEST("category cannot be empty");
      updates.category = cat;
    }

    if (body.technologies !== undefined) {
      updates.technologies = sanitizeStringArray(body.technologies);
    }

    if (body.github_url !== undefined) {
      if (body.github_url !== null && !isValidUrl(body.github_url)) {
        return Errors.BAD_REQUEST("github_url must be a valid URL");
      }
      updates.github_url = body.github_url;
    }

    if (body.demo_url !== undefined) {
      if (body.demo_url !== null && !isValidUrl(body.demo_url)) {
        return Errors.BAD_REQUEST("demo_url must be a valid URL");
      }
      updates.demo_url = body.demo_url;
    }

    if (body.docs_url !== undefined) {
      if (body.docs_url !== null && !isValidUrl(body.docs_url)) {
        return Errors.BAD_REQUEST("docs_url must be a valid URL");
      }
      updates.docs_url = body.docs_url;
    }

    if (Object.keys(updates).length === 0) {
      return Errors.BAD_REQUEST("No valid fields to update");
    }

    const updated = await updateSubmission(id, updates);
    logger.info('PUT /api/submissions/[id]', { submissionId: id, userId: user.id });
    return successResponse(updated);
  } catch (err) {
    logger.error('PUT /api/submissions/[id] failed', { error: String(err), id });
    return Errors.INTERNAL();
  }
});

// ─── DELETE (Admin only) ────────────────────────────────
export const DELETE = withAuth(async (_req, { user, profile, params }) => {
  const id = params?.id!;

  if (!isValidUUID(id)) {
    return Errors.BAD_REQUEST("Invalid submission ID format");
  }

  try {
    const existing = await getSubmissionById(id);
    if (!existing) return Errors.NOT_FOUND("Submission");

    await deleteSubmission(id);
    logger.info('DELETE /api/submissions/[id]', { submissionId: id, userId: user.id, role: profile.role });
    return successResponse({ message: "Deleted" });
  } catch (err) {
    logger.error('DELETE /api/submissions/[id] failed', { error: String(err), id });
    return Errors.INTERNAL();
  }
}, 'admin');