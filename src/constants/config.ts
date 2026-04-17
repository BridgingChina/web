export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const API_TIMEOUT = 15000;
export const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY ?? '';

export const QUERY_DEFAULTS = {
  config: { staleTime: 24 * 60 * 60 * 1000 },
  knowledgeTree: { staleTime: 60 * 60 * 1000 },
  detail: { staleTime: 30 * 60 * 1000 },
  bridgeList: { staleTime: 5 * 60 * 1000 },
  reviewToday: { staleTime: 5 * 60 * 1000 },
  realtime: { staleTime: 0 },
} as const;
