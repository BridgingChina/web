'use client';
import { useKnowledgeTree } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { KnowledgeTreeLine } from '@/api/types';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MainlineNav({ selectedId, onSelect }: Props) {
  const { data, isLoading } = useKnowledgeTree();

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  if (!data) return null;

  return (
    <nav className="space-y-1">
      {data.lines.map((line: KnowledgeTreeLine) => {
        const active = selectedId ? line.id === selectedId : line.id === data.lines[0].id;
        const count = countPoints(line);
        return (
          <button
            key={line.id}
            onClick={() => onSelect(line.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
              active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground',
            )}
          >
            <span className="font-medium">{line.name}</span>
            <span className="text-xs">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}

function countPoints(line: KnowledgeTreeLine): number {
  let n = 0;
  for (const cat of line.children) for (const sub of cat.children) n += sub.children.length;
  return n;
}
