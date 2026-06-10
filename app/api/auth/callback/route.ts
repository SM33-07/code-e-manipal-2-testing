import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/auth/callback
 *
 * Handles the OAuth / magic-link code exchange.
 * Supabase redirects here after the user authenticates externally.
 * Sets the session cookie and redirects to the intended page.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');

  // Supabase may return an error param on failure
  if (error) {
    logger.warn('Auth callback returned error from provider', { error });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    logger.warn('Auth callback called without a code param');
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      logger.error('Code exchange failed', { error: exchangeError.message });
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Redirect to the originally-intended path (defaults to /)
    const redirectTo = next.startsWith('/') ? `${origin}${next}` : origin;
    logger.info('Auth callback successful', { next: redirectTo });
    return NextResponse.redirect(redirectTo);

  } catch (err) {
    logger.error('Auth callback unexpected error', { error: String(err) });
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
