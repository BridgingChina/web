'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useHistory } from '@/api/hooks/useHistory';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { HistoryItem } from '@/api/types';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';

function buildLoginHref(): string {
  if (typeof window === 'undefined') return `${AUTH_URL}/auth/login`;
  return `${AUTH_URL}/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`;
}

const MAX_ITEMS = 6;

export function RecentHistoryAside() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Shell><Skeleton className="h-24 w-full" /></Shell>;
  if (!session) return <Shell><AnonPrompt /></Shell>;
  return <AuthedRecentHistory />;
}

function Shell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('knowledge');
  return (
    <div className="rounded-md border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium">{t('recent_views_title')}</h2>
      {children}
    </div>
  );
}

function AnonPrompt() {
  const t = useTranslations('knowledge');
  return (
    <p className="text-xs text-muted-foreground">
      {t.rich('recent_login_prompt', {
        login: (chunks) => (
          <a href={buildLoginHref()} className="underline">
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}

function AuthedRecentHistory() {
  const { data, isLoading } = useHistory(1);
  const items: HistoryItem[] = (data?.data?.items ?? []).slice(0, MAX_ITEMS);

  const t = useTranslations('knowledge');
  const tCommon = useTranslations('common');
  const tHistory = useTranslations('me.history');

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{t('recent_views_title')}</h2>
        {items.length > 0 && (
          <Link href="/me" className="text-xs text-muted-foreground hover:underline">
            {tCommon('all')}
          </Link>
        )}
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}

      {!isLoading && items.length === 0 && (
        <p className="text-xs text-muted-foreground">{t('recent_empty')}</p>
      )}

      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={`${it.target_id}-${i}`}>
              <Link
                href={it.target_type === 'bridge' ? `/bridges/${it.target_id}` : `/knowledge/${it.target_id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Badge
                  variant={it.target_type === 'bridge' ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {it.target_type === 'bridge' ? tHistory('bridge_badge') : tCommon('knowledge_point')}
                </Badge>
                <span className="flex-1 truncate">{it.target_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
