'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = '加载失败', message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-amber-300 bg-amber-50 p-10 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-700" />
      <p className="text-sm font-medium text-amber-900">{title}</p>
      {message && <p className="max-w-sm text-xs text-amber-800">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-4 w-4" />重试
        </Button>
      )}
    </div>
  );
}
