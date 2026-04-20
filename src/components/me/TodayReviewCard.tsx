'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useReviewToday } from '@/api/hooks/useReview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, BookOpen } from 'lucide-react';

export function TodayReviewCard() {
  const { data, isLoading } = useReviewToday();
  const t = useTranslations('me.review');

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data) return null;
  const due = data.total_due;

  if (due === 0) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-emerald-50 px-4 py-3 text-emerald-900">
        <CheckCircle2 className="h-5 w-5" />
        <p className="text-sm">{t('done_today')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-accent/40 px-4 py-3">
      <BookOpen className="h-5 w-5" />
      <div className="flex-1">
        <p className="font-medium">{t('due_count', { count: due })}</p>
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
      <Link href="/me/review-today"><Button size="sm">{t('start')}</Button></Link>
    </div>
  );
}
