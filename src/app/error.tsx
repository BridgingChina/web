'use client';
import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[App error]', error); }, [error]);

  return (
    <div className="container mx-auto py-12">
      <ErrorState
        title="服务暂时不可用"
        message={error.message || '请稍后重试，或返回首页继续浏览'}
        onRetry={reset}
      />
    </div>
  );
}
