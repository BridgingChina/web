'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useKnowledgeTree } from '@/api/hooks/useKnowledge';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeTreeCategory, KnowledgeTreeSubCategory } from '@/api/types';

interface Props {
  selectedLineId: string | null;
}

export function KnowledgeTreeWeb({ selectedLineId }: Props) {
  const { data, isLoading, error } = useKnowledgeTree();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }
  if (error) return <p className="text-sm text-destructive">加载失败：{(error as Error).message}</p>;
  if (!data) return null;

  const line = selectedLineId ? data.lines.find(l => l.id === selectedLineId) : data.lines[0];
  if (!line) return <p className="text-sm text-muted-foreground">暂无数据</p>;

  return <CategoryList categories={line.children} />;
}

function CategoryList({ categories }: { categories: KnowledgeTreeCategory[] }) {
  return (
    <ul className="space-y-2">
      {categories.map((cat) => <CategoryNode key={cat.id} category={cat} />)}
    </ul>
  );
}

function CategoryNode({ category }: { category: KnowledgeTreeCategory }) {
  const [open, setOpen] = useState(true);
  return (
    <li className="rounded-md border bg-card">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-accent/50"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span>{category.name}</span>
      </button>
      {open && category.children.length > 0 && (
        <ul className="space-y-1 border-t px-3 py-2">
          {category.children.map((sub) => <SubCategoryNode key={sub.id} sub={sub} />)}
        </ul>
      )}
    </li>
  );
}

function SubCategoryNode({ sub }: { sub: KnowledgeTreeSubCategory }) {
  return (
    <li>
      <p className="px-1 py-1 text-xs text-muted-foreground">{sub.name}</p>
      <ul className="space-y-0.5">
        {sub.children.map((kp) => (
          <li key={kp.id}>
            <Link
              href={`/knowledge/${kp.id}`}
              className={cn(
                'flex items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent',
              )}
            >
              <span className="flex-1">{kp.name}</span>
              {kp.tags?.[0] && <Badge variant="secondary" className="text-[10px]">{kp.tags[0]}</Badge>}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
