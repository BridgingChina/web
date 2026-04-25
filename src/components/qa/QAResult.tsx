'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useQAStore } from '@/stores/qaStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EvidenceCard } from './EvidenceCard';

export function QAResult() {
  const { status, outline, details, deepDive, sources, error, degraded } = useQAStore();
  const router = useRouter();
  const t = useTranslations('qa');
  const tErrors = useTranslations('errors');

  if (status === 'idle') return null;

  if (status === 'connecting') {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (error) {
    // After Phase 2 Path A, `error.code` is the translation key. Fall back to
    // `UNKNOWN` if the code isn't mapped. HTTP_ERROR receives the captured
    // status via the `status` field emitted by sse-client.
    let errorText: string;
    try {
      errorText = tErrors(error.code, { status: error.status ?? 0 });
    } catch {
      errorText = tErrors('UNKNOWN');
    }
    return (
      <div
        className="space-y-3 rounded-lg border p-3 font-sans text-sm"
        style={{
          borderColor: 'var(--yellow-hemp)',
          background: 'color-mix(in srgb, var(--yellow-hemp) 8%, var(--rice-paper))',
        }}
      >
        <p className="font-medium text-foreground">{errorText}</p>
        {error.fallback_actions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {error.fallback_actions.map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (a.type === 'bridge_detail' && a.id) router.push(`/bridges/${a.id}`);
                  else if (a.type === 'related_knowledge' && a.ids?.[0]) router.push(`/knowledge/${a.ids[0]}`);
                  else if (a.type === 'switch_context') router.push('/search');
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {degraded && (
        <div
          role="status"
          className="rounded-lg border p-3 font-sans text-sm text-foreground"
          style={{
            borderColor: 'var(--yellow-hemp)',
            background: 'color-mix(in srgb, var(--yellow-hemp) 8%, var(--rice-paper))',
          }}
        >
          {t('degraded_notice')}
        </div>
      )}

      {outline && outline.key_points.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t('outline_label')}
          </h3>
          <ol className="space-y-2">
            {outline.key_points.map((kp) => {
              const detail = details[kp.id];
              return (
                <li
                  key={kp.id}
                  className="rounded-lg border p-3"
                  style={{ background: 'var(--rice-paper)', borderColor: 'var(--stone-grey)' }}
                >
                  <div className="flex items-baseline gap-2">
                    {/* Order badge: mono label */}
                    <span
                      className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-medium"
                      style={{ background: 'var(--secondary)', color: 'var(--songci-celadon-deep)' }}
                    >
                      {String(kp.order).padStart(2, '0')}
                    </span>
                    <p className="font-sans text-sm font-medium text-foreground">{kp.summary}</p>
                  </div>
                  {detail && (
                    <p className="mt-2 max-w-[65ch] whitespace-pre-wrap font-sans text-sm leading-[1.6] text-foreground/80">
                      {detail.explanation}
                      {detail.citations?.length > 0 && (
                        <span className="ml-1 inline-flex flex-wrap gap-0.5">
                          {detail.citations
                            .map((c) => {
                              const idx = sources?.sources.findIndex((s) => s.id === c.source_id) ?? -1;
                              const label = idx >= 0 ? String(idx + 1).padStart(2, '0') : '??';
                              return (
                                <span
                                  key={c.source_id}
                                  className="inline-flex items-center rounded px-1 font-mono text-[11px]"
                                  style={{ background: 'var(--stone-grey)', color: 'var(--vermilion)' }}
                                >
                                  [{label}]
                                </span>
                              );
                            })}
                        </span>
                      )}
                    </p>
                  )}
                  {!detail && status === 'streaming' && <Skeleton className="mt-2 h-3 w-4/5" />}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {deepDive && (
        <section>
          <Tabs defaultValue="comparisons">
            <TabsList>
              {deepDive.comparisons?.length > 0 && <TabsTrigger value="comparisons">{t('tabs.comparisons')}</TabsTrigger>}
              {deepDive.controversies?.length > 0 && <TabsTrigger value="controversies">{t('tabs.controversies')}</TabsTrigger>}
              {deepDive.further_reading?.length > 0 && <TabsTrigger value="reading">{t('tabs.further_reading')}</TabsTrigger>}
            </TabsList>
            {deepDive.comparisons?.length > 0 && (
              <TabsContent value="comparisons" className="space-y-3 pt-2">
                {deepDive.comparisons.map((c, i) => (
                  <div key={i} className="font-sans text-sm">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 leading-[1.6] text-muted-foreground">{c.content}</p>
                  </div>
                ))}
              </TabsContent>
            )}
            {deepDive.controversies?.length > 0 && (
              <TabsContent value="controversies" className="space-y-3 pt-2">
                {deepDive.controversies.map((c, i) => (
                  <div key={i} className="font-sans text-sm">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 leading-[1.6] text-muted-foreground">{c.description}</p>
                  </div>
                ))}
              </TabsContent>
            )}
            {deepDive.further_reading?.length > 0 && (
              <TabsContent value="reading" className="space-y-1 pt-2">
                {deepDive.further_reading.map((r, i) => (
                  <p key={i} className="font-sans text-sm text-foreground">· {r.title}</p>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </section>
      )}

      {sources && sources.sources.length > 0 && (
        <section>
          <h3 className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t('sources_label')}
          </h3>
          <ol className="space-y-2">
            {sources.sources.map((s, i) => (
              <li key={s.chunk_id ?? s.id}>
                <EvidenceCard source={s} index={i + 1} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
