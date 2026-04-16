'use client';
import { useParams } from 'next/navigation';
import { useKnowledgePointFlashcards, useKnowledgePointDetail } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewSession } from '@/components/flashcard/ReviewSession';

export default function FlashcardsPage() {
  const { kpId } = useParams<{ kpId: string }>();
  const { data: cards, isLoading, error } = useKnowledgePointFlashcards(kpId);
  const { data: kp } = useKnowledgePointDetail(kpId);

  return (
    <div className="space-y-4">
      {kp && <h1 className="text-xl font-semibold">{kp.name} · 卡片练习</h1>}
      {isLoading && <Skeleton className="h-80 w-full max-w-xl mx-auto" />}
      {error && <p className="text-sm text-destructive">加载失败：{(error as Error).message}</p>}
      {cards && <ReviewSession cards={cards} backHref={`/knowledge/${kpId}`} />}
    </div>
  );
}
