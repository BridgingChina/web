'use client';
import { AMAP_KEY, AMAP_SECURITY_CODE } from '@/constants/config';

let promise: Promise<typeof AMap> | null = null;

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
  }
}

export function loadAMap(): Promise<typeof AMap> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AMap can only load in browser'));
  }
  if (promise) return promise;
  if (!AMAP_KEY) {
    return Promise.reject(new Error('NEXT_PUBLIC_AMAP_KEY is not set'));
  }
  if (AMAP_SECURITY_CODE) {
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE };
  }
  // Dynamic import keeps this strictly client-side.
  promise = import('@amap/amap-jsapi-loader').then((mod) =>
    mod.default.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.MarkerCluster'],
    }) as Promise<typeof AMap>,
  );
  return promise;
}
