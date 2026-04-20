'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MainlineNav } from '@/components/knowledge/MainlineNav';
import { KnowledgeTreeWeb } from '@/components/knowledge/KnowledgeTreeWeb';

export default function HomePage() {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const t = useTranslations('knowledge');

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('mainlines_label')}</p>
        <MainlineNav selectedId={selectedLineId} onSelect={setSelectedLineId} />
      </aside>

      <section>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <KnowledgeTreeWeb selectedLineId={selectedLineId} />
      </section>

      <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">{t('recent_views_title')}</h2>
          <p className="text-xs text-muted-foreground">{t('recent_views_hint')}</p>
        </div>
      </aside>
    </div>
  );
}
