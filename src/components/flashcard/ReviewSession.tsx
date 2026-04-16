'use client';
import { useState, useEffect } from 'react';
import type { FlashCard } from '@/api/types';
import { FlashCardFlip } from './FlashCardFlip';
import { SummaryCard } from './SummaryCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, RotateCw } from 'lucide-react';
import { useUpdateReviewProgress } from '@/api/hooks/useReview';

interface Props { cards: FlashCard[]; backHref?: string; }

export function ReviewSession({ cards, backHref }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, 'mastered' | 'needs_review'>>({});
  const update = useUpdateReviewProgress();

  const card = cards[index];
  const done = index >= cards.length;

  function mark(mastery: 'mastered' | 'needs_review') {
    if (!card) return;
    setResults(r => ({ ...r, [card.id]: mastery }));
    update.mutate({ flashcardId: card.id, mastery });
    next();
  }

  function next() { setFlipped(false); setIndex(i => i + 1); }
  function prev() { setFlipped(false); setIndex(i => Math.max(0, i - 1)); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      else if (e.key === '1') mark('mastered');
      else if (e.key === '2') mark('needs_review');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, done]);

  if (cards.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">暂无可复习的卡片。</p>;
  }

  if (done) {
    const mastered = Object.values(results).filter(v => v === 'mastered').length;
    const needsReview = Object.values(results).filter(v => v === 'needs_review').length;
    return <SummaryCard total={cards.length} mastered={mastered} needsReview={needsReview} backHref={backHref} />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{index + 1} / {cards.length}</span>
        <span className="text-xs">空格 翻转 · 1/2 标记 · ←/→ 切卡</span>
      </div>
      <FlashCardFlip card={card} flipped={flipped} onClick={() => setFlipped(f => !f)} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={prev} disabled={index === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />上一张
        </Button>
        <Button variant="default" className="flex-1" onClick={() => mark('mastered')}>
          <Check className="mr-1 h-4 w-4" />已掌握
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => mark('needs_review')}>
          <RotateCw className="mr-1 h-4 w-4" />待复习
        </Button>
        <Button variant="outline" onClick={next} disabled={index >= cards.length - 1}>
          下一张<ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
