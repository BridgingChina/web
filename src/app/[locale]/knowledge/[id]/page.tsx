'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useKnowledgePointDetail, useKnowledgePointBridges } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
          <header className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{kp.line.name}</Badge>
              <span>›</span>
              <span>{kp.category.name}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{kp.name}</h1>
            {kp.aliases.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('aliases_prefix', { aliases: kp.aliases.join(t('aliases_separator')) })}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {kp.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              <Badge variant="outline">{t('difficulty_label', { difficulty: kp.difficulty })}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <FavoriteButton targetType="knowledge_point" targetId={kp.id} />
              <Button size="sm" variant="outline" onClick={() => openQA({ type: 'knowledge_point', id: kp.id, label: kp.name })}>
                <MessageCircleQuestion className="mr-1.5 h-4 w-4" />{tCommon('ask')}
              </Button>
              <Link href={`/map?kp=${kp.id}`}>
                <Button size="sm" variant="outline"><MapPin className="mr-1.5 h-4 w-4" />{t('locate_on_map')}</Button>
              </Link>
              <Link href={`/flashcards/${kp.id}`}>
                <Button size="sm" variant="outline"><Layers className="mr-1.5 h-4 w-4" />{t('flashcards_entry')}</Button>
              </Link>
            </div>
          </header>

          <Separator />

          <section>
            <h2 className="mb-3 text-lg font-medium">
              {t('points_summary', { count: kp.l0.key_points.length, bridges: kp.l0.typical_bridges_count })}
            </h2>
            <div className="space-y-2">
              {kp.l1.key_points.length > 0
                ? kp.l1.key_points.map(p => <KeyPointCard key={p.id} kp={p} />)
                : kp.l0.key_points.map(p => <KeyPointCard key={p.id} kp={p} />)}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium">{t('deep_dive_heading')}</h2>
            <L2Section l2={kp.l2} sources={kp.sources} />
          </section>

          <SourcesList sources={kp.sources} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-md border bg-card p-4">
            <h2 className="mb-2 text-sm font-medium">{t('typical_bridges', { count: bridges.length })}</h2>
            {bridges.length === 0 && <p className="text-xs text-muted-foreground">{tCommon('empty')}</p>}
            <ul className="space-y-1.5 text-sm">
              {bridges.slice(0, 8).map(b => (
                <li key={b.id}>
                  <Link href={`/bridges/${b.id}`} className="hover:underline">{b.name}</Link>
                  <span className="ml-1 text-xs text-muted-foreground">{b.region}</span>
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
