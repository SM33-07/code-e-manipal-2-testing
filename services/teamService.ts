import { query } from '@/lib/db';
import type { Team } from '@/types';

/**
 * Get team details by ID (including members)
 */
export async function getTeamById(id: string): Promise<Team | null> {
  const teamRes = await query('SELECT * FROM public.teams WHERE id = $1', [id]);
  const team = teamRes.rows[0];
  if (!team) return null;

  const membersRes = await query('SELECT * FROM public.team_members WHERE team_id = $1', [id]);
  team.team_members = membersRes.rows;
  return team as Team;
}

/**
 * Get team details by associated user ID
 */
export async function getTeamByUserId(userId: string): Promise<Team | null> {
  const memberRes = await query(
    'SELECT team_id FROM public.team_members WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const member = memberRes.rows[0];
  if (!member) return null;

  return getTeamById(member.team_id);
}

/**
 * Create a new team and add the user as leader
 */
export async function createTeam(name: string, userId: string): Promise<Team> {
  // Clean up any stale team_members records for this user (ensure they can join a new one)
  await query('DELETE FROM public.team_members WHERE user_id = $1', [userId]);

  // Insert the team
  const teamRes = await query(
    'INSERT INTO public.teams (name, created_by) VALUES ($1, $2) RETURNING *',
    [name, userId]
  );
  const team = teamRes.rows[0];

  // Insert the creator as the leader
  await query(
    "INSERT INTO public.team_members (team_id, user_id, role) VALUES ($1, $2, 'leader')",
    [team.id, userId]
  );

  const refreshed = await getTeamById(team.id);
  return refreshed || (team as Team);
}

/**
 * Join an existing team by invite code
 */
export async function joinTeamByInviteCode(inviteCode: string, userId: string): Promise<Team> {
  const teamRes = await query(
    'SELECT id, name, invite_code, created_by FROM public.teams WHERE invite_code = $1',
    [inviteCode]
  );
  const team = teamRes.rows[0];
  if (!team) throw new Error('INVALID_INVITE_CODE');

  // Verify member capacity (limit to 4)
  const membersRes = await query('SELECT user_id FROM public.team_members WHERE team_id = $1', [team.id]);
  const members = membersRes.rows;

  if (members && members.length >= 4) {
    throw new Error('TEAM_FULL');
  }

  const alreadyInTeam = members?.some((m: any) => m.user_id === userId);
  if (alreadyInTeam) throw new Error('ALREADY_IN_TEAM');

  // Insert member
  await query(
    "INSERT INTO public.team_members (team_id, user_id, role) VALUES ($1, $2, 'member')",
    [team.id, userId]
  );

  const updatedTeam = await getTeamById(team.id);
  if (!updatedTeam) throw new Error('Failed to retrieve updated team details');

  return updatedTeam;
}

/**
 * Update team settings
 */
export async function updateTeam(
  id: string,
  updates: Partial<Pick<Team, 'name' | 'is_locked'>>
): Promise<Team> {
  const keys = Object.keys(updates);
  if (keys.length === 0) {
    const current = await getTeamById(id);
    if (!current) throw new Error('Team not found');
    return current;
  }

  const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
  const values = keys.map((key) => (updates as any)[key]);

  const res = await query(
    `UPDATE public.teams SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  const updated = res.rows[0];
  if (!updated) throw new Error('Team not found for update');

  // Include members in the return type
  const refreshed = await getTeamById(updated.id);
  return refreshed || (updated as Team);
}

/**
 * List all registered teams and their members
 */
export async function listAllTeams(): Promise<Team[]> {
  const teamsRes = await query('SELECT * FROM public.teams ORDER BY created_at DESC');
  const teams = teamsRes.rows;

  const membersRes = await query('SELECT * FROM public.team_members');
  const members = membersRes.rows;

  const membersMap = new Map<string, any[]>();
  for (const m of members) {
    if (!membersMap.has(m.team_id)) {
      membersMap.set(m.team_id, []);
    }
    membersMap.get(m.team_id)!.push(m);
  }

  for (const t of teams) {
    t.team_members = membersMap.get(t.id) ?? [];
  }

  return teams as Team[];
}

/**
 * Get all members of a specific team with profile info
 */
export async function getTeamMembers(teamId: string): Promise<any[]> {
  const res = await query(
    `SELECT 
       tm.*,
       json_build_object('name', p.name, 'avatar_url', p.avatar_url, 'email', p.email) AS profiles
     FROM public.team_members tm
     JOIN public.profiles p ON p.id = tm.user_id
     WHERE tm.team_id = $1`,
    [teamId]
  );
  return res.rows || [];
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await query(
    'DELETE FROM public.team_members WHERE team_id = $1 AND user_id = $2',
    [teamId, userId]
  );
}