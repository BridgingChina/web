import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Compass } from 'lucide-react';

export default async function NotFound() {
  const t = await getTranslations('errors');
  return (
    <div className="container mx-auto py-12">
      <EmptyState
        title={t('not_found_title')}
        description={t('not_found_description')}
        icon={<Compass className="h-10 w-10" />}
        action={<Link href="/"><Button size="sm">{t('back_home')}</Button></Link>}
      />
    </div>
  );
}
