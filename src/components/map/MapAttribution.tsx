'use client';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/api/hooks/useConfig';

export function MapAttribution() {
  const { data } = useConfig();
  const t = useTranslations('map');
  // Vendor identity — out-of-scope for translation (same rule as "Mapbox").
  const provider = data?.map?.provider ?? '高德地图';
  const approval = data?.map?.approval_number ?? '';

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
      {t('attribution_prefix')}{provider}
      {approval && ` · ${t('attribution_approval_prefix')}${approval}`}
    </div>
  );
}
