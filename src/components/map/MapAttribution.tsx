'use client';
import { useConfig } from '@/api/hooks/useConfig';

export function MapAttribution() {
  const { data } = useConfig();
  const provider = data?.map?.provider ?? '高德地图';
  const approval = data?.map?.approval_number ?? '';

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
      地图来源：{provider}
      {approval && ` · 审图号：${approval}`}
    </div>
  );
}
