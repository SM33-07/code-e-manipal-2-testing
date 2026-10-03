import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // ── Protected routes ──
  const protectedRoutes = [
    '/submission-form',
    '/SubmissionForm',
    '/submit',
    '/dashboard',
    '/timeline',
    '/problem-statements',
    '/guidelines',
    '/team',
    '/judge',
    '/judging',
    '/admin',
    '/submission-result',
  ];

  const isProtected = protectedRoutes.some((r) =>
    pathname.startsWith(r)
  );

  const isLogin = pathname === '/login';

  // Bypass Supabase auth check entirely for non-protected, non-login public pages
  if (!isProtected && !isLogin) {
    return res;
  }

  let user = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url) {
      const projectId = url.split('//')[1].split('.')[0];
      const cookieName = `sb-${projectId}-auth-token`;
      const cookieVal = req.cookies.get(cookieName)?.value;
      if (cookieVal) {
        let jsonStr = cookieVal;
        if (cookieVal.startsWith('base64-')) {
          jsonStr = atob(cookieVal.substring(7));
        }
        const session = JSON.parse(jsonStr);
        if (session.expires_at && session.expires_at > Date.now() / 1000) {
          user = session.user || null;
        }
      }
    }
  } catch (e) {
    // Ignore parsing errors and fall back to the client
  }

  // Fallback to official client only if fast local check couldn't resolve a valid user
  if (!user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
          set: (name, value, options: CookieOptions) => {
            req.cookies.set({ name, value, ...options });
            res.cookies.set({ name, value, ...options });
          },
          remove: (name, options: CookieOptions) => {
            req.cookies.set({ name, value: '', ...options });
            res.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user: dbUser } } = await supabase.auth.getUser();
    user = dbUser;
  }

  if (isProtected && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based access ──
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/judging'))) {
    const role = user.user_metadata?.role || 'participant';

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname.startsWith('/judging') && !['judge', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // ── Prevent logged-in users from seeing login ──
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|fonts|logo.png).*)',
  ],
};
