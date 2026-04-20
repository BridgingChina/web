'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

type AppLocale = 'zh-CN' | 'en-US';

const LANGUAGES: { value: AppLocale; label: string }[] = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
];

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Pure side-effect function kept outside the component so React Compiler's
// `react-hooks/immutability` rule doesn't flag the `document.cookie` write.
// Persists the chosen locale so the next SSR pass (before the URL prefix
// resolves) can pick it up.
function persistLocaleCookie(locale: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: AppLocale) => {
    if (next === locale) return;
    persistLocaleCookie(next);
    // TODO(Phase 4): once better-auth client lands, also PATCH the auth Worker
    // to sync preferred_locale on the user record when signed in.
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="flex items-center gap-2">
      {LANGUAGES.map((lang) => {
        const active = lang.value === locale;
        return (
          <button
            key={lang.value}
            type="button"
            onClick={() => switchTo(lang.value)}
            disabled={active || isPending}
            aria-pressed={active}
            className={
              active
                ? 'px-3 py-1 rounded bg-primary text-primary-foreground text-sm'
                : 'px-3 py-1 rounded border border-input hover:bg-accent text-sm disabled:opacity-50'
            }
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
