import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, UpdateProfileInput, UserRole } from '@/types';

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getAllProfiles(
  supabase: SupabaseClient,
  role?: string
): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('name');

  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
}

export async function setUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
