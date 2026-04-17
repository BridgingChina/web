'use client';
import { AMAP_KEY } from '@/constants/config';

let promise: Promise<typeof AMap> | null = null;

declare global {
  interface Window {
    _AMapSecurityConfig?: { serviceHost: string };
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
  // jscode 在服务端由 /api/amap proxy 注入，客户端不再持有 secret。
  window._AMapSecurityConfig = {
    serviceHost: `${window.location.origin}/api/amap`,
  };
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
