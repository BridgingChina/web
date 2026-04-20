'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useFavoriteList, useRemoveFavorite } from '@/api/hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

// Internal identifiers stay untranslated; display labels come from the common
// namespace (all / bridge / knowledge_point / flashcard).
type FavoriteType = 'all' | 'bridge' | 'knowledge_point' | 'flashcard';
const TYPE_IDS: FavoriteType[] = ['all', 'bridge', 'knowledge_point', 'flashcard'];

export function FavoritesList() {
  const [type, setType] = useState<FavoriteType>('all');
  const apiType = type === 'all' ? undefined : type;
  const { data, isLoading } = useFavoriteList(apiType);
  const remove = useRemoveFavorite();
  const items = data?.data?.items ?? [];
  const tCommon = useTranslations('common');
  const tMe = useTranslations('me');

  const labelFor = (id: FavoriteType) =>
    id === 'all' ? tCommon('all') :
    id === 'bridge' ? tCommon('bridge') :
    id === 'knowledge_point' ? tCommon('knowledge_point') :
    tCommon('flashcard');

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {TYPE_IDS.map(id => (
          <button
            key={id}
            onClick={() => setType(id)}
            className={`rounded-md px-3 py-1 text-sm ${type === id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}
          >{labelFor(id)}</button>
        ))}
      </div>
      {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      {!isLoading && items.length === 0 && (
        <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {tMe.rich('favorites.empty', {
            knowledge: (chunks) => <Link href="/knowledge" className="underline">{chunks}</Link>,
            map: (chunks) => <Link href="/map" className="underline">{chunks}</Link>,
          })}
        </p>
      )}
      {items.map(item => {
        const href = item.target_type === 'bridge' ? `/bridges/${item.target_id}` : `/knowledge/${item.target_id}`;
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
            <Link href={href} className="flex-1">
              <div className="flex items-baseline gap-2">
                <Badge variant={item.target_type === 'bridge' ? 'default' : 'secondary'}>
                  {item.target_type === 'bridge' ? tCommon('bridge')
                    : item.target_type === 'knowledge_point' ? tCommon('knowledge_point')
                    : tCommon('flashcard')}
                </Badge>
                <p className="font-medium">{item.target_name}</p>
              </div>
              {item.target_summary && <p className="text-xs text-muted-foreground">{item.target_summary}</p>}
            </Link>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => remove.mutate(item.id)}
              disabled={remove.isPending}
              aria-label={tCommon('unfavorite')}
            >
              <Heart className="h-4 w-4 fill-current text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
