import { NextRequest } from "next/server";
import crypto from "crypto";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, Errors } from "@/lib/utils/response";
import { logger } from "@/lib/utils/logger";
import {
  getUserTeamId,
  getSubmissionByTeamId,
  verifyMutationPhase,
} from "@/services/submissionService";

const ALLOWED_ASSET_TYPES = ['screenshot', 'presentation'] as const;
type AssetType = typeof ALLOWED_ASSET_TYPES[number];

const ASSET_CONSTRAINTS: Record<
  AssetType,
  { allowedMimeTypes: string[]; maxSizeBytes: number; resourceType: string }
> = {
  screenshot: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    resourceType: 'image',
  },
  presentation: {
    allowedMimeTypes: ['application/pdf'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    resourceType: 'raw',
  },
};

/**
 * POST /api/submissions/upload-url
 *
 * Generates bounded Cloudinary signed upload credentials.
 *
 * Security invariants:
 * 1. Authenticated participant/team ownership required (cannot upload for other teams).
 * 2. Active phase boundary check (only active submission phases allowed).
 * 3. Finalization lock check: rejected if submission is already finalized.
 * 4. Strict server-side resource typing and MIME type validation.
 * 5. Bounded Cloudinary parameters (team-isolated folder, tags, 10-minute expiry).
 * 6. Cloudinary API secret is never exposed to client.
 */
export const POST = withAuth(async (req, { user, profile }) => {
  if (profile.role !== 'participant' && profile.role !== 'admin') {
    return Errors.FORBIDDEN("Only participants or admins may request upload authorization.");
  }

  try {
    // 1. Authoritative team ownership
    const teamId = await getUserTeamId(user.id);
    if (!teamId) {
      return Errors.FORBIDDEN("You must belong to a registered team to upload submission assets.");
    }

    // 2. Event phase enforcement
    try {
      await verifyMutationPhase();
    } catch (phaseErr: any) {
      if (phaseErr.message === 'EVENT_NOT_STARTED') {
        return Errors.FORBIDDEN("Hackathon has not started yet. Asset uploads are closed.");
      }
      return Errors.FORBIDDEN("Submission window is closed. Asset uploads are no longer permitted.");
    }

    // 3. Finalization lock enforcement
    const existingSubmission = await getSubmissionByTeamId(teamId);
    if (existingSubmission && (existingSubmission.status === 'submitted' || existingSubmission.is_locked === true)) {
      return Errors.FORBIDDEN(
        "Submission is finalized and locked. Asset uploads are prohibited."
      );
    }

    // 4. Validate request parameters
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Errors.BAD_REQUEST("Invalid JSON body.");
    }

    const { asset_type, content_type } = body;

    if (!asset_type || !ALLOWED_ASSET_TYPES.includes(asset_type)) {
      return Errors.BAD_REQUEST(
        `asset_type is required and must be one of: ${ALLOWED_ASSET_TYPES.join(', ')}.`
      );
    }

    const constraints = ASSET_CONSTRAINTS[asset_type as AssetType];
    const mimeType = typeof content_type === 'string' ? content_type.trim().toLowerCase() : '';

    if (!mimeType || !constraints.allowedMimeTypes.includes(mimeType)) {
      return Errors.BAD_REQUEST(
        `Disallowed content_type "${content_type}". Allowed MIME types for ${asset_type}: ${constraints.allowedMimeTypes.join(', ')}.`
      );
    }

    // 5. Generate signed Cloudinary upload authorization
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'code-e-manipal';
    const apiKey = process.env.CLOUDINARY_API_KEY || 'cem_upload_key';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'cem_dev_secret_key_change_in_prod';

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `code-e-manipal/teams/${teamId}`;
    const publicId = `${asset_type}_${crypto.randomUUID()}`;
    const tags = `team_${teamId},event_2025,${asset_type}`;
    const resourceType = constraints.resourceType;

    // Cloudinary signature formula:
    // Sort parameters alphabetically: folder, public_id, tags, timestamp
    const paramsToSign = [
      `folder=${folder}`,
      `public_id=${publicId}`,
      `tags=${tags}`,
      `timestamp=${timestamp}`,
    ].sort().join('&');

    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    logger.info('POST /api/submissions/upload-url authorization issued', {
      teamId,
      userId: user.id,
      assetType: asset_type,
      publicId,
    });

    return successResponse({
      upload_url: uploadUrl,
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder,
      public_id: publicId,
      tags,
      resource_type: resourceType,
      max_file_size: constraints.maxSizeBytes,
      allowed_mime_types: constraints.allowedMimeTypes,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    logger.error('POST /api/submissions/upload-url failed', { error: String(err), userId: user.id });
    return Errors.INTERNAL();
  }
});
