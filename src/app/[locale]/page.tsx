import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('home');
  return (
    <section className="relative -mx-4 -my-6 flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden bg-background">
      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          BridgingChina · v1
        </p>

        <h1
          className="whitespace-pre-line font-serif text-[clamp(56px,12vw,156px)] font-semibold leading-[1.02] tracking-[0.06em]"
          style={{ color: 'var(--songci-celadon)' }}
        >
          {t('hero_title')}
        </h1>

        <p className="mt-10 max-w-2xl font-serif text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.55] tracking-[0.02em] text-foreground/90">
          {t('hero_subtitle')}
        </p>

        <div
          aria-hidden
          className="my-12 h-px w-24"
          style={{ background: 'var(--stone-grey-deep)' }}
        />

        <Link
          href="/knowledge"
          className="group inline-flex h-14 items-center gap-3 rounded-md bg-primary px-10 text-[15px] font-medium tracking-[0.04em] text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-px hover:bg-accent hover:shadow-[0_1px_2px_rgba(31,31,30,0.04),0_4px_12px_rgba(31,31,30,0.06)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
        >
          {t('cta')}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
        </Link>

        <p className="mt-16 max-w-md font-serif text-sm italic leading-[1.7] text-muted-foreground">
          “一桥一典，一典一城。”
          <span className="mt-2 block font-sans text-[11px] not-italic uppercase tracking-[0.2em]">
            One bridge, one chapter · one city.
          </span>
        </p>
      </div>
    </section>
  );
}
