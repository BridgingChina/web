'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useQAStore } from '@/stores/qaStore';
import { QAResult } from './QAResult';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { askQuestion } from '@/lib/sse-client';
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  Sparkles,
  ListChecks,
  FileText,
  Microscope,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  QAOutlineEvent, QADetailEvent, QADeepDiveEvent, QASourcesEvent, QAErrorEvent,
} from '@/api/types';

const STEP_ICONS = {
  outline: ListChecks,
  detail: FileText,
  deep_dive: Microscope,
  sources: BookOpen,
} as const;

const STEP_KEYS = ['outline', 'detail', 'deep_dive', 'sources'] as const;
const EXAMPLE_KEYS = ['ex1', 'ex2', 'ex3'] as const;

export function QASheet() {
  const { isOpen, close, context, status,
    setQuestion, setStatus, setOutline, addDetail, setDeepDive, setSources, setError,
  } = useQAStore();
  const [text, setText] = useState('');
  const busy = status === 'connecting' || status === 'streaming';
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  async function submit(override?: string) {
    const q = (override ?? text).trim();
    if (!q || busy) return;
    if (override) setText(override);
    setQuestion(q);
    setStatus('connecting');
    try {
      for await (const ev of askQuestion({
        question: q,
        context: context.type ? { type: context.type, id: context.id, filters: context.filters } : undefined,
      })) {
        switch (ev.event) {
          case 'started': break;
          case 'outline':   setOutline(ev.data as QAOutlineEvent); break;
          case 'detail':    addDetail(ev.data as QADetailEvent); break;
          case 'deep_dive': setDeepDive(ev.data as QADeepDiveEvent); break;
          case 'sources':   setSources(ev.data as QASourcesEvent); break;
          case 'done':      setStatus('done'); break;
          case 'error':     setError(ev.data as QAErrorEvent); break;
          case 'ping': break;
        }
      }
      const finalStatus = useQAStore.getState().status;
      if (finalStatus === 'connecting' || finalStatus === 'streaming') setStatus('done');
    } catch {
      setError({ code: 'NETWORK', message: t('network_error'), fallback_actions: [] });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircleQuestion className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base leading-tight">{t('title')}</SheetTitle>
              {context.label ? (
                <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="shrink-0 text-muted-foreground">{t('focused')}</span>
                  <span className="truncate font-medium text-foreground">{context.label}</span>
                </SheetDescription>
              ) : (
                <SheetDescription className="mt-1 text-xs">
                  {t('intro')}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 pt-5">
          <div
            className={cn(
              'flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition',
              'focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20',
              busy && 'opacity-90',
            )}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder={t('input_placeholder')}
              disabled={busy}
              rows={2}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground outline-none disabled:opacity-60"
            />
            <Button
              size="icon"
              onClick={() => submit()}
              disabled={!text.trim() || busy}
              aria-label={busy ? t('answering') : tCommon('ask')}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>

          {status === 'idle' && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 pr-1 text-xs text-muted-foreground">
                <Sparkles className="size-3" /> {t('try')}
              </span>
              {EXAMPLE_KEYS.map((k) => {
                const example = t(`examples.${k}`);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => submit(example)}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-ring/40 hover:bg-muted hover:text-foreground"
                  >
                    {example}
                  </button>
                );
              })}
            </div>
          )}

          {busy && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t('searching')}<span className="ml-0.5 inline-block animate-pulse">…</span>
            </p>
          )}
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-6 pb-6">
          {status === 'idle' ? (
            <div>
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t('response_structure')}
              </p>
              <ol className="grid grid-cols-2 gap-2">
                {STEP_KEYS.map((k, i) => {
                  const Icon = STEP_ICONS[k];
                  return (
                    <li
                      key={k}
                      className="flex items-start gap-2.5 rounded-xl border bg-card/60 p-3"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          <span className="mr-1 font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                          {t(`steps.${k}.label`)}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{t(`steps.${k}.hint`)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <QAResult />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
