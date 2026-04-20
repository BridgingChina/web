'use client';
import { ReactNode } from 'react';
import { useConfig } from '@/api/hooks/useConfig';

export function ConfigProvider({ children }: { children: ReactNode }) {
  useConfig(); // prefetch /config — cached in TanStack Query
  return <>{children}</>;
}
