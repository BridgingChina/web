'use client';
import Link from 'next/link';
import { Search, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQAStore } from '@/stores/qaStore';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: '知识图谱' },
  { href: '/map', label: '地图' },
  { href: '/recognize', label: '识景' },
  { href: '/search', label: '搜索' },
  { href: '/me', label: '我的' },
];

export function Header() {
  const open = useQAStore((s) => s.open);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">筑脉 ArchTrail</Link>
        <nav className="flex gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-md px-3 py-1.5 transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" aria-label="搜索"><Search className="h-4 w-4" /></Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => open({ type: null })}>
            <MessageCircleQuestion className="mr-2 h-4 w-4" />提问
          </Button>
        </div>
      </div>
    </header>
  );
}
