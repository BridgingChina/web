import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const isCJK = locale.startsWith('zh');

  // CJK 4 字一行 vs EN 长单词混排：字号曲线必须分开校。
  // CN 走原 display 上限；EN 用 \n 显式两行，每行 nowrap，避免被 maxWidth 二次回卷。
  const titleStyle = isCJK
    ? {
        color: 'var(--accent)',
        fontSize: 'clamp(56px, 12vw, 144px)',
        letterSpacing: '0.04em',
        maxWidth: '12ch',
      }
    : {
        color: 'var(--accent)',
        fontSize: 'clamp(40px, 7.5vw, 88px)',
        letterSpacing: '0.01em',
      };

  return (
    <section className="relative -mx-4 -my-6 flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden bg-background">
      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {t('hero_brand_caption')}
        </p>

        <h1
          className="whitespace-pre-line font-serif font-semibold leading-[1.05]"
          style={titleStyle}
        >
          {t('hero_title')}
        </h1>

        <p className="mt-10 flex max-w-2xl flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-foreground/90">
          <span className="font-serif text-[clamp(18px,2vw,24px)] font-medium leading-[1.55] tracking-[0.01em]">
            {t('hero_subtitle')}
          </span>
          {t('hero_separator') && (
            <span
              aria-hidden
              className="font-serif text-[clamp(18px,2vw,24px)] font-medium leading-[1.55] text-muted-foreground"
            >
              {t('hero_separator')}
            </span>
          )}
          <span
            lang="zh-Hans"
            className="font-serif text-[clamp(18px,2vw,24px)] font-medium leading-[1.55] whitespace-nowrap"
          >
            {t('hero_brand')}
            <span className="ml-1 font-serif text-[0.85em] tracking-wide">
              {t('hero_brand_caption')}
            </span>
          </span>
        </p>

        <div
          aria-hidden
          className="my-12 h-px w-24"
          style={{ background: 'var(--stone-grey-deep)' }}
        />

        <Link
          href="/knowledge"
          className="group inline-flex h-14 items-center gap-3 rounded-md bg-primary px-10 text-[15px] font-medium tracking-[0.04em] text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-px hover:bg-accent hover:shadow-[0_1px_2px_rgba(31,31,30,0.04),0_4px_12px_rgba(31,31,30,0.06)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {t('cta')}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>

        <figure className="mt-16 flex max-w-md flex-col items-center gap-2 text-muted-foreground">
          <blockquote
            className="font-serif text-[15px] italic leading-[1.7]"
            lang={isCJK ? 'zh-Hans' : 'en'}
          >
            {t('quote_primary')}
          </blockquote>
          <figcaption
            className="font-serif text-[13px] leading-[1.55] text-muted-foreground/80"
            lang={isCJK ? 'en' : 'zh-Hans'}
          >
            {t('quote_secondary')}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
