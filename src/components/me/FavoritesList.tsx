'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useFavoriteList, useRemoveFavorite } from '@/api/hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const TYPES = [
  { id: 'all', label: '全部' },
  { id: 'bridge', label: '桥梁' },
  { id: 'knowledge_point', label: '知识点' },
  { id: 'flashcard', label: '卡片' },
] as const;

export function FavoritesList() {
  const [type, setType] = useState<typeof TYPES[number]['id']>('all');
  const apiType = type === 'all' ? undefined : type;
  const { data, isLoading } = useFavoriteList(apiType);
  const remove = useRemoveFavorite();
  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`rounded-md px-3 py-1 text-sm ${type === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}
          >{t.label}</button>
        ))}
      </div>
      {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      {!isLoading && items.length === 0 && (
        <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          还没有收藏，去 <Link href="/knowledge" className="underline">知识图谱</Link> 或 <Link href="/map" className="underline">地图</Link> 探索吧。
        </p>
      )}
      {items.map(item => {
        const href = item.target_type === 'bridge' ? `/bridges/${item.target_id}` : `/knowledge/${item.target_id}`;
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
            <Link href={href} className="flex-1">
              <div className="flex items-baseline gap-2">
                <Badge variant={item.target_type === 'bridge' ? 'default' : 'secondary'}>
                  {item.target_type === 'bridge' ? '桥梁' : item.target_type === 'knowledge_point' ? '知识点' : '卡片'}
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
              aria-label="取消收藏"
            >
              <Heart className="h-4 w-4 fill-current text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
