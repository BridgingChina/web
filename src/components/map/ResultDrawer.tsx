'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useBridgeDetail } from '@/api/hooks/useBridges';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MessageCircleQuestion, ArrowRight } from 'lucide-react';
import { useQAStore } from '@/stores/qaStore';
import { FavoriteButton } from '@/components/common/FavoriteButton';

interface Props {
  selectedBridgeId: string | null;
  pointsCount: number;
  clustersCount: number;
}

export function ResultDrawer({ selectedBridgeId, pointsCount, clustersCount }: Props) {
  const { data: bridge, isLoading } = useBridgeDetail(selectedBridgeId ?? undefined);
  const openQA = useQAStore((s) => s.open);
  const t = useTranslations('map');
  const tCommon = useTranslations('common');

  return (
    <aside className="flex h-full flex-col bg-background">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">{t('results_title')}</h2>
        <p className="text-xs text-muted-foreground">
          {t('viewport_summary', { points: pointsCount, clusters: clustersCount })}
        </p>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedBridgeId && (
          <p className="text-sm text-muted-foreground">{t('click_marker_hint')}</p>
        )}
        {selectedBridgeId && isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {bridge && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold">{bridge.name}</h3>
              {bridge.aliases && (
                <p className="text-xs text-muted-foreground">{bridge.aliases}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Badge>{bridge.bridge_type}</Badge>
              <Badge variant="secondary">{bridge.era}</Badge>
              <Badge variant="outline">{bridge.region}</Badge>
            </div>
            {bridge.tags && bridge.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bridge.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <FavoriteButton targetType="bridge" targetId={bridge.id} />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  openQA({ type: 'bridge', id: bridge.id, label: bridge.name })
                }
              >
                <MessageCircleQuestion className="mr-1.5 h-4 w-4" />
                {tCommon('ask')}
              </Button>
            </div>
            <Link href={`/bridges/${bridge.id}`}>
              <Button size="sm" className="mt-2 w-full">
                {t('open_detail')} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
