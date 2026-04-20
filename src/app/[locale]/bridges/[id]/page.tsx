'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBridgeDetail, useBridgeKnowledgePoints } from '@/api/hooks/useBridges';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircleQuestion, MapPin } from 'lucide-react';
import { useQAStore } from '@/stores/qaStore';
import { BridgeHero } from '@/components/bridge/BridgeHero';
import { SectionAccordion } from '@/components/bridge/SectionAccordion';
import { SourcesList } from '@/components/knowledge/SourcesList';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { RecordHistoryOnMount } from '@/components/common/RecordHistoryOnMount';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function BridgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bridge, isLoading, error } = useBridgeDetail(id);
  const { data: kps } = useBridgeKnowledgePoints(id);
  const openQA = useQAStore((s) => s.open);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} />;
  if (!bridge) return null;

  return (
    <>
      <RecordHistoryOnMount targetType="bridge" targetId={id} />
      <div className="space-y-6">
        <BridgeHero images={bridge.images} name={bridge.name} bridgeType={bridge.bridge_type} />

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <article className="space-y-6">
            <header className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">{bridge.name}</h1>
              {bridge.aliases && <p className="text-sm text-muted-foreground">别名：{bridge.aliases}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge>{bridge.bridge_type}</Badge>
                <Badge variant="secondary">{bridge.era}</Badge>
                <Badge variant="outline">{bridge.region}</Badge>
              </div>
              {bridge.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bridge.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <FavoriteButton targetType="bridge" targetId={bridge.id} />
                <Button size="sm" variant="outline" onClick={() => openQA({ type: 'bridge', id: bridge.id, label: bridge.name })}>
                  <MessageCircleQuestion className="mr-1.5 h-4 w-4" />提问
                </Button>
                {bridge.latitude && bridge.longitude && (
                  <Link href={`/map?bridge=${bridge.id}`}>
                    <Button size="sm" variant="outline"><MapPin className="mr-1.5 h-4 w-4" />在地图定位</Button>
                  </Link>
                )}
              </div>
            </header>

            <Separator />

            <section>
              <h2 className="mb-3 text-lg font-medium">桥梁档案</h2>
              <SectionAccordion sections={bridge.sections} sources={bridge.sources} />
            </section>

            <SourcesList sources={bridge.sources} />
            {bridge.sources_count > bridge.sources.length && (
              <p className="text-xs text-muted-foreground">共 {bridge.sources_count} 条来源（已展示 {bridge.sources.length}）</p>
            )}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-md border bg-card p-4">
              <h2 className="mb-2 text-sm font-medium">关联知识点</h2>
              {(!kps || kps.length === 0) && <p className="text-xs text-muted-foreground">暂无</p>}
              <ul className="space-y-2 text-sm">
                {(kps ?? []).map(kp => (
                  <li key={kp.id}>
                    <Link href={`/knowledge/${kp.id}`} className="font-medium hover:underline">{kp.name}</Link>
                    {kp.relevance && <p className="text-xs text-muted-foreground">{kp.relevance}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/7] w-full" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
