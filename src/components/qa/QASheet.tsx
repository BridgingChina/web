'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useQAStore } from '@/stores/qaStore';
import { QAResult } from './QAResult';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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

const EXAMPLES = [
  '赵州桥的敞肩拱有什么结构优势？',
  '宋代为什么偏爱石拱桥？',
  '虹桥的榫卯结构怎么传力？',
];

const STEPS = [
  { icon: ListChecks, label: '要点', hint: '核心结论先行' },
  { icon: FileText,   label: '详情', hint: '逐条展开说明' },
  { icon: Microscope, label: '深挖', hint: '对比 · 争议 · 延伸' },
  { icon: BookOpen,   label: '来源', hint: '可回溯的引用' },
];

export function QASheet() {
  const { isOpen, close, context, status,
    setQuestion, setStatus, setOutline, addDetail, setDeepDive, setSources, setError,
  } = useQAStore();
  const [text, setText] = useState('');
  const busy = status === 'connecting' || status === 'streaming';

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
      setError({ code: 'NETWORK', message: '网络异常，请稍后重试', fallback_actions: [] });
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
              <SheetTitle className="text-base leading-tight">AI 问答</SheetTitle>
              {context.label ? (
                <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="shrink-0 text-muted-foreground">已聚焦</span>
                  <span className="truncate font-medium text-foreground">{context.label}</span>
                </SheetDescription>
              ) : (
                <SheetDescription className="mt-1 text-xs">
                  提问后，回答会按要点 → 详情 → 深挖 → 来源的顺序展开
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
              placeholder="输入你的问题，Enter 发送 · Shift+Enter 换行"
              disabled={busy}
              rows={2}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground outline-none disabled:opacity-60"
            />
            <Button
              size="icon"
              onClick={() => submit()}
              disabled={!text.trim() || busy}
              aria-label={busy ? '回答中' : '提问'}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>

          {status === 'idle' && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 pr-1 text-xs text-muted-foreground">
                <Sparkles className="size-3" /> 试试
              </span>
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => submit(e)}
                  className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-ring/40 hover:bg-muted hover:text-foreground"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {busy && (
            <p className="mt-3 text-xs text-muted-foreground">
              正在从文献中检索并整理答案<span className="ml-0.5 inline-block animate-pulse">…</span>
            </p>
          )}
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-6 pb-6">
          {status === 'idle' ? (
            <div>
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                回答结构
              </p>
              <ol className="grid grid-cols-2 gap-2">
                {STEPS.map((s, i) => (
                  <li
                    key={s.label}
                    className="flex items-start gap-2.5 rounded-xl border bg-card/60 p-3"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <s.icon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-1 font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                        {s.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{s.hint}</p>
                    </div>
                  </li>
                ))}
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
