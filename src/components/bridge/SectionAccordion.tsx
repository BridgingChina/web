'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BridgeSections, Source } from '@/api/types';
import { CitationBadges } from '@/components/knowledge/CitationBadges';

const SECTION_LABELS: Record<keyof BridgeSections, string> = {
  structure: '形制与技术',
  geography: '地域与环境',
  society: '功能与社会',
  history: '历史与演变',
};

export function SectionAccordion({ sections, sources }: { sections: BridgeSections; sources: Source[] }) {
  const keys = Object.keys(sections) as (keyof BridgeSections)[];
  const allEmpty = keys.every(k => sections[k].l0.length === 0 && sections[k].l1.length === 0);

  if (allEmpty) {
    return (
      <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
        本桥详细内容待补充，可先查看右侧的关联知识点。
      </div>
    );
  }

  return (
    <Accordion defaultValue={keys.filter(k => sections[k].l0.length > 0)}>
      {keys.map(k => {
        const sec = sections[k];
        const isEmpty = sec.l0.length === 0 && sec.l1.length === 0;
        return (
          <AccordionItem key={k} value={k}>
            <AccordionTrigger>{SECTION_LABELS[k]}</AccordionTrigger>
            <AccordionContent>
              {isEmpty
                ? <p className="text-sm text-muted-foreground">该章节内容待补充</p>
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
