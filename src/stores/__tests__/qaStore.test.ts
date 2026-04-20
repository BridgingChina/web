import { describe, it, expect, beforeEach } from 'vitest';
import { useQAStore } from '../qaStore';

describe('qaStore · Phase 4 i18n slices', () => {
  beforeEach(() => {
    useQAStore.getState().reset();
  });

  it('starts with locale null, degraded false, and empty showOriginal', () => {
    const state = useQAStore.getState();
    expect(state.locale).toBeNull();
    expect(state.degraded).toBe(false);
    expect(state.degradedReason).toBeNull();
    expect(state.showOriginal).toEqual({});
    expect(state.questionZh).toBeNull();
  });

  it('setStarted captures the locale and optional Chinese translation', () => {
    useQAStore.getState().setStarted({ locale: 'en-US', question_zh: '赵州桥的拱?' });
    const state = useQAStore.getState();
    expect(state.locale).toBe('en-US');
    expect(state.questionZh).toBe('赵州桥的拱?');
  });

  it('setDone transitions status to done and applies degraded+reason', () => {
    useQAStore.getState().setStarted({ locale: 'en-US' });
    useQAStore.getState().setDone({ qa_id: 'q1', degraded: true, reason: 'translate_answer_failed' });
    const state = useQAStore.getState();
    expect(state.status).toBe('done');
    expect(state.degraded).toBe(true);
    expect(state.degradedReason).toBe('translate_answer_failed');
    // locale from `started` is preserved when done omits it
    expect(state.locale).toBe('en-US');
  });

  it('setDone preserves started locale when done omits one', () => {
    useQAStore.getState().setStarted({ locale: 'en-US' });
    useQAStore.getState().setDone({});
    expect(useQAStore.getState().locale).toBe('en-US');
  });

  it('setDone with locale override replaces the started locale', () => {
    useQAStore.getState().setStarted({ locale: 'en-US' });
    useQAStore.getState().setDone({ locale: 'zh-CN', degraded: true });
    expect(useQAStore.getState().locale).toBe('zh-CN');
  });

  it('toggleShowOriginal flips a per-chunk boolean independently', () => {
    const { toggleShowOriginal } = useQAStore.getState();
    toggleShowOriginal('chunk-a');
    expect(useQAStore.getState().showOriginal).toEqual({ 'chunk-a': true });

    toggleShowOriginal('chunk-b');
    expect(useQAStore.getState().showOriginal).toEqual({ 'chunk-a': true, 'chunk-b': true });

    toggleShowOriginal('chunk-a');
    expect(useQAStore.getState().showOriginal).toEqual({ 'chunk-a': false, 'chunk-b': true });
  });

  it('reset clears Phase 4 slices', () => {
    useQAStore.getState().setStarted({ locale: 'en-US', question_zh: '测试' });
    useQAStore.getState().setDone({ degraded: true, reason: 'x' });
    useQAStore.getState().toggleShowOriginal('c1');

    useQAStore.getState().reset();
    const state = useQAStore.getState();
    expect(state.locale).toBeNull();
    expect(state.questionZh).toBeNull();
    expect(state.degraded).toBe(false);
    expect(state.degradedReason).toBeNull();
    expect(state.showOriginal).toEqual({});
  });
});
