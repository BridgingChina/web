import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, ApiClientError } from '../client';
import { useDeviceStore } from '@/stores/deviceStore';

// Helper: since this module is unit-tested in a jsdom env, `document` exists
// and we can seed/clear `document.cookie` between cases.
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/v1');
    useDeviceStore.setState({ deviceId: 'dev-uuid', language: 'zh-CN' });
    clearCookie('NEXT_LOCALE');
  });

  afterEach(() => {
    clearCookie('NEXT_LOCALE');
  });

  it('attaches X-Device-Id only on /favorites, /review, /history', async () => {
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
    expect(headersAt(0)['X-Device-Id']).toBeUndefined();
    expect(headersAt(1)['X-Device-Id']).toBe('dev-uuid');
    expect(headersAt(2)['X-Device-Id']).toBe('dev-uuid');
    expect(headersAt(3)['X-Device-Id']).toBe('dev-uuid');
  });

  it('reads Accept-Language from NEXT_LOCALE cookie', async () => {
    setCookie('NEXT_LOCALE', 'en-US');
    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/bridges');
    expect((captured!.headers as Record<string, string>)['Accept-Language']).toBe('en-US');
  });

  it('falls back to zh-CN when NEXT_LOCALE cookie is absent', async () => {
    // cookie cleared by beforeEach
    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/bridges');
    expect((captured!.headers as Record<string, string>)['Accept-Language']).toBe('zh-CN');
  });

  it('does NOT read deviceStore.language for Accept-Language', async () => {
    // Even if deviceStore.language says 'en', without cookie we fallback to
    // zh-CN — store no longer drives this header.
    useDeviceStore.setState({ deviceId: 'dev-uuid', language: 'en' });
    let captured: RequestInit | null = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response('{"data":{}}', { status: 200 });
    }));

    await apiClient.get('/bridges');
    expect((captured!.headers as Record<string, string>)['Accept-Language']).toBe('zh-CN');
  });

  it('serializes JSON body and sets Content-Type', async () => {
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
