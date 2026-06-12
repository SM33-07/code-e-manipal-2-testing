import type { SupabaseClient } from '@supabase/supabase-js';
import type { Team } from '@/types';

export async function getTeamById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Team;
}

export async function getTeamByUserId(supabase: SupabaseClient, userId: string) {
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (memberError || !member) return null;

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', member.team_id)
    .single();
  if (teamError) return null;

  return team as unknown as Team;
}

export async function createTeam(supabase: SupabaseClient, name: string, userId: string) {
  // Clean up any stale team_members records for this user
  await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId);

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, created_by: userId })
    .select()
    .single();
  if (teamError) throw teamError;

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'leader' });
  if (memberError) throw memberError;

  // Re-fetch to pick up any trigger-rotated invite_code
  const { data: refreshed } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', team.id)
    .single();

  return (refreshed || team) as unknown as Team;
}

export async function joinTeamByInviteCode(supabase: SupabaseClient, inviteCode: string, userId: string) {
  const { data: team, error: findErr } = await supabase
    .from('teams')
    .select('id, name, invite_code, created_by')
    .eq('invite_code', inviteCode)
    .single();
  if (findErr || !team) throw new Error('INVALID_INVITE_CODE');

  const { data: members, error: membersErr } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', team.id);
  if (membersErr) throw membersErr;

  if (members && members.length >= 4) {
    throw new Error('TEAM_FULL');
  }

  const alreadyInTeam = members?.some((m: any) => m.user_id === userId);
  if (alreadyInTeam) throw new Error('ALREADY_IN_TEAM');

  const { error: insertErr } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'member' });
  if (insertErr) throw insertErr;

  const { data: updatedTeam } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .eq('id', team.id)
    .single();

  return updatedTeam || team;
}

export async function updateTeam(supabase: SupabaseClient, id: string, updates: Partial<Pick<Team, 'name' | 'is_locked'>>) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function listAllTeams(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, team_members(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Team[];
}

export async function getTeamMembers(supabase: SupabaseClient, teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, profiles(name, avatar_url, email)')
    .eq('team_id', teamId);

  if (error) throw error;
  return data || [];
}

export async function removeTeamMember(supabase: SupabaseClient, teamId: string, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw error;
}