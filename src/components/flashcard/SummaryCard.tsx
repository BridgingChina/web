'use client';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface Props { total: number; mastered: number; needsReview: number; backHref?: string; }

export function SummaryCard({ total, mastered, needsReview, backHref }: Props) {
  const router = useRouter();
  const t = useTranslations('flashcard');
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">{t('summary_title')}</h2>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label={t('summary_total')} value={total} />
        <Stat label={t('summary_mastered')} value={mastered} highlight />
        <Stat label={t('summary_needs_review')} value={needsReview} />
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {backHref ? (
          <Link href={backHref}><Button className="w-full">{t('back')}</Button></Link>
        ) : (
          <Button className="w-full" onClick={() => router.back()}>{t('back')}</Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? 'bg-accent text-accent-foreground' : ''}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
