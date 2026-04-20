'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { KeyPoint } from '@/api/types';
import { CitationBadges } from './CitationBadges';

export function KeyPointCard({ kp }: { kp: KeyPoint }) {
  const [open, setOpen] = useState(false);
  const hasL1 = !!kp.explanation;
  const t = useTranslations('knowledge');

  return (
    <article className="rounded-md border bg-card">
      <button
        onClick={() => hasL1 && setOpen(o => !o)}
        className={`flex w-full items-baseline gap-3 px-4 py-3 text-left ${hasL1 ? 'hover:bg-accent/30' : 'cursor-default'}`}
        aria-expanded={open}
      >
        <Badge variant="secondary" className="shrink-0">{kp.order}</Badge>
        <p className="flex-1 font-medium">{kp.summary}</p>
        {hasL1 && (open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)}
      </button>
      {open && hasL1 && (
        <div className="border-t px-4 py-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="whitespace-pre-wrap">{kp.explanation}</p>
          {kp.illustrations && kp.illustrations.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {kp.illustrations.map((ill, i) => (
                <figure key={i} className="space-y-1">
                  <img src={ill.url} alt={ill.caption} className="rounded border" />
                  {ill.caption && <figcaption className="text-xs">{ill.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {kp.related_terms && kp.related_terms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs">{t('related_terms_label')}</span>
              {kp.related_terms.map(term => (
                <Badge key={term.id} variant="outline" className="text-xs">{term.name}</Badge>
              ))}
            </div>
          )}
          <CitationBadges citations={kp.citations} />
        </div>
      )}
    </article>
  );
}
