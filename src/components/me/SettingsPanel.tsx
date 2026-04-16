'use client';
import { useDeviceStore } from '@/stores/deviceStore';
import { useConfig } from '@/api/hooks/useConfig';
import { Button } from '@/components/ui/button';

export function SettingsPanel() {
  const language = useDeviceStore((s) => s.language);
  const setLanguage = useDeviceStore((s) => s.setLanguage);
  const deviceId = useDeviceStore((s) => s.deviceId);
  const { data: cfg } = useConfig();

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-medium">语言</h3>
        <div className="flex gap-2">
          <Button size="sm" variant={language === 'zh-CN' ? 'default' : 'outline'} onClick={() => setLanguage('zh-CN')}>中文</Button>
          <Button size="sm" variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')}>English</Button>
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-medium">地图来源</h3>
        <p className="text-sm text-muted-foreground">
          {cfg?.map?.provider ?? '未配置'}{cfg?.map?.approval_number ? ` · 审图号 ${cfg.map.approval_number}` : ''}
        </p>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-medium">设备 ID</h3>
        <p className="break-all rounded border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
          {deviceId || '未生成'}
        </p>
      </section>
    </div>
  );
}
