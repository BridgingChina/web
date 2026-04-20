import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <section
      className="relative -mx-4 -my-6 flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0a0f1e 0%, #14213d 55%, #1d3557 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] -top-[10%] h-[55%] w-[55%] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,160,74,0.35) 0%, rgba(212,160,74,0) 70%)',
        }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <h1 className="font-serif text-[clamp(48px,9vw,112px)] font-bold leading-[1.05] tracking-[0.12em] text-slate-50">
          千年古桥　一念即达
        </h1>
        <p className="mt-6 text-sm tracking-[0.3em] text-slate-300/80 md:text-base">
          中国古桥知识图谱 · 桥知 BridgingChina
        </p>
        <Link href="/knowledge" className="mt-12">
          <Button size="lg" className="focus-visible:ring-white/70 focus-visible:border-white">开始探索</Button>
        </Link>
      </div>
    </section>
  );
}
