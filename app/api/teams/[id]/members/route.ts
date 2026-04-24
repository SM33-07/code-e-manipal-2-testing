import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, Errors } from '@/lib/utils/response';
import { getTeamMembers, removeTeamMember } from '@/services/teamService';
import { isValidUUID } from '@/lib/utils/validate';
import { logger } from '@/lib/utils/logger';

type Ctx = { params: { id: string } };

/**
 * GET /api/teams/:id/members
 * Public — lists all members of a team with their profiles.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    if (!isValidUUID(params.id)) return Errors.BAD_REQUEST('Invalid team ID');

    const supabase = createSupabaseServerClient();
    const members  = await getTeamMembers(supabase, params.id);

    return successResponse(members);
  } catch (err) {
    logger.error('GET /api/teams/[id]/members', { error: String(err), id: params.id });
    return Errors.INTERNAL();
  }
}

/**
 * DELETE /api/teams/:id/members
 * Authenticated — remove a member from the team.
 *
 * Rules:
 *  - A user can always remove themselves (leave the team).
 *  - Only the team leader can remove other members.
 *  - The leader cannot remove themselves (transfer first).
 *
 * Body: { target_user_id?: string }  — omit to remove self
 */
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
    const teamId = params!.id;
    if (!isValidUUID(teamId)) return Errors.BAD_REQUEST('Invalid team ID');

    const body = await req.json().catch(() => ({}));
    const targetUserId: string = body.target_user_id ?? user.id;

    if (!isValidUUID(targetUserId)) return Errors.BAD_REQUEST('Invalid target_user_id');

    const supabase = createSupabaseServerClient();

    // Fetch the requester's membership
    const { data: myMembership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!myMembership) return Errors.FORBIDDEN();

    const isSelf   = targetUserId === user.id;
    const isLeader = myMembership.role === 'leader';

    // Leaders cannot remove themselves — they must transfer leadership first
    if (isSelf && isLeader) {
      return Errors.BAD_REQUEST(
        'Team leader cannot leave without transferring leadership first'
      );
    }

    // Only leaders can remove others
    if (!isSelf && !isLeader) return Errors.FORBIDDEN();

    // Verify target is actually in the team
    const { data: targetMembership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', targetUserId)
      .single();

    if (!targetMembership) return Errors.NOT_FOUND('Team member');

    await removeTeamMember(supabase, teamId, targetUserId);

    logger.info('DELETE /api/teams/[id]/members', {
      teamId,
      removedUserId: targetUserId,
      removedBy:     user.id,
    });

    return successResponse({ removed: true, user_id: targetUserId });

  } catch (err) {
    logger.error('DELETE /api/teams/[id]/members', { error: String(err) });
    return Errors.INTERNAL();
  }
});
