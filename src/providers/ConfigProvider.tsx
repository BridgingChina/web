'use client';
import { ReactNode, useEffect } from 'react';
import { useConfig } from '@/api/hooks/useConfig';
import { useDeviceStore } from '@/stores/deviceStore';

export function ConfigProvider({ children }: { children: ReactNode }) {
  const init = useDeviceStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  useConfig(); // prefetch /config — cached in TanStack Query
  return <>{children}</>;
}
