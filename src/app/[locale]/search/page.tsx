'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/api/hooks/useSearch';
import { useTranslateError } from '@/lib/error-message';
import type { SearchResult } from '@/api/types';

const RECENT_KEY = 'bridgingchina.recent_searches';

type SearchType = 'all' | 'knowledge_point' | 'bridge';

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const initialType = (params.get('type') as SearchType) ?? 'all';
  const t = useTranslations('search');
  const tFeedback = useTranslations('feedback');
  const tCommon = useTranslations('common');
  const translateError = useTranslateError();

  // Localised suggestion tokens; source lives in messages (arrays preserve order).
  const suggestions = (t.raw('suggestions') ?? []) as string[];

  const [text, setText] = useState(initialQ);
  const [type, setType] = useState<SearchType>(initialType);
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
      return Array.isArray(stored) ? stored.slice(0, 8) : [];
    } catch { return []; }
  });

  const apiParams = initialQ ? { q: initialQ, type: type === 'all' ? undefined : type } : null;
  const { data, isLoading, error } = useSearch(apiParams);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter(r => r !== trimmed)].slice(0, 8);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    const sp = new URLSearchParams();
    sp.set('q', trimmed);
    if (type !== 'all') sp.set('type', type);
    router.push(`/search?${sp.toString()}`);
  }

  function clearRecent() {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
  }

  const results: SearchResult[] = data?.data?.results ?? [];
  const showWaitingState = !initialQ;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(text); }}
            placeholder={t('placeholder')}
            autoFocus
          />
          <Button onClick={() => submit(text)} disabled={!text.trim()}>{tCommon('search')}</Button>
        </div>
        <div className="flex gap-1 text-sm">
          {(['all', 'knowledge_point', 'bridge'] as SearchType[]).map((k) => {
            const typeLabel =
              k === 'all' ? t('type_all') : k === 'bridge' ? t('type_bridge') : t('type_knowledge_point');
            return (
              <button
                key={k}
                onClick={() => { setType(k); if (initialQ) submit(text || initialQ); }}
                className={`rounded-md px-3 py-1 transition-colors ${
                  type === k ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                {typeLabel}
              </button>
            );
          })}
        </div>
      </div>

      {showWaitingState && (
        <div className="space-y-4">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">{t('recent_title')}</h2>
                <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground">{t('recent_clear')}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => { setText(r); submit(r); }} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-2 text-sm font-medium">{t('suggestions_title')}</h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setText(s); submit(s); }} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {initialQ && (
        <section className="space-y-3">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          {error && (
            <p className="text-sm text-destructive">
              {tFeedback('search_failed', { message: translateError(error) })}
            </p>
          )}
          {!isLoading && !error && results.length === 0 && (
            <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <p className="mb-2">{t('no_match_title', { q: initialQ })}</p>
              <p className="text-xs">{t('no_match_hint')}</p>
            </div>
          )}
          {results.map((r) => (
            <ResultCard key={`${r.type}-${r.id}`} result={r} />
          ))}
        </section>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');
  const href = result.type === 'bridge' ? `/bridges/${result.id}` : `/knowledge/${result.id}`;
  return (
    <Link href={href} className="block rounded-md border bg-card p-3 hover:bg-accent">
      <div className="flex items-baseline gap-2">
        <Badge variant={result.type === 'bridge' ? 'default' : 'secondary'}>
          {result.type === 'bridge' ? tCommon('bridge') : tCommon('knowledge_point')}
        </Badge>
        <p className="font-medium">{result.name}</p>
        {result.aliases && <span className="text-xs text-muted-foreground">{result.aliases}</span>}
      </div>
      {result.highlight && (
        <p
          className="mt-1 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: result.highlight }}
        />
      )}
      {(result.bridge_type || result.era || result.region || result.line) && (
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {result.line && <span>{t('result_line_prefix', { line: result.line })}</span>}
          {result.bridge_type && <span>{result.bridge_type}</span>}
          {result.era && <span>{result.era}</span>}
          {result.region && <span>{result.region}</span>}
        </div>
      )}
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}>
      <SearchContent />
    </Suspense>
  );
}
