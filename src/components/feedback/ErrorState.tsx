'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: Props) {
  const tFeedback = useTranslations('feedback');
  const tCommon = useTranslations('common');
  const resolvedTitle = title ?? tFeedback('error_title_default');
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-amber-300 bg-amber-50 p-10 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-700" />
      <p className="text-sm font-medium text-amber-900">{resolvedTitle}</p>
      {message && <p className="max-w-sm text-xs text-amber-800">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-4 w-4" />{tCommon('retry')}
        </Button>
      )}
    </div>
  );
}
