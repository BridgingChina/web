'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRecognition } from '@/api/hooks/useRecognition';
import { UploadZone } from '@/components/recognize/UploadZone';
import { CandidateList } from '@/components/recognize/CandidateList';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslateError } from '@/lib/error-message';

export default function RecognizePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recognize = useRecognition();
  const t = useTranslations('recognize');
  const translateError = useTranslateError();

  function onSelect(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    recognize.mutate({ image: file });
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    recognize.reset();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('intro')}</p>
      </header>

      {!previewUrl && <UploadZone onSelect={onSelect} disabled={recognize.isPending} />}

      {previewUrl && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[200px_1fr]">
            <figure className="overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={t('preview_alt')} className="h-full w-full object-cover" />
            </figure>
            <div className="space-y-3">
              {recognize.isPending && (
                <>
                  <p className="text-sm">{t('recognizing')}</p>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </>
              )}
              {recognize.isError && (
                <p className="text-sm text-destructive">
                  {t('recognize_failed', { message: translateError(recognize.error) })}
                </p>
              )}
              {recognize.data && <CandidateList result={recognize.data.data} onReset={reset} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
