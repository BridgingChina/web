'use client';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const CONSOLE_URL = 'https://console.bridgingchina.net';

export function SettingsPanel() {
  const { data: session } = useSession();
  const t = useTranslations('me.settings');
  const tCommon = useTranslations('common');

  async function handleSignOut() {
    await signOut();
    window.location.href = '/';
  }

  return (
    <div className="space-y-6">
      {session && (
        <section>
          <h3 className="mb-2 text-sm font-medium">{t('account')}</h3>
          <div className="space-y-1 rounded border bg-muted/40 px-3 py-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t('email_label')}</span>
              <span className="font-mono">{session.user.email}</span>
              {!session.user.emailVerified && (
                <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                  {t('email_unverified')}
                </span>
              )}
            </p>
            {session.user.name && (
              <p>
                <span className="text-muted-foreground">{t('name_label')}</span>
                {session.user.name}
              </p>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-medium">{t('language')}</h3>
        <LanguageSwitcher />
      </section>

      {session && (session.user as { role?: string }).role === 'admin' && (
        <section>
          <h3 className="mb-2 text-sm font-medium">{t('admin')}</h3>
          <a
            className="text-sm text-primary underline-offset-4 hover:underline"
            href={CONSOLE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t('go_to_console')}
          </a>
        </section>
      )}

      {session && (
        <section className="border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleSignOut}>{tCommon('sign_out')}</Button>
        </section>
      )}
    </div>
  );
}
