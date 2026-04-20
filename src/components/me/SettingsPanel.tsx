'use client';
import { useDeviceStore } from '@/stores/deviceStore';
import { useConfig } from '@/api/hooks/useConfig';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

const CONSOLE_URL = 'https://console.bridgingchina.net';

export function SettingsPanel() {
  const language = useDeviceStore((s) => s.language);
  const setLanguage = useDeviceStore((s) => s.setLanguage);
  const { data: cfg } = useConfig();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    window.location.href = '/';
  }

  return (
    <div className="space-y-6">
      {session && (
        <section>
          <h3 className="mb-2 text-sm font-medium">账户</h3>
          <div className="space-y-1 rounded border bg-muted/40 px-3 py-2 text-sm">
            <p>
              <span className="text-muted-foreground">邮箱：</span>
              <span className="font-mono">{session.user.email}</span>
              {!session.user.emailVerified && (
                <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                  未验证
                </span>
              )}
            </p>
            {session.user.name && (
              <p>
                <span className="text-muted-foreground">名称：</span>
                {session.user.name}
              </p>
            )}
          </div>
        </section>
      )}

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

      {session && (session.user as { role?: string }).role === 'admin' && (
        <section>
          <h3 className="mb-2 text-sm font-medium">管理员</h3>
          <a
            className="text-sm text-primary underline-offset-4 hover:underline"
            href={CONSOLE_URL}
            target="_blank"
            rel="noreferrer"
          >
            前往管理后台 →
          </a>
        </section>
      )}

      {session && (
        <section className="border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleSignOut}>退出登录</Button>
        </section>
      )}
    </div>
  );
}
