export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const API_TIMEOUT = 15000;
export const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY ?? '';
export const AMAP_SECURITY_CODE = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? '';

export const QUERY_DEFAULTS = {
  LIST_STALE_TIME: 5 * 60 * 1000,
  DETAIL_STALE_TIME: 30 * 60 * 1000,
  CONFIG_STALE_TIME: 24 * 60 * 60 * 1000,
} as const;
