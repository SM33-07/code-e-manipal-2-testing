import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/types';

export interface SessionData {
  userId: string;
  email: string | undefined;
  profile: Profile;
}

/**
 * Get the current server-side session + profile.
 * Returns null if unauthenticated or profile missing.
 */
export async function getServerSession(): Promise<SessionData | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      userId:  user.id,
      email:   user.email,
      profile: profile as Profile,
    };
  } catch {
    return null;
  }
}

/**
 * Role hierarchy check — admin > judge > participant.
 * Returns true if userRole meets or exceeds requiredRole.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const rank: Record<UserRole, number> = {
    participant: 0,
    judge:       1,
    admin:       2,
  };
  return rank[userRole] >= rank[requiredRole];
}
