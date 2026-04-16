import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto py-12">
      <EmptyState
        title="页面不存在"
        description="你访问的链接可能已被移除或拼写错误。"
        icon={<Compass className="h-10 w-10" />}
        action={<Link href="/"><Button size="sm">回到首页</Button></Link>}
      />
    </div>
  );
}
