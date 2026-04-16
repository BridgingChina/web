'use client';
import { motion } from 'framer-motion';
import type { FlashCard } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Props { card: FlashCard; flipped: boolean; onClick: () => void; }

export function FlashCardFlip({ card, flipped, onClick }: Props) {
  return (
    <div onClick={onClick} className="relative h-80 cursor-pointer perspective-1000">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-full w-full preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-center shadow-sm"
        >
          <Badge variant="outline">{card.card_type === 'concept' ? '概念卡' : '辨识卡'}</Badge>
          <h2 className="text-2xl font-semibold tracking-tight">{card.front.title}</h2>
          {card.front.hint && <p className="text-sm text-muted-foreground">{card.front.hint}</p>}
          <p className="absolute bottom-4 text-xs text-muted-foreground">点击翻转</p>
        </div>
        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 flex flex-col gap-3 overflow-y-auto rounded-lg border bg-card p-8 shadow-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">答案</p>
          <p className="whitespace-pre-wrap leading-relaxed">{card.back.answer}</p>
          {card.back.key_features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {card.back.key_features.map((k, i) => <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>)}
            </div>
          )}
          {card.back.example_bridge && (
            <p className="mt-auto text-xs text-muted-foreground">
              典型桥例：<Link href={`/bridges/${card.back.example_bridge.id}`} className="text-blue-600 hover:underline">{card.back.example_bridge.name}</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
