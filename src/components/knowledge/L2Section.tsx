'use client';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { KnowledgePointDetail, Source } from '@/api/types';
import { CitationBadges } from './CitationBadges';

interface Props {
  l2: KnowledgePointDetail['l2'];
  sources: Source[];
}

export function L2Section({ l2, sources }: Props) {
  const hasComparisons = l2.comparisons?.length > 0;
  const hasControversies = l2.controversies?.length > 0;
  const hasReading = l2.further_reading?.length > 0;
  const hasEvolution = !!l2.evolution;
  const t = useTranslations('qa.tabs');
  const tKnowledge = useTranslations('knowledge');

  if (!hasComparisons && !hasControversies && !hasReading && !hasEvolution) {
    return <p className="text-sm text-muted-foreground">{tKnowledge('no_deep_dive')}</p>;
  }

  const initial = hasComparisons ? 'comparisons' : hasEvolution ? 'evolution' : hasControversies ? 'controversies' : 'reading';

  return (
    <Tabs defaultValue={initial}>
      <TabsList>
        {hasComparisons && <TabsTrigger value="comparisons">{t('comparisons')}</TabsTrigger>}
        {hasEvolution && <TabsTrigger value="evolution">{t('evolution')}</TabsTrigger>}
        {hasControversies && <TabsTrigger value="controversies">{t('controversies')}</TabsTrigger>}
        {hasReading && <TabsTrigger value="reading">{t('further_reading')}</TabsTrigger>}
      </TabsList>

      {hasComparisons && (
        <TabsContent value="comparisons" className="space-y-3 pt-3">
          {l2.comparisons.map((c, i) => (
            <div key={i} className="rounded-md border p-3">
              <p className="font-medium">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{c.content}</p>
              <CitationBadges citations={c.citations} sources={sources} />
            </div>
          ))}
        </TabsContent>
      )}

      {hasEvolution && (
        <TabsContent value="evolution" className="pt-3">
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{l2.evolution}</p>
        </TabsContent>
      )}

      {hasControversies && (
        <TabsContent value="controversies" className="space-y-3 pt-3">
          {l2.controversies.map((co, i) => (
            <div key={i} className="rounded-md border border-amber-300 bg-amber-50/50 p-3">
              <p className="font-medium">{co.title} <span className="text-xs text-amber-700">（{co.confidence}）</span></p>
              <p className="mt-1 text-sm text-muted-foreground">{co.description}</p>
              {co.views.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {co.views.map((v, j) => (
                    <li key={j}>· {v.position} <CitationBadges citations={v.citations} sources={sources} /></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </TabsContent>
      )}

      {hasReading && (
        <TabsContent value="reading" className="space-y-1 pt-3">
          {l2.further_reading.map((r, i) => <p key={i} className="text-sm">· {r.title}</p>)}
        </TabsContent>
      )}
    </Tabs>
  );
}
