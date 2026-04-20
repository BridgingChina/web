import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/me'];
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';

// Better Auth 1.6 default session cookie name is `better-auth.session_token`,
// with `__Secure-` prefix when served over HTTPS (production). The library also
// accepts a hyphen variant `better-auth-session_token` as fallback. Match all 4.
export const SESSION_COOKIE_RE = /^(?:__Secure-)?better-auth[.\-]session_token$/;

export function hasSessionCookie(cookies: { name: string; value: string }[]): boolean {
  return cookies.some((c) => SESSION_COOKIE_RE.test(c.name) && c.value.length > 0);
}

export function buildLoginUrl(authBase: string, callback: string): URL {
  const loginUrl = new URL(`${authBase}/auth/login`);
  loginUrl.searchParams.set('callbackURL', callback);
  return loginUrl;
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  if (!isProtected(req.nextUrl.pathname)) return NextResponse.next();
  if (hasSessionCookie(req.cookies.getAll())) return NextResponse.next();

  const callback = req.nextUrl.origin + req.nextUrl.pathname + req.nextUrl.search;
  return NextResponse.redirect(buildLoginUrl(AUTH_URL, callback), 302);
}

export const config = { matcher: ['/me', '/me/:path*'] };
