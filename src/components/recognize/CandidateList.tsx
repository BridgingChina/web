'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { RecognitionResponse } from '@/api/types';

interface Props { result: RecognitionResponse; onReset: () => void; }

export function CandidateList({ result, onReset }: Props) {
  if (result.candidates.length === 0) {
    const fb = result.fallback_suggestions;
    return (
      <div className="space-y-4 rounded-md border bg-muted/20 p-6 text-center">
        <p className="text-sm font-medium">未能识别这张图片</p>
        <p className="text-xs text-muted-foreground">试试以下兜底入口：</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/search?q=${encodeURIComponent(fb?.search_hint ?? '')}`}>
            <Button size="sm" variant="outline">去搜索{fb?.search_hint ? `（${fb.search_hint}）` : ''}</Button>
          </Link>
          <Link href={`/map${fb?.region_hint ? `?region=${encodeURIComponent(fb.region_hint)}` : ''}`}>
            <Button size="sm" variant="outline">去地图{fb?.region_hint ? `（${fb.region_hint}）` : ''}筛选</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onReset}>重新上传</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">候选桥梁（{result.candidates.length}）</h2>
        <Button size="sm" variant="ghost" onClick={onReset}>重新上传</Button>
      </div>
      {result.candidates.map((c) => (
        <Link key={c.bridge_id} href={`/bridges/${c.bridge_id}`}
          className="block rounded-md border bg-card p-4 hover:bg-accent">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-semibold">{c.name}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            <Badge>{c.bridge_type}</Badge>
            <Badge variant="secondary">{c.era}</Badge>
            <Badge variant="outline">{c.region}</Badge>
          </div>
          {c.confidence_hints?.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {c.confidence_hints.map((h, i) => <li key={i}>· {h}</li>)}
            </ul>
          )}
        </Link>
      ))}
    </div>
  );
}
