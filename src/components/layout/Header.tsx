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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        {/* Brand: serif + songci-celadon — Songti Reserve Rule: only the brand name, not nav */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-wide transition-colors duration-150"
          style={{ color: 'var(--songci-celadon)' }}
        >
          {tHeader('brand')}
        </Link>

        <nav className="flex gap-0.5 text-sm" aria-label="Main navigation">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors duration-150',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
                style={active ? { color: 'var(--songci-celadon-deep)' } : undefined}
              >
                {tNav(n.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{tCommon('search')}</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => open({ type: null })}
          >
            <MessageCircleQuestion className="h-4 w-4" />
            <span className="hidden sm:inline">{tCommon('ask')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
