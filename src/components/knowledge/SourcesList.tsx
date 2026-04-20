'use client';
import { useTranslations } from 'next-intl';
import type { Source } from '@/api/types';

export function SourcesList({ sources }: { sources: Source[] }) {
  const t = useTranslations('knowledge');
  if (!sources || sources.length === 0) return null;
  return (
    <section className="mt-8 rounded-md border bg-muted/20 p-4">
      <h2 className="mb-2 text-sm font-medium">{t('sources_heading')}</h2>
      <ol className="space-y-2 text-xs text-muted-foreground">
        {sources.map((s, i) => (
          <li key={s.id} id={`source-${s.id}`} className="scroll-mt-20">
            <span className="text-blue-600">[{i + 1}]</span> {s.title}
            {s.author ? ` · ${s.author}` : ''} {s.location ? ` · ${s.location}` : ''}
            {s.excerpt && <p className="mt-0.5 italic">&ldquo;{s.excerpt}&rdquo;</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
