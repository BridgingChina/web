import { describe, it, expect } from 'vitest';
// NOTE: we import the pure helpers from `@/lib/auth-middleware` rather than
// from the root `middleware.ts` — the latter now transitively loads
// `next-intl/middleware` → `next/server`, which vitest cannot resolve outside
// the Next runtime. The root middleware re-exports these same symbols.
import {
  SESSION_COOKIE_RE,
  hasSessionCookie,
  buildLoginUrl,
} from '@/lib/auth-middleware';

describe('SESSION_COOKIE_RE', () => {
  it.each([
    'better-auth.session_token',
    'better-auth-session_token',
    '__Secure-better-auth.session_token',
    '__Secure-better-auth-session_token',
  ])('matches Better Auth cookie variant: %s', (name) => {
    expect(SESSION_COOKIE_RE.test(name)).toBe(true);
  });

  it.each([
    'session',
    'better-auth',
    'session_token',
    'auth.session_token',
    'better-auth.refresh_token',
    'next-auth.session-token',
  ])('rejects non-Better-Auth cookie: %s', (name) => {
    expect(SESSION_COOKIE_RE.test(name)).toBe(false);
  });
});

describe('hasSessionCookie', () => {
  it('returns true when a matching cookie has a non-empty value', () => {
    expect(hasSessionCookie([{ name: 'better-auth.session_token', value: 'abc.def' }])).toBe(true);
  });

  it('returns false when matching cookie has empty value', () => {
    expect(hasSessionCookie([{ name: 'better-auth.session_token', value: '' }])).toBe(false);
  });

  it('returns false when no matching cookie present', () => {
    expect(hasSessionCookie([{ name: 'language', value: 'zh-CN' }])).toBe(false);
  });

  it('returns true when matching cookie sits among other cookies', () => {
    expect(
      hasSessionCookie([
        { name: 'language', value: 'zh-CN' },
        { name: '__Secure-better-auth.session_token', value: 'tok' },
      ]),
    ).toBe(true);
  });
});

describe('buildLoginUrl', () => {
  it('appends callbackURL search param to login path', () => {
    const url = buildLoginUrl('https://auth.bridgingchina.net', 'https://bridgingchina.net/me');
    expect(url.toString()).toBe(
      'https://auth.bridgingchina.net/auth/login?callbackURL=https%3A%2F%2Fbridgingchina.net%2Fme',
    );
  });

  it('preserves search params in the callback', () => {
    const url = buildLoginUrl(
      'https://auth.bridgingchina.net',
      'https://bridgingchina.net/me?tab=favorites',
    );
    expect(url.searchParams.get('callbackURL')).toBe('https://bridgingchina.net/me?tab=favorites');
  });
});
