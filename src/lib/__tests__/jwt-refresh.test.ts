import { describe, it, expect, beforeEach, vi } from 'vitest';
import { decodeJwtExp, refreshJwt, ensureFreshJwt } from '../jwt-refresh';
import { useAuthStore } from '@/stores/authStore';

function fakeJwt(exp: number, extra: Record<string, unknown> = {}): string {
  const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const payload = btoa(JSON.stringify({ exp, ...extra }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.signature`;
}

describe('decodeJwtExp', () => {
  it('extracts exp claim from valid JWT', () => {
    const jwt = fakeJwt(1700000000);
    expect(decodeJwtExp(jwt)).toBe(1700000000);
  });

  it('returns null for malformed JWT (wrong segment count)', () => {
    expect(decodeJwtExp('not.a.valid.jwt')).toBeNull();
    expect(decodeJwtExp('only-one')).toBeNull();
  });

  it('returns null when exp is not a number', () => {
    const payload = btoa(JSON.stringify({ exp: 'never' })).replace(/=+$/, '');
    expect(decodeJwtExp(`h.${payload}.s`)).toBeNull();
  });
});

describe('refreshJwt', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clear();
  });

  it('writes token + exp to authStore on 200 response', async () => {
    const jwt = fakeJwt(1800000000);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ token: jwt }), { status: 200 })),
    );

    const result = await refreshJwt();
    expect(result).toBe(jwt);
    const state = useAuthStore.getState();
    expect(state.jwt).toBe(jwt);
    expect(state.jwtExpiresAt).toBe(1800000000);
  });

  it('clears authStore and returns null on 401', async () => {
    useAuthStore.getState().setJwt('stale', 999);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Unauthorized', { status: 401 })));

    const result = await refreshJwt();
    expect(result).toBeNull();
    expect(useAuthStore.getState().jwt).toBeNull();
  });

  it('returns null on network failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    await expect(refreshJwt()).resolves.toBeNull();
  });

  it('dedupes concurrent calls (single fetch)', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ token: fakeJwt(1800000000) }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const [a, b, c] = await Promise.all([refreshJwt(), refreshJwt(), refreshJwt()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});

describe('ensureFreshJwt', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clear();
  });

  it('returns cached jwt when expiry is far in the future', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    useAuthStore.getState().setJwt('cached', futureExp);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await ensureFreshJwt();
    expect(result).toBe('cached');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshes when within buffer window (<60s remaining)', async () => {
    const nearExp = Math.floor(Date.now() / 1000) + 30;
    useAuthStore.getState().setJwt('almost-stale', nearExp);
    const fresh = fakeJwt(Math.floor(Date.now() / 1000) + 900);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ token: fresh }), { status: 200 })),
    );

    const result = await ensureFreshJwt();
    expect(result).toBe(fresh);
  });

  it('refreshes when no cached jwt', async () => {
    const fresh = fakeJwt(Math.floor(Date.now() / 1000) + 900);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ token: fresh }), { status: 200 })),
    );

    const result = await ensureFreshJwt();
    expect(result).toBe(fresh);
  });
});
