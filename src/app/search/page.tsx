'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/api/hooks/useSearch';
import Link from 'next/link';
import type { SearchResult } from '@/api/types';

const RECENT_KEY = 'archtrail.recent_searches';
const SUGGESTIONS = ['赵州桥', '拱桥', '敞肩拱', '广济桥', '宋元', '石拱桥'];

type SearchType = 'all' | 'knowledge_point' | 'bridge';

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const initialType = (params.get('type') as SearchType) ?? 'all';

  const [text, setText] = useState(initialQ);
  const [type, setType] = useState<SearchType>(initialType);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
      if (Array.isArray(stored)) setRecent(stored.slice(0, 8));
    } catch { /* ignore */ }
  }, []);

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
            placeholder="搜索桥梁或知识点（如 赵州桥、敞肩拱）"
            autoFocus
          />
          <Button onClick={() => submit(text)} disabled={!text.trim()}>搜索</Button>
        </div>
        <div className="flex gap-1 text-sm">
          {(['all', 'knowledge_point', 'bridge'] as SearchType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); if (initialQ) submit(text || initialQ); }}
              className={`rounded-md px-3 py-1 transition-colors ${
                type === t ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              {t === 'all' ? '全部' : t === 'bridge' ? '桥梁' : '知识点'}
            </button>
          ))}
        </div>
      </div>

      {showWaitingState && (
        <div className="space-y-4">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">最近搜索</h2>
                <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground">清除</button>
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
            <h2 className="mb-2 text-sm font-medium">推荐</h2>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
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
          {error && <p className="text-sm text-destructive">搜索失败：{(error as Error).message}</p>}
          {!isLoading && !error && results.length === 0 && (
            <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <p className="mb-2">没有找到与「{initialQ}」匹配的结果</p>
              <p className="text-xs">试试别名（如：赵州桥 / 安济桥），或在地图上探索附近桥梁。</p>
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
  const href = result.type === 'bridge' ? `/bridges/${result.id}` : `/knowledge/${result.id}`;
  return (
    <Link href={href} className="block rounded-md border bg-card p-3 hover:bg-accent">
      <div className="flex items-baseline gap-2">
        <Badge variant={result.type === 'bridge' ? 'default' : 'secondary'}>
          {result.type === 'bridge' ? '桥梁' : '知识点'}
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
          {result.line && <span>主线：{result.line}</span>}
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
