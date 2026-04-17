'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadAMap } from '@/lib/amap-loader';
import { useBridgeClusters } from '@/api/hooks/useBridges';
import { MapAttribution } from './MapAttribution';
import { MapFilters } from './MapFilters';

interface Bounds {
  bounds_ne_lat: number;
  bounds_ne_lng: number;
  bounds_sw_lat: number;
  bounds_sw_lng: number;
  zoom: number;
}

interface Props {
  onSelectBridge: (id: string) => void;
  onCountsChange: (counts: { points: number; clusters: number }) => void;
}

export function AMapContainer({ onSelectBridge, onCountsChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const markersRef = useRef<AMap.Marker[]>([]);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [filters, setFilters] = useState<{
    bridgeType?: string;
    era?: string;
    region?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const { data: clusters } = useBridgeClusters(
    bounds
      ? {
          ...bounds,
          bridge_type: filters.bridgeType,
          era: filters.era,
          region: filters.region,
        }
      : null,
  );

  // Init map
  useEffect(() => {
    let canceled = false;
    let resizeObserver: ResizeObserver | null = null;

    loadAMap()
      .then((AMap) => {
        if (canceled || !ref.current) return;
        const map = new AMap.Map(ref.current, {
          zoom: 4,
          center: [104, 35],
          viewMode: '2D',
        });
        mapRef.current = map;
        const updateBounds = () => {
          const b = map.getBounds();
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          setBounds({
            bounds_ne_lat: ne.getLat(),
            bounds_ne_lng: ne.getLng(),
            bounds_sw_lat: sw.getLat(),
            bounds_sw_lng: sw.getLng(),
            zoom: Math.floor(map.getZoom()),
          });
        };
        let t: ReturnType<typeof setTimeout> | null = null;
        const debounced = () => {
          if (t) clearTimeout(t);
          t = setTimeout(updateBounds, 300);
        };
        map.on('moveend', debounced);
        map.on('zoomend', debounced);
        // Initial fetch
        updateBounds();

        if (typeof ResizeObserver !== 'undefined' && ref.current) {
          resizeObserver = new ResizeObserver(() => {
            debounced();
          });
          resizeObserver.observe(ref.current);
        }
      })
      .catch((e: unknown) => {
        if (!canceled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      canceled = true;
      resizeObserver?.disconnect();
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);

  // Render markers from clusters response
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !clusters) return;

    // Clear previous markers
    markersRef.current.forEach((m) => map.remove(m));
    markersRef.current = [];

    let canceled = false;
    loadAMap().then((AMap) => {
      if (canceled || !mapRef.current) return;
      const all: AMap.Marker[] = [];
      // Cluster aggregates
      clusters.clusters.forEach((c) => {
        const marker = new AMap.Marker({
          position: [c.longitude, c.latitude],
          content: `<div style="background:#3b82f6;color:white;border-radius:9999px;padding:4px 8px;font-size:12px;font-weight:600;">${c.count}</div>`,
        });
        marker.on('click', () => {
          map.setZoomAndCenter(map.getZoom() + 2, [c.longitude, c.latitude]);
        });
        map.add(marker);
        all.push(marker);
      });
      // Individual points
      clusters.points.forEach((p) => {
        const marker = new AMap.Marker({
          position: [p.longitude, p.latitude],
          title: p.name,
        });
        marker.on('click', () => onSelectBridge(p.id));
        map.add(marker);
        all.push(marker);
      });
      markersRef.current = all;
      onCountsChange({
        points: clusters.points.length,
        clusters: clusters.clusters.length,
      });
    });

    return () => {
      canceled = true;
    };
  }, [clusters, onSelectBridge, onCountsChange]);

  const handleFilterChange = useCallback(
    (next: { bridgeType?: string; era?: string; region?: string }) =>
      setFilters(next),
    [],
  );

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted p-6 text-center">
        <p className="text-sm font-medium">地图加载失败</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">
          请检查 NEXT_PUBLIC_AMAP_KEY 是否在 .env.local 中正确配置。
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapFilters
        bridgeType={filters.bridgeType}
        era={filters.era}
        region={filters.region}
        onChange={handleFilterChange}
      />
      <div ref={ref} className="h-full w-full" />
      <MapAttribution />
    </div>
  );
}
