'use client';
import { useConfig } from '@/api/hooks/useConfig';

interface Props {
  bridgeType?: string;
  era?: string;
  region?: string;
  onChange: (next: { bridgeType?: string; era?: string; region?: string }) => void;
}

export function MapFilters({ bridgeType, era, region, onChange }: Props) {
  const { data: cfg } = useConfig();

  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-2 rounded-md bg-background/90 p-2 backdrop-blur">
      <FilterGroup
        label="桥型"
        options={cfg?.bridge_types ?? []}
        value={bridgeType}
        onChange={(v) => onChange({ bridgeType: v, era, region })}
      />
      <FilterGroup
        label="年代"
        options={cfg?.eras ?? []}
        value={era}
        onChange={(v) => onChange({ bridgeType, era: v, region })}
      />
      <FilterGroup
        label="地区"
        options={cfg?.regions ?? []}
        value={region}
        onChange={(v) => onChange({ bridgeType, era, region: v })}
      />
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
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
        className={`rounded-full border px-2 py-0.5 text-xs ${!value ? 'bg-accent' : 'hover:bg-accent/50'}`}
      >
        全部
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
