import { createSupabaseServerClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
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
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Query profile from Azure Postgres
    const profileRes = await query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);
    let profile = profileRes.rows[0] as Profile | undefined;

    if (!profile) {
      // Lazily sync the user to Azure auth.users
      const meta = user.user_metadata || {};
      await query(
        'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [user.id, user.email || '', JSON.stringify(meta)]
      );

      // Re-fetch profile
      const retryRes = await query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);
      profile = retryRes.rows[0] as Profile | undefined;
    }

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
