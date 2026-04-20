'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TodayReviewCard } from '@/components/me/TodayReviewCard';
import { FavoritesList } from '@/components/me/FavoritesList';
import { HistoryList } from '@/components/me/HistoryList';
import { SettingsPanel } from '@/components/me/SettingsPanel';

export default function MePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">我的</h1>
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
    </div>
  );
}
