import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getTeamById, updateTeam } from '@/services/teamService';
import { sanitizeString, isValidUUID } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

type Ctx = { params: { id: string } };

/**
 * GET /api/teams/:id
 * Public — returns team details with members.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    if (!isValidUUID(id)) return Errors.BAD_REQUEST('Invalid team ID');

    const supabase = await createSupabaseServerClient();
    const team = await getTeamById(supabase, id);

    if (!team) return Errors.NOT_FOUND('Team');

    return successResponse(team);
  } catch (err) {
    logger.error('GET /api/teams/[id]', { error: String(err), id });
    return Errors.INTERNAL();
  }
}

/**
 * PUT /api/teams/:id
 * Authenticated — only the team leader can update the team name.
 *
 * Body: { name: string }
 */
export const PUT = withAuth(async (req, { user, params }) => {
  try {
    const id = params!.id;
    if (!isValidUUID(id)) return Errors.BAD_REQUEST('Invalid team ID');

    const supabase = await createSupabaseServerClient();

    // Verify the requester is a leader of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership)               return Errors.FORBIDDEN();
    if (membership.role !== 'leader') return Errors.FORBIDDEN();

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = sanitizeString(body.name, 100);
      if (!name) return Errors.BAD_REQUEST('name must be 1–100 characters');
      updates.name = name;
    }

    if (body.is_locked !== undefined) {
      updates.is_locked = Boolean(body.is_locked);
    }

    if (Object.keys(updates).length === 0) {
      return Errors.BAD_REQUEST('No valid fields to update');
    }

    const team = await updateTeam(supabase, id, updates);
    logger.info('PUT /api/teams/[id]', { teamId: id, userId: user.id });
    return successResponse(team);

  } catch (err) {
    logger.error('PUT /api/teams/[id]', { error: String(err) });
    return Errors.INTERNAL();
  }
});

/**
 * DELETE /api/teams/:id
 * Authenticated — only the team leader can disband the team.
 * Only allowed when the leader is the only remaining member.
 */
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const id = params!.id;
    if (!isValidUUID(id)) return Errors.BAD_REQUEST('Invalid team ID');

    const supabase = await createSupabaseServerClient();

    // Verify the requester is a leader of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', user.id)
      .single();

    if (!membership)               return Errors.FORBIDDEN();
    if (membership.role !== 'leader') return Errors.FORBIDDEN();

    // Count total members
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', id);

    if (count && count > 1) {
      return Errors.BAD_REQUEST('Cannot disband team with other members. Remove them first.');
    }

    // Delete the team (cascades to team_members)
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;

    logger.info('DELETE /api/teams/[id]', { teamId: id, userId: user.id });
    return successResponse({ disbanded: true });

  } catch (err) {
    logger.error('DELETE /api/teams/[id]', { error: String(err) });
    return Errors.INTERNAL();
  }
});
