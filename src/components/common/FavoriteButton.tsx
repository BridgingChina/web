'use client';
import { useFavoriteCheck, useAddFavorite, useRemoveFavorite } from '@/api/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  targetType: 'bridge' | 'knowledge_point' | 'flashcard';
  targetId: string;
}

export function FavoriteButton({ targetType, targetId }: Props) {
  const targets = useMemo(() => [{ type: targetType, id: targetId }], [targetType, targetId]);
  const { data: results } = useFavoriteCheck(targets);
  const add = useAddFavorite();
  const remove = useRemoveFavorite();

  const entry = results?.[targetId];
  const favorited = !!entry?.favorited;
  const favoriteId = entry?.favorite_id;
  const pending = add.isPending || remove.isPending;

  function toggle() {
    if (pending) return;
    if (favorited && favoriteId) remove.mutate(favoriteId);
    else add.mutate({ target_type: targetType, target_id: targetId });
  }

  return (
    <Button variant={favorited ? 'default' : 'outline'} size="sm" onClick={toggle} disabled={pending}>
      <Heart className={`mr-1.5 h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
      {favorited ? '已收藏' : '收藏'}
    </Button>
  );
}
