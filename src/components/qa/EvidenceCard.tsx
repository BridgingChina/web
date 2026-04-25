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
 * Phase B QA evidence card.
 * - Citation index [n]: mono font + vermilion signal color (DESIGN.md: Vermilion Signal Rule)
 * - Card: rice-paper bg + 1px stone-grey border + rounded-lg (flat by default, no static shadow)
 * - In `en-US` locale: backend English summary primary, optional reveal of zh excerpt
 * - In `zh-CN` locale: Chinese content primary, no toggle
 */
export function EvidenceCard({ source, index }: EvidenceCardProps) {
  const locale = useLocale();
  const t = useTranslations('qa.evidence');

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
      <article
        className="rounded-lg border p-3 font-sans text-sm"
        style={{ background: 'var(--rice-paper)', borderColor: 'var(--stone-grey)' }}
      >
        <header className="flex items-baseline gap-2">
          {/* Evidence chip: mono + vermilion — DESIGN.md chip-evidence + Vermilion Signal Rule */}
          <span
            className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[13px] font-medium leading-[1.5]"
            style={{
              background: 'var(--stone-grey)',
              color: 'var(--vermilion)',
              fontSize: '13px',
            }}
          >
            [{String(index).padStart(2, '0')}]
          </span>
          <p className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-foreground">
            {title}
          </p>
        </header>
        {meta.length > 0 && (
          <p className="mt-1 font-sans text-xs text-muted-foreground">{meta.join(' · ')}</p>
        )}
        {primary && (
          <p className="mt-2 max-w-[65ch] whitespace-pre-wrap font-sans text-sm leading-[1.6] text-foreground">
            {primary}
          </p>
        )}
        {hasOriginalToggle && (
          <button
            type="button"
            onClick={() => toggle(chunkKey)}
            className="mt-2 font-sans text-xs transition-colors"
            style={{ color: 'var(--songci-celadon)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            aria-expanded={expanded}
          >
            {expanded ? t('hide_original') : t('show_original')}
          </button>
        )}
        {expanded && source.text_zh && (
          <p
            lang="zh-CN"
            className="mt-2 whitespace-pre-wrap border-l border-border pl-3 font-sans text-sm leading-[1.6] text-muted-foreground"
            style={{ borderColor: 'var(--stone-grey)' }}
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
    <article
      className="rounded-lg border p-3 font-sans text-sm"
      style={{ background: 'var(--rice-paper)', borderColor: 'var(--stone-grey)' }}
    >
      <header className="flex items-baseline gap-2">
        {/* Evidence chip: mono + vermilion signal color */}
        <span
          className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono font-medium leading-[1.5]"
          style={{
            background: 'var(--stone-grey)',
            color: 'var(--vermilion)',
            fontSize: '13px',
          }}
        >
          [{String(index).padStart(2, '0')}]
        </span>
        <p className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-foreground">
          {title}
        </p>
      </header>
      {meta.length > 0 && (
        <p className="mt-1 font-sans text-xs text-muted-foreground">{meta.join(' · ')}</p>
      )}
      {zhBody && (
        <p className="mt-2 max-w-[65ch] whitespace-pre-wrap font-sans text-sm leading-[1.6] text-foreground">
          {zhBody}
        </p>
      )}
    </article>
  );
}
