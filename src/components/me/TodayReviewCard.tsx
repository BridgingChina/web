'use client';
import Link from 'next/link';
import { useReviewToday } from '@/api/hooks/useReview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, BookOpen } from 'lucide-react';

export function TodayReviewCard() {
  const { data, isLoading } = useReviewToday();

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data) return null;
  const due = data.total_due;

  if (due === 0) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-emerald-50 px-4 py-3 text-emerald-900">
        <CheckCircle2 className="h-5 w-5" />
        <p className="text-sm">今日复习已完成 ✓</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-accent/40 px-4 py-3">
      <BookOpen className="h-5 w-5" />
      <div className="flex-1">
        <p className="font-medium">今日复习 {due} 张</p>
        <p className="text-xs text-muted-foreground">坚持每日打卡，巩固识桥要点。</p>
      </div>
      <Link href="/me/review-today"><Button size="sm">开始复习</Button></Link>
    </div>
  );
}
