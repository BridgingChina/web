'use client';
import { useState } from 'react';
import { MainlineNav } from '@/components/knowledge/MainlineNav';
import { KnowledgeTreeWeb } from '@/components/knowledge/KnowledgeTreeWeb';

export default function HomePage() {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">四大主线</p>
        <MainlineNav selectedId={selectedLineId} onSelect={setSelectedLineId} />
      </aside>

      <section>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">知识图谱</h1>
        <KnowledgeTreeWeb selectedLineId={selectedLineId} />
      </section>

      <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">最近浏览</h2>
          <p className="text-xs text-muted-foreground">浏览历史将在「我的」页接入。</p>
        </div>
      </aside>
    </div>
  );
}
