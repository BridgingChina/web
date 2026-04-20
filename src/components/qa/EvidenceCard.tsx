'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useQAStore } from '@/stores/qaStore';
import type { Source } from '@/api/types';

interface EvidenceCardProps {
  source: Source;
  /** 1-based citation index rendered in the UI (matches [n] references). */
  index: number;
}

/**
 * Phase 4 QA evidence card. In `en-US` locale we show the backend-provided
 * English summary (`text_en`) as the primary content with a disclosure that
 * reveals the raw Chinese excerpt (`text_zh`). In `zh-CN` the Chinese text
 * stays primary and there is no disclosure. Styling matches the existing
 * `rounded-xl border bg-card` pattern used elsewhere in the QA panel.
 */
export function EvidenceCard({ source, index }: EvidenceCardProps) {
  const locale = useLocale();
  const t = useTranslations('qa.evidence');

  // Stable key for the showOriginal map — prefer `chunk_id` when present,
  // otherwise fall back to the citation `source_id` / `id` so pre-Phase-4
  // responses still work.
  const chunkKey = source.chunk_id ?? source.id;
  const expanded = useQAStore((s) => !!s.showOriginal[chunkKey]);
  const toggle = useQAStore((s) => s.toggleShowOriginal);

  const title = source.source_title ?? source.title;
  const meta: string[] = [];
  if (source.author) meta.push(source.author);
  if (source.location) meta.push(source.location);

  if (locale === 'en-US') {
    const primary = source.text_en ?? source.text_zh ?? source.excerpt;
    const hasOriginalToggle = !!source.text_en && !!source.text_zh;
    return (
      <article className="rounded-xl border bg-card p-3 text-sm">
        <header className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-blue-600">[{index}]</span>
          <p className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</p>
        </header>
        {meta.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{meta.join(' · ')}</p>
        )}
        {primary && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {primary}
          </p>
        )}
        {hasOriginalToggle && (
          <button
            type="button"
            onClick={() => toggle(chunkKey)}
            className="mt-2 text-xs text-blue-600 underline-offset-2 hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? t('hide_original') : t('show_original')}
          </button>
        )}
        {expanded && source.text_zh && (
          <p
            lang="zh-CN"
            className="mt-2 whitespace-pre-wrap border-l-2 border-muted pl-3 text-sm leading-relaxed text-muted-foreground"
          >
            {source.text_zh}
          </p>
        )}
      </article>
    );
  }

  // zh-CN (and any other locale fallback): Chinese content primary.
  const zhBody = source.text_zh ?? source.excerpt;
  return (
    <article className="rounded-xl border bg-card p-3 text-sm">
      <header className="flex items-baseline gap-2">
        <span className="text-xs font-medium text-blue-600">[{index}]</span>
        <p className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</p>
      </header>
      {meta.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">{meta.join(' · ')}</p>
      )}
      {zhBody && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {zhBody}
        </p>
      )}
    </article>
  );
}
