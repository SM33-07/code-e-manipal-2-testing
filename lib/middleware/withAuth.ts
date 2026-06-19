import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import type { User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types';
import { Errors } from '@/lib/utils/response';

export type AuthContext = { user: User; profile: Profile; params?: Record<string, string> };
export type AuthHandler = (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>;

export function withAuth(handler: AuthHandler, requiredRole?: UserRole) {
  return async (req: NextRequest, context?: { params?: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return Errors.UNAUTHORIZED();

      // Query profile from Azure Postgres
      const profileRes = await query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);
      let profile = profileRes.rows[0] as Profile | undefined;

      if (!profile) {
        const meta = user.user_metadata || {};
        try {
          // Lazily sync the user to Azure auth.users so the trigger creates the profile row
          await query(
            'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [user.id, user.email || '', JSON.stringify(meta)]
          );
        } catch (e) {
          console.warn('⚠️ auth.users sync failed, attempting direct profiles insert:', e);
        }

        // Defensive copy: insert directly into public.profiles to be absolutely sure the row exists
        await query(
          `INSERT INTO public.profiles (id, name, email, avatar_url, role) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO NOTHING`,
          [
            user.id,
            meta.name || user.email?.split('@')[0] || 'Unknown',
            user.email || '',
            meta.avatar_url || '',
            meta.role || 'participant'
          ]
        );

        // Fetch the profile once more
        const retryRes = await query('SELECT * FROM public.profiles WHERE id = $1', [user.id]);
        profile = retryRes.rows[0] as Profile | undefined;
      }

      if (!profile) return Errors.INTERNAL('Profile not found');

      // Role hierarchy: admin > judge > participant
      const roleRank: Record<UserRole, number> = { participant: 0, judge: 1, admin: 2 };
      if (requiredRole && roleRank[profile.role as UserRole] < roleRank[requiredRole]) {
        return Errors.FORBIDDEN();
      }

      // Resolve params in case Next.js 16 passes it as a Promise
      const resolvedParams = context?.params instanceof Promise ? await context.params : context?.params;
      return handler(req, { user, profile, params: resolvedParams });
    } catch (err) {
      console.error('🔥 withAuth error:', err);
      return Errors.INTERNAL();
    }
  };
}