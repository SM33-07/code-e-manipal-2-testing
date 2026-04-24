import type { SupabaseClient } from '@supabase/supabase-js';
import type { Team } from '@/types';

export async function getTeamById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, team_members(*, profiles(name, avatar_url, email))')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Team;
}

export async function getTeamByUserId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('teams(*, team_members(*, profiles(name, avatar_url, email)))')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return (data as any)?.teams as Team;
}

export async function createTeam(supabase: SupabaseClient, name: string, userId: string) {
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

  return team as Team;
}

export async function joinTeamByInviteCode(supabase: SupabaseClient, inviteCode: string, userId: string) {
  const { data: team, error: findErr } = await supabase
    .from('teams')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();
  if (findErr || !team) throw new Error('Invalid invite code');

  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'member' });
  if (error) throw error;
  return team;
}