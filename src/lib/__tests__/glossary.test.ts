import { describe, it, expect, beforeEach } from 'vitest';
import { loadGlossary, _clearGlossaryCache } from '../glossary';

describe('glossary loader', () => {
  beforeEach(() => {
    _clearGlossaryCache();
  });

  it('loads all terms when context not specified', () => {
    const terms = loadGlossary();
    expect(terms.length).toBeGreaterThanOrEqual(50);
    expect(terms.some((t) => t.zh === '桥梁' && t.en === 'bridge')).toBe(true);
  });

  it('filters by context', () => {
    const structural = loadGlossary('structural');
    expect(structural.every((t) => t.context === 'structural')).toBe(true);
    expect(structural.some((t) => t.zh === '拱')).toBe(true);
  });

  it('returns empty array for unknown context', () => {
    // @ts-expect-error - 测试运行时 fallback，故意传一个不在 union 里的值
    const unknown = loadGlossary('nonexistent_ctx');
    expect(unknown).toEqual([]);
  });

  it('caches after first load (subsequent calls return same reference)', () => {
    const a = loadGlossary();
    const b = loadGlossary();
    expect(a).toBe(b);
  });

  it('terms are frozen (readonly)', () => {
    const [first] = loadGlossary();
    expect(Object.isFrozen(first)).toBe(true);
  });
});
