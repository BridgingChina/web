'use client';
import { useTranslations } from 'next-intl';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BridgeSections, Source } from '@/api/types';
import { CitationBadges } from '@/components/knowledge/CitationBadges';

export function SectionAccordion({ sections, sources }: { sections: BridgeSections; sources: Source[] }) {
  const entries = Object.entries(sections);
  const allEmpty = entries.every(([, sec]) => sec.l0.length === 0 && sec.l1.length === 0);
  const t = useTranslations('bridge_detail');

  if (allEmpty) {
    return (
      <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
        {t('section_placeholder')}
      </div>
    );
  }

  return (
    <Accordion defaultValue={entries.filter(([, sec]) => sec.l0.length > 0).map(([k]) => k)}>
      {entries.map(([k, sec]) => {
        const isEmpty = sec.l0.length === 0 && sec.l1.length === 0;
        return (
          <AccordionItem key={k} value={k}>
            <AccordionTrigger>{k}</AccordionTrigger>
            <AccordionContent>
              {isEmpty
                ? <p className="text-sm text-muted-foreground">{t('section_empty')}</p>
                : (
                  <ul className="space-y-3">
                    {(sec.l1.length > 0 ? sec.l1 : sec.l0).map((item, i) => (
                      <li key={item.id ?? `${k}-${i}`} className="rounded border bg-card p-3">
                        <p className="font-medium">{item.summary}</p>
                        {item.detail && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.detail}</p>}
                        <CitationBadges citations={item.citations} sources={sources} />
                      </li>
                    ))}
                  </ul>
                )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
