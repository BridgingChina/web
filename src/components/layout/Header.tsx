'use client';
import { Search, MessageCircleQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useQAStore } from '@/stores/qaStore';
import { cn } from '@/lib/utils';

const NAV: { href: string; labelKey: 'knowledge_graph' | 'map' | 'recognize' | 'me' }[] = [
  { href: '/knowledge', labelKey: 'knowledge_graph' },
  { href: '/map', labelKey: 'map' },
  { href: '/recognize', labelKey: 'recognize' },
  { href: '/me', labelKey: 'me' },
];

export function Header() {
  const open = useQAStore((s) => s.open);
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');
  const tCommon = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">{tHeader('brand')}</Link>
        <nav className="flex gap-1 text-sm">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
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
                {tNav(n.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />{tCommon('search')}
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => open({ type: null })}>
            <MessageCircleQuestion className="mr-2 h-4 w-4" />{tCommon('ask')}
          </Button>
        </div>
      </div>
    </header>
  );
}
