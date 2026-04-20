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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-8 text-center">
      <h2 className="text-lg font-semibold">需要登录</h2>
      <p className="text-sm text-muted-foreground">
        登录后可同步收藏、复习进度与浏览历史。
      </p>
      <a className={buttonVariants({ variant: 'default' })} href={buildLoginHref()}>
        前往登录
      </a>
    </div>
  );
}

export default function MePage() {
  const t = useTranslations('common');
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
        <h1 className="text-2xl font-semibold tracking-tight">我的</h1>
        <p className="mt-1 text-sm text-muted-foreground">{greeting}</p>
      </div>
      <TodayReviewCard />
      <Tabs defaultValue="favorites">
        <TabsList>
          <TabsTrigger value="favorites">收藏</TabsTrigger>
          <TabsTrigger value="history">浏览历史</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites" className="pt-4"><FavoritesList /></TabsContent>
        <TabsContent value="history" className="pt-4"><HistoryList /></TabsContent>
        <TabsContent value="settings" className="pt-4"><SettingsPanel /></TabsContent>
      </Tabs>
      <section className="mt-8 border-t pt-6">
        <h2 className="text-lg font-medium mb-3">{t('settings')}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Language / 语言</span>
          <LanguageSwitcher />
        </div>
      </section>
    </div>
  );
}
