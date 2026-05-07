'use client';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/api/hooks/useConfig';

interface Props {
  bridgeType?: string;
  era?: string;
  region?: string;
  onChange: (next: { bridgeType?: string; era?: string; region?: string }) => void;
}

export function MapFilters({ bridgeType, era, region, onChange }: Props) {
  const { data: cfg } = useConfig();
  const t = useTranslations('map.filters');

  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-2 rounded-md bg-background/90 p-2 backdrop-blur">
      <FilterGroup
        label={t('bridge_type')}
        allLabel={t('all')}
        options={cfg?.bridge_types ?? []}
        value={bridgeType}
        onChange={(v) => onChange({ bridgeType: v, era, region })}
      />
      <FilterGroup
        label={t('era')}
        allLabel={t('all')}
        options={cfg?.eras ?? []}
        value={era}
        onChange={(v) => onChange({ bridgeType, era: v, region })}
      />
      <FilterGroup
        label={t('region')}
        allLabel={t('all')}
        options={cfg?.regions ?? []}
        value={region}
        onChange={(v) => onChange({ bridgeType, era, region: v })}
      />
    </div>
  );
}

function FilterGroup({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: string[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`rounded-full border px-2 py-0.5 text-xs ${!value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
      >
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? undefined : o)}
          className={`rounded-full border px-2 py-0.5 text-xs ${value === o ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
