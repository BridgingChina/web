import type { Citation, Source } from '@/api/types';

export function CitationBadges({ citations, sources }: { citations?: Citation[]; sources?: Source[] }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {citations.map((c, i) => {
        const idx = sources?.findIndex(s => s.id === c.source_id) ?? -1;
        const label = idx >= 0 ? idx + 1 : i + 1;
        const src = idx >= 0 ? sources![idx] : undefined;
        const title = src
          ? `${src.title}${src.author ? ` · ${src.author}` : ''}${src.location ? ` · ${src.location}` : ''}`
          : c.title;
        return (
          <a
            key={`${c.source_id}-${i}`}
            href={`#source-${c.source_id}`}
            title={title}
            className="rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 hover:bg-blue-100"
          >
            [{label}]
          </a>
        );
      })}
    </div>
  );
}
