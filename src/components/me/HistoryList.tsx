'use client';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useHistory } from '@/api/hooks/useHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { HistoryItem } from '@/api/types';

// Internal bucket identifiers stay in ASCII; display labels come from messages.
type Bucket = 'today' | 'yesterday' | 'earlier';
const BUCKET_ORDER: Bucket[] = ['today', 'yesterday', 'earlier'];

function bucketDate(iso: string): Bucket {
  const d = new Date(iso); const today = new Date();
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const tDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = (tDay - dDay) / 86400000;
  if (diff < 1) return 'today';
  if (diff < 2) return 'yesterday';
  return 'earlier';
}

export function HistoryList() {
  const { data, isLoading } = useHistory();
  const items: HistoryItem[] = data?.data?.items ?? [];
  const locale = useLocale();
  const t = useTranslations('me.history');
  const tCommon = useTranslations('common');

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (items.length === 0) return <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">{t('empty')}</p>;

  const groups: Record<Bucket, HistoryItem[]> = { today: [], yesterday: [], earlier: [] };
  items.forEach(it => {
    const k = bucketDate(it.viewed_at);
    groups[k].push(it);
  });

  return (
    <div className="space-y-5">
      {BUCKET_ORDER.map(k => groups[k].length > 0 && (
        <section key={k}>
          <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">{t(k)}</h3>
          <ul className="space-y-1.5">
            {groups[k].map((it, i) => (
              <li key={`${it.target_id}-${i}`} className="rounded border bg-card p-2 text-sm">
                <Link href={it.target_type === 'bridge' ? `/bridges/${it.target_id}` : `/knowledge/${it.target_id}`} className="flex items-center gap-2 hover:underline">
                  <Badge variant={it.target_type === 'bridge' ? 'default' : 'secondary'} className="text-[10px]">
                    {it.target_type === 'bridge' ? t('bridge_badge') : tCommon('knowledge_point')}
                  </Badge>
                  <span className="flex-1">{it.target_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(it.viewed_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
