import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('exposes API_BASE_URL from NEXT_PUBLIC_API_BASE_URL env', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://example.com/api/mobile/v1');
    const { API_BASE_URL } = await import('../config');
    expect(API_BASE_URL).toBe('http://example.com/api/mobile/v1');
  });

  it('exposes API_TIMEOUT default 15000', async () => {
    const { API_TIMEOUT } = await import('../config');
    expect(API_TIMEOUT).toBe(15000);
  });

  it('exposes AMAP_KEY from env', async () => {
    vi.stubEnv('NEXT_PUBLIC_AMAP_KEY', 'test-amap-key');
    const { AMAP_KEY } = await import('../config');
    expect(AMAP_KEY).toBe('test-amap-key');
  });

  it('exposes QUERY_DEFAULTS with expected stale times', async () => {
    const { QUERY_DEFAULTS } = await import('../config');
    expect(QUERY_DEFAULTS.LIST_STALE_TIME).toBe(5 * 60 * 1000);
    expect(QUERY_DEFAULTS.DETAIL_STALE_TIME).toBe(30 * 60 * 1000);
    expect(QUERY_DEFAULTS.CONFIG_STALE_TIME).toBe(24 * 60 * 60 * 1000);
  });

  it('falls back to empty string when env var unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    const { API_BASE_URL } = await import('../config');
    expect(API_BASE_URL).toBe('');
  });
});
