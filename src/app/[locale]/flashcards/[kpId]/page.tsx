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
    <div className="space-y-6">
      {kp && (
        <header className="space-y-0.5">
          {/* Context label: sans label style */}
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t('context_label')}
          </p>
          {/* Knowledge point name: serif headline — this IS the "subject being described" */}
          <h1
            className="font-serif text-[clamp(22px,3vw,32px)] font-semibold leading-[1.2] tracking-[0.02em] text-foreground"
          >
            {t('page_title', { name: kp.name })}
          </h1>
        </header>
      )}
      {isLoading && <Skeleton className="mx-auto h-80 w-full max-w-xl" />}
      {error && <ErrorState message={translateError(error)} />}
      {cards && <ReviewSession cards={cards} backHref={`/knowledge/${kpId}`} />}
    </div>
  );
}
