'use client';
import { Suspense, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { ResultDrawer } from '@/components/map/ResultDrawer';

// AMap touches `window` at module load — must be SSR-disabled.
const AMapContainer = dynamic(
  () => import('@/components/map/AMapContainer').then((m) => m.AMapContainer),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse"
        style={{ background: 'var(--stone-grey)' }}
      />
    ),
  },
);

function MapContent() {
  const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(null);
  const [counts, setCounts] = useState({ points: 0, clusters: 0 });

  const handleSelect = useCallback((id: string) => setSelectedBridgeId(id), []);
  const handleCounts = useCallback(
    (c: { points: number; clusters: number }) => setCounts(c),
    [],
  );

  return (
    <div className="grid h-[calc(100dvh-7rem)] grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: 'var(--stone-grey)' }}
      >
        <AMapContainer onSelectBridge={handleSelect} onCountsChange={handleCounts} />
      </div>
      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: 'var(--stone-grey)' }}
      >
        <ResultDrawer
          selectedBridgeId={selectedBridgeId}
          pointsCount={counts.points}
          clustersCount={counts.clusters}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div
          className="h-[calc(100dvh-7rem)] animate-pulse rounded-lg"
          style={{ background: 'var(--stone-grey)' }}
        />
      }
    >
      <MapContent />
    </Suspense>
  );
}
