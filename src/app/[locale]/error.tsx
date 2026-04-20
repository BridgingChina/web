'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[App error]', error); }, [error]);
  const t = useTranslations('errors');

  return (
    <div className="container mx-auto py-12">
      <ErrorState
        title={t('app_title')}
        message={error.message || t('app_message_fallback')}
        onRetry={reset}
      />
    </div>
  );
}
