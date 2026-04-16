import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from '../useConfig';
import type { ReactNode } from 'react';

describe('useConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/api/mobile/v1');
  });

  it('fetches /config and returns data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({
        data: {
          eras: ['隋唐'],
          bridge_types: ['石拱桥'],
          regions: ['华北'],
          map: { provider: '高德', approval_number: 'GS(2024)0001' },
        },
      }),
      { status: 200 },
    )));

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useConfig(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.map.provider).toBe('高德');
    expect(result.current.data?.eras).toContain('隋唐');
  });
});
