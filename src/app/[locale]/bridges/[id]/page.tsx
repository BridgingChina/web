'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useBridgeDetail, useBridgeKnowledgePoints } from '@/api/hooks/useBridges';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  const t = useTranslations('bridge_detail');
  const tCommon = useTranslations('common');

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
            <header className="space-y-4">
              {/* Display-level bridge name: serif, songci-celadon — the "subject being described" */}
              <h1
                className="font-serif text-[clamp(28px,4vw,44px)] font-semibold leading-[1.2] tracking-[0.02em]"
                style={{ color: 'var(--songci-celadon)' }}
              >
                {bridge.name}
              </h1>

              {bridge.aliases && (
                <p className="font-sans text-sm text-muted-foreground">
                  {t('aliases_label', { aliases: bridge.aliases })}
                </p>
              )}

              {/* Chip-tag style: pill, stone-grey border, ash text, transparent bg */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                  style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                >
                  {bridge.bridge_type}
                </span>
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                  style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                >
                  {bridge.era}
                </span>
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                  style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                >
                  {bridge.region}
                </span>
                {bridge.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                    style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <FavoriteButton targetType="bridge" targetId={bridge.id} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => openQA({ type: 'bridge', id: bridge.id, label: bridge.name })}
                >
                  <MessageCircleQuestion className="h-4 w-4" />{tCommon('ask')}
                </Button>
                {bridge.latitude && bridge.longitude && (
                  <Link href={`/map?bridge=${bridge.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
                      <MapPin className="h-4 w-4" />{t('locate_on_map')}
                    </Button>
                  </Link>
                )}
              </div>
            </header>

            <Separator />

            <section>
              {/* Section headline: serif — chapter heading for the "archive" */}
              <h2
                className="mb-4 font-serif text-xl font-semibold leading-[1.3] tracking-[0.02em] text-foreground"
              >
                {t('archive')}
              </h2>
              <SectionAccordion sections={bridge.sections} sources={bridge.sources} />
            </section>

            <SourcesList sources={bridge.sources} />
            {bridge.sources_count > bridge.sources.length && (
              <p className="font-sans text-xs text-muted-foreground">
                {t('sources_summary', { total: bridge.sources_count, shown: bridge.sources.length })}
              </p>
            )}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border bg-card p-4" style={{ borderColor: 'var(--stone-grey)' }}>
              <h2 className="mb-3 font-sans text-sm font-medium text-foreground">{t('related_kps')}</h2>
              {(!kps || kps.length === 0) && (
                <p className="font-sans text-xs text-muted-foreground">{tCommon('empty')}</p>
              )}
              <ul className="space-y-2 font-sans text-sm">
                {(kps ?? []).map(kp => (
                  <li key={kp.id}>
                    <Link
                      href={`/knowledge/${kp.id}`}
                      className="font-medium text-foreground transition-colors hover:text-foreground/70"
                    >
                      {kp.name}
                    </Link>
                    {kp.relevance && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{kp.relevance}</p>
                    )}
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
