'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useKnowledgePointDetail, useKnowledgePointBridges } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageCircleQuestion, MapPin, Layers } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useQAStore } from '@/stores/qaStore';
import { KeyPointCard } from '@/components/knowledge/KeyPointCard';
import { L2Section } from '@/components/knowledge/L2Section';
import { SourcesList } from '@/components/knowledge/SourcesList';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { RecordHistoryOnMount } from '@/components/common/RecordHistoryOnMount';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useTranslateError } from '@/lib/error-message';

export default function KnowledgePointPage() {
  const { id } = useParams<{ id: string }>();
  const { data: kp, isLoading, error } = useKnowledgePointDetail(id);
  const { data: bridgesRes } = useKnowledgePointBridges(id);
  const openQA = useQAStore((s) => s.open);
  const t = useTranslations('knowledge');
  const tCommon = useTranslations('common');
  const translateError = useTranslateError();

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={translateError(error)} />;
  if (!kp) return null;

  const bridges = bridgesRes?.data?.bridges ?? [];

  return (
    <>
      <RecordHistoryOnMount targetType="knowledge_point" targetId={id} />
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="space-y-8">
          <header className="space-y-4">
            {/* Breadcrumb: sans-serif, muted — "the narrator", not "the subject" */}
            <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs text-muted-foreground">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
              >
                {kp.line.name}
              </span>
              <span className="text-muted-foreground/50">›</span>
              <span>{kp.category.name}</span>
            </div>

            {/* H1: serif headline — the knowledge point IS the "object being described" */}
            <h1
              className="font-serif text-[clamp(28px,4vw,40px)] font-semibold leading-[1.2] tracking-[0.02em] text-foreground"
            >
              {kp.name}
            </h1>

            {kp.aliases.length > 0 && (
              <p className="font-sans text-sm text-muted-foreground">
                {t('aliases_prefix', { aliases: kp.aliases.join(t('aliases_separator')) })}
              </p>
            )}

            {/* Tags: chip-tag style — pill, transparent, ash text, stone-grey border */}
            {(kp.tags.length > 0 || kp.difficulty) && (
              <div className="flex flex-wrap gap-1.5">
                {kp.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                    style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium"
                  style={{ borderColor: 'var(--stone-grey)', color: 'var(--ash)' }}
                >
                  {t('difficulty_label', { difficulty: kp.difficulty })}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <FavoriteButton targetType="knowledge_point" targetId={kp.id} />
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => openQA({ type: 'knowledge_point', id: kp.id, label: kp.name })}
              >
                <MessageCircleQuestion className="h-4 w-4" />{tCommon('ask')}
              </Button>
              <Link href={`/map?kp=${kp.id}`}>
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <MapPin className="h-4 w-4" />{t('locate_on_map')}
                </Button>
              </Link>
              <Link href={`/flashcards/${kp.id}`}>
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Layers className="h-4 w-4" />{t('flashcards_entry')}
                </Button>
              </Link>
            </div>
          </header>

          <Separator />

          <section>
            {/* Section headings: sans Title style — "narrator" not "subject" */}
            <h2 className="mb-4 font-sans text-base font-semibold text-foreground">
              {t('points_summary', { count: kp.l0.key_points.length, bridges: kp.l0.typical_bridges_count })}
            </h2>
            <div className="space-y-2">
              {kp.l1.key_points.length > 0
                ? kp.l1.key_points.map(p => <KeyPointCard key={p.id} kp={p} />)
                : kp.l0.key_points.map(p => <KeyPointCard key={p.id} kp={p} />)}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-sans text-base font-semibold text-foreground">{t('deep_dive_heading')}</h2>
            <L2Section l2={kp.l2} sources={kp.sources} />
          </section>

          <SourcesList sources={kp.sources} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Aside panel: bg-card (rice-paper), 1px stone-grey border, rounded-lg */}
          <div className="rounded-lg border bg-card p-4" style={{ borderColor: 'var(--stone-grey)' }}>
            <h2 className="mb-3 font-sans text-sm font-medium text-foreground">
              {t('typical_bridges', { count: bridges.length })}
            </h2>
            {bridges.length === 0 && (
              <p className="font-sans text-xs text-muted-foreground">{tCommon('empty')}</p>
            )}
            <ul className="space-y-2 font-sans text-sm">
              {bridges.slice(0, 8).map(b => (
                <li key={b.id} className="flex items-baseline gap-1.5">
                  <Link
                    href={`/bridges/${b.id}`}
                    className="font-medium text-foreground transition-colors hover:text-foreground/70"
                    style={{ textDecorationColor: 'var(--stone-grey)' }}
                  >
                    {b.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{b.region}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
