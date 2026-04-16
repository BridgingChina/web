import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title = '暂无内容', description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/20 p-10 text-center">
      <div className="text-muted-foreground">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
