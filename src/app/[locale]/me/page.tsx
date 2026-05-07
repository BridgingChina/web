'use client';
import { useTranslations } from 'next-intl';
import { useSession } from '@/lib/auth-client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { TodayReviewCard } from '@/components/me/TodayReviewCard';
import { FavoritesList } from '@/components/me/FavoritesList';
import { HistoryList } from '@/components/me/HistoryList';
import { SettingsPanel } from '@/components/me/SettingsPanel';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';

function buildLoginHref(): string {
  if (typeof window === 'undefined') return `${AUTH_URL}/auth/login`;
  return `${AUTH_URL}/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`;
}

function MeSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function LoginPrompt() {
  const t = useTranslations('me');
  return (
    <div
      className="mx-auto max-w-md space-y-5 rounded-lg border p-8 text-center"
      style={{ background: 'var(--rice-paper)', borderColor: 'var(--stone-grey)' }}
    >
      <h2 className="font-sans text-lg font-semibold text-foreground">
        {t('login_required_title')}
      </h2>
      <p className="font-sans text-sm text-muted-foreground">
        {t('login_required_description')}
      </p>
      <a className={buttonVariants({ variant: 'default' })} href={buildLoginHref()}>
        {t('go_sign_in')}
      </a>
    </div>
  );
}

export default function MePage() {
  const tMe = useTranslations('me');
  const { data: session, isPending } = useSession();
  if (isPending) return <MeSkeleton />;
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl pt-12">
        <LoginPrompt />
      </div>
    );
  }

  const greeting = session.user.name || session.user.email;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        {/* Page title: sans (Title style) — narrator, not subject */}
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
          {tMe('title')}
        </h1>
        <p className="mt-1 font-sans text-sm text-muted-foreground">{greeting}</p>
      </div>

      <TodayReviewCard />

      <Tabs defaultValue="favorites">
        <TabsList>
          <TabsTrigger value="favorites">{tMe('tabs.favorites')}</TabsTrigger>
          <TabsTrigger value="history">{tMe('tabs.history')}</TabsTrigger>
          <TabsTrigger value="settings">{tMe('tabs.settings')}</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites" className="pt-4"><FavoritesList /></TabsContent>
        <TabsContent value="history" className="pt-4"><HistoryList /></TabsContent>
        <TabsContent value="settings" className="pt-4"><SettingsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
