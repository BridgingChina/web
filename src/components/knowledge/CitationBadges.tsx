import type { Source } from '@/api/types';

export function CitationBadges({ citations, sources }: { citations?: number[]; sources?: Source[] }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {citations.map(c => {
        const src = sources?.find(s => s.id === c);
        const title = src ? `${src.title}${src.author ? ` · ${src.author}` : ''}${src.location ? ` · ${src.location}` : ''}` : `引用 ${c}`;
        return (
          <a
            key={c}
            href={`#source-${c}`}
            title={title}
            className="rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 hover:bg-blue-100"
          >
            [{c}]
          </a>
        );
      })}
    </div>
  );
}
