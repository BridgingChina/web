// Pure helpers for the root Next.js middleware. Kept in a separate module so
// unit tests (vitest / jsdom) can import the logic without triggering the
// side-effect load of `next-intl/middleware`, which transitively reaches
// `next/server` and is unresolvable outside the Next runtime.

// Better Auth 1.6 default session cookie name is `better-auth.session_token`,
// with `__Secure-` prefix when served over HTTPS (production). The library
// also accepts a hyphen variant `better-auth-session_token` as fallback.
// Match all 4.
export const SESSION_COOKIE_RE = /^(?:__Secure-)?better-auth[.\-]session_token$/;

export function hasSessionCookie(cookies: { name: string; value: string }[]): boolean {
  return cookies.some((c) => SESSION_COOKIE_RE.test(c.name) && c.value.length > 0);
}

export function buildLoginUrl(authBase: string, callback: string): URL {
  const loginUrl = new URL(`${authBase}/auth/login`);
  loginUrl.searchParams.set('callbackURL', callback);
  return loginUrl;
}
