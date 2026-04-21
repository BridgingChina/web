import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  SESSION_COOKIE_RE,
  hasSessionCookie,
  buildLoginUrl,
} from '@/lib/auth-middleware';

// Re-export so existing `import { SESSION_COOKIE_RE, hasSessionCookie,
// buildLoginUrl } from '../middleware'` in tests keeps working.
export { SESSION_COOKIE_RE, hasSessionCookie, buildLoginUrl };

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';

// Phase 5 rollback flag. When `NEXT_PUBLIC_I18N_ENABLED === 'false'` any
// /en-US/* URL is 302'd to the corresponding /zh-CN/* URL before next-intl
// processes it — combined with the backend's `settings.i18n_enabled=false`
// the English surface is fully disabled without shipping new code.
const I18N_DISABLED = process.env.NEXT_PUBLIC_I18N_ENABLED === 'false';
const EN_PREFIX_RE = /^\/en-US(?=\/|$)/;

// After next-intl runs, protected URLs look like `/zh-CN/me` or `/en-US/me/...`.
// Strip the leading `/<locale>` before checking the path so the protected-path
// list stays in canonical locale-less form.
const LOCALE_PREFIX_RE = new RegExp(`^/(?:${routing.locales.join('|')})(?=/|$)`);
const PROTECTED_PATHS = ['/me'];

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_RE, '') || '/';
}

function isProtected(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return PROTECTED_PATHS.some((p) => stripped === p || stripped.startsWith(p + '/'));
}

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest) {
  // Phase 5 rollback: hard-redirect any /en-US/* path to /zh-CN/* when the
  // flag is off. Runs before next-intl so the intl middleware never sees an
  // en-US request and never issues a conflicting redirect.
  if (I18N_DISABLED && EN_PREFIX_RE.test(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = req.nextUrl.pathname.replace(EN_PREFIX_RE, '/zh-CN');
    return NextResponse.redirect(url, 302);
  }

  // Run next-intl first — it handles locale detection and issues a redirect
  // to the prefixed URL when the incoming path is locale-less. On redirect,
  // the follow-up request re-enters this middleware with the canonical URL
  // and the auth check fires there.
  const intlResponse = intlMiddleware(req);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Auth guard: only gate `/me` (locale-prefixed or not). Other routes pass
  // through with intl's response (which carries locale cookies / headers).
  if (!isProtected(req.nextUrl.pathname)) return intlResponse;
  if (hasSessionCookie(req.cookies.getAll())) return intlResponse;

  const callback = req.nextUrl.origin + req.nextUrl.pathname + req.nextUrl.search;
  return NextResponse.redirect(buildLoginUrl(AUTH_URL, callback), 302);
}

export const config = {
  // Match all paths except static assets, Next internals, and API routes.
  // Covers both locale-less (`/me`) and locale-prefixed (`/zh-CN/me`) paths
  // so next-intl can detect and redirect locale-less requests.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
