'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { RecognitionResponse } from '@/api/types';

interface Props { result: RecognitionResponse; onReset: () => void; }

export function CandidateList({ result, onReset }: Props) {
  const t = useTranslations('recognize');

  if (result.candidates.length === 0) {
    const fb = result.fallback_suggestions;
    const searchSuffix = fb?.search_hint ? t('parenthetical', { hint: fb.search_hint }) : '';
    const regionSuffix = fb?.region_hint ? t('parenthetical', { hint: fb.region_hint }) : '';
    return (
      <div className="space-y-4 rounded-md border bg-muted/20 p-6 text-center">
        <p className="text-sm font-medium">{t('no_match_title')}</p>
        <p className="text-xs text-muted-foreground">{t('fallback_intro')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/search?q=${encodeURIComponent(fb?.search_hint ?? '')}`}>
            <Button size="sm" variant="outline">{t('go_search')}{searchSuffix}</Button>
          </Link>
          <Link href={`/map${fb?.region_hint ? `?region=${encodeURIComponent(fb.region_hint)}` : ''}`}>
            <Button size="sm" variant="outline">{t('go_map')}{regionSuffix}{t('go_map_suffix')}</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onReset}>{t('reupload')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{t('candidates_title', { count: result.candidates.length })}</h2>
        <Button size="sm" variant="ghost" onClick={onReset}>{t('reupload')}</Button>
      </div>
      {result.candidates.map((c) => (
        <Link key={c.bridge_id} href={`/bridges/${c.bridge_id}`}
          className="block rounded-md border bg-card p-4 hover:bg-accent">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-semibold">{c.name}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            <Badge>{c.bridge_type}</Badge>
            <Badge variant="secondary">{c.era}</Badge>
            <Badge variant="outline">{c.region}</Badge>
          </div>
          {c.confidence_hints?.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {c.confidence_hints.map((h, i) => <li key={i}>· {h}</li>)}
            </ul>
          )}
        </Link>
      ))}
    </div>
  );
}
