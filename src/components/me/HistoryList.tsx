'use client';
import Link from 'next/link';
import { useHistory } from '@/api/hooks/useHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { HistoryItem } from '@/api/types';

function bucketDate(iso: string): '今天' | '昨天' | '更早' {
  const d = new Date(iso); const today = new Date();
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const tDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = (tDay - dDay) / 86400000;
  if (diff < 1) return '今天';
  if (diff < 2) return '昨天';
  return '更早';
}

export function HistoryList() {
  const { data, isLoading } = useHistory();
  const items: HistoryItem[] = data?.data?.items ?? [];

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (items.length === 0) return <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">还没有浏览记录。</p>;

  const groups: Record<string, HistoryItem[]> = {};
  items.forEach(it => {
    const k = bucketDate(it.viewed_at);
    (groups[k] ??= []).push(it);
  });

  return (
    <div className="space-y-5">
      {(['今天', '昨天', '更早'] as const).map(k => groups[k] && (
        <section key={k}>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">{k}</h3>
          <ul className="space-y-1.5">
            {groups[k].map((it, i) => (
              <li key={`${it.target_id}-${i}`} className="rounded border bg-card p-2 text-sm">
                <Link href={it.target_type === 'bridge' ? `/bridges/${it.target_id}` : `/knowledge/${it.target_id}`} className="flex items-center gap-2 hover:underline">
                  <Badge variant={it.target_type === 'bridge' ? 'default' : 'secondary'} className="text-[10px]">
                    {it.target_type === 'bridge' ? '桥' : '知识点'}
                  </Badge>
                  <span className="flex-1">{it.target_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(it.viewed_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
