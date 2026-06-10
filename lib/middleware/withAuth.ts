import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (!profile) return Errors.INTERNAL('Profile not found');

      // Role hierarchy: admin > judge > participant
      const roleRank: Record<UserRole, number> = { participant: 0, judge: 1, admin: 2 };
      if (requiredRole && roleRank[profile.role as UserRole] < roleRank[requiredRole]) {
        return Errors.FORBIDDEN();
      }

      // Resolve params in case Next.js 16 passes it as a Promise
      const resolvedParams = context?.params instanceof Promise ? await context.params : context?.params;
      return handler(req, { user, profile, params: resolvedParams });
    } catch {
      return Errors.INTERNAL();
    }
  };
}