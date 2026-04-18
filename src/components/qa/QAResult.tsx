'use client';
import { useQAStore } from '@/stores/qaStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function QAResult() {
  const { status, outline, details, deepDive, sources, error } = useQAStore();
  const router = useRouter();

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
    return (
      <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
        <p className="font-medium text-amber-900">{error.message}</p>
        {error.fallback_actions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {error.fallback_actions.map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
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
      {outline && outline.key_points.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">要点</h3>
          <ol className="space-y-3">
            {outline.key_points.map((kp) => {
              const detail = details[kp.id];
              return (
                <li key={kp.id} className="rounded-md border bg-card p-3">
                  <div className="flex items-baseline gap-2">
                    <Badge variant="secondary">{kp.order}</Badge>
                    <p className="font-medium">{kp.summary}</p>
                  </div>
                  {detail && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {detail.explanation}
                      {detail.citations?.length > 0 && (
                        <span className="ml-1 text-xs text-blue-600">
                          {detail.citations
                            .map((c) => {
                              const idx = sources?.sources.findIndex((s) => s.id === c.source_id) ?? -1;
                              return `[${idx >= 0 ? idx + 1 : '?'}]`;
                            })
                            .join(' ')}
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
              {deepDive.comparisons?.length > 0 && <TabsTrigger value="comparisons">对比</TabsTrigger>}
              {deepDive.controversies?.length > 0 && <TabsTrigger value="controversies">争议</TabsTrigger>}
              {deepDive.further_reading?.length > 0 && <TabsTrigger value="reading">延伸阅读</TabsTrigger>}
            </TabsList>
            {deepDive.comparisons?.length > 0 && (
              <TabsContent value="comparisons" className="space-y-2 pt-2">
                {deepDive.comparisons.map((c, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-muted-foreground">{c.content}</p>
                  </div>
                ))}
              </TabsContent>
            )}
            {deepDive.controversies?.length > 0 && (
              <TabsContent value="controversies" className="space-y-2 pt-2">
                {deepDive.controversies.map((c, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-muted-foreground">{c.description}</p>
                  </div>
                ))}
              </TabsContent>
            )}
            {deepDive.further_reading?.length > 0 && (
              <TabsContent value="reading" className="space-y-1 pt-2">
                {deepDive.further_reading.map((r, i) => (
                  <p key={i} className="text-sm">· {r.title}</p>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </section>
      )}

      {sources && sources.sources.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">来源</h3>
          <ol className="space-y-2 text-xs text-muted-foreground">
            {sources.sources.map((s, i) => (
              <li key={s.id}>
                <span className="text-blue-600">[{i + 1}]</span> {s.title}
                {s.author ? ` · ${s.author}` : ''} {s.location ? ` · ${s.location}` : ''}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
