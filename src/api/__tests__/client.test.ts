import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiClientError } from '../client';
import { useDeviceStore } from '@/stores/deviceStore';
import { useAuthStore } from '@/stores/authStore';

function fakeJwt(exp: number): string {
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${enc({ alg: 'EdDSA' })}.${enc({ exp })}.sig`;
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/v1');
    useDeviceStore.setState({ deviceId: '', language: 'zh-CN' });
    useAuthStore.getState().clear();
  });

  it('attaches Authorization Bearer only on /favorites, /review, /history', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    useAuthStore.getState().setJwt(fakeJwt(futureExp), futureExp);

    const captured: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      captured.push({ url, init });
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    }));

    await apiClient.get('/bridges');
    await apiClient.get('/favorites');
    await apiClient.get('/review/today');
    await apiClient.get('/history');

    const headersAt = (i: number) => captured[i].init.headers as Record<string, string>;
    expect(headersAt(0)['Authorization']).toBeUndefined();
    expect(headersAt(1)['Authorization']).toMatch(/^Bearer /);
    expect(headersAt(2)['Authorization']).toMatch(/^Bearer /);
    expect(headersAt(3)['Authorization']).toMatch(/^Bearer /);
  });

  it('never attaches X-Device-Id (legacy header removed)', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    useAuthStore.getState().setJwt(fakeJwt(futureExp), futureExp);

    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/favorites');
    expect((captured!.headers as Record<string, string>)['X-Device-Id']).toBeUndefined();
  });

  it('throws UNAUTHENTICATED 401 when authed endpoint called without jwt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ token: null }), { status: 401 })),
    );

    await expect(apiClient.get('/favorites')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('attaches Accept-Language from store', async () => {
    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/bridges');
    expect((captured!.headers as Record<string, string>)['Accept-Language']).toBe('zh-CN');
  });

  it('serializes JSON body and sets Content-Type', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    useAuthStore.getState().setJwt(fakeJwt(futureExp), futureExp);

    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.post('/favorites', { target_type: 'bridge', target_id: 'x' });
    expect(captured!.body).toBe('{"target_type":"bridge","target_id":"x"}');
    expect((captured!.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('does NOT set Content-Type when body is FormData', async () => {
    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    const fd = new FormData();
    fd.append('image', new Blob(['x']), 'a.jpg');
    await apiClient.upload('/recognition', fd);
    expect((captured!.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('throws ApiClientError on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: { code: 'NOT_FOUND', message: '没找到' } }),
      { status: 404 }
    )));

    await expect(apiClient.get('/bridges/x')).rejects.toBeInstanceOf(ApiClientError);
    try { await apiClient.get('/bridges/x'); } catch (e) {
      const err = e as ApiClientError;
      expect(err.status).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    }
  });

  it('returns undefined for 204 No Content', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    useAuthStore.getState().setJwt(fakeJwt(futureExp), futureExp);

    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    const result = await apiClient.delete('/favorites/x');
    expect(result).toBeUndefined();
  });

  it('serializes query params skipping undefined', async () => {
    const captured: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      captured.push(url);
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/bridges', { page: 1, era: '隋唐', region: undefined });
    expect(captured[0]).toContain('page=1');
    expect(captured[0]).toContain('era=%E9%9A%8B%E5%94%90');
    expect(captured[0]).not.toContain('region=');
  });
});
