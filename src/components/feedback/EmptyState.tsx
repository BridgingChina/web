'use client';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Inbox } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  const t = useTranslations('feedback');
  const resolvedTitle = title ?? t('empty_title_default');
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/20 p-10 text-center">
      <div className="text-muted-foreground">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <p className="text-sm font-medium">{resolvedTitle}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
