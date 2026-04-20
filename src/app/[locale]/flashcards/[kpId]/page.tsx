'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useKnowledgePointFlashcards, useKnowledgePointDetail } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewSession } from '@/components/flashcard/ReviewSession';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useTranslateError } from '@/lib/error-message';

export default function FlashcardsPage() {
  const { kpId } = useParams<{ kpId: string }>();
  const { data: cards, isLoading, error } = useKnowledgePointFlashcards(kpId);
  const { data: kp } = useKnowledgePointDetail(kpId);
  const t = useTranslations('flashcard');
  const translateError = useTranslateError();

  return (
    <div className="space-y-4">
      {kp && <h1 className="text-xl font-semibold">{t('page_title', { name: kp.name })}</h1>}
      {isLoading && <Skeleton className="h-80 w-full max-w-xl mx-auto" />}
      {error && <ErrorState message={translateError(error)} />}
      {cards && <ReviewSession cards={cards} backHref={`/knowledge/${kpId}`} />}
    </div>
  );
}
