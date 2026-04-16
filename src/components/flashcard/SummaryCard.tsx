'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props { total: number; mastered: number; needsReview: number; backHref?: string; }

export function SummaryCard({ total, mastered, needsReview, backHref }: Props) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">本次复习完成</h2>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="共" value={total} />
        <Stat label="已掌握" value={mastered} highlight />
        <Stat label="待复习" value={needsReview} />
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {backHref ? (
          <Link href={backHref}><Button className="w-full">返回</Button></Link>
        ) : (
          <Button className="w-full" onClick={() => router.back()}>返回</Button>
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
