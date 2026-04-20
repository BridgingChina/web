import { readFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Glossary 供服务端组件 / Server Action / API route 使用（LLM prompt 术语注入）。
// 不要在 client component 里直接 import（会把 js-yaml + yaml 文本打进 bundle）。
//
// 源：顶层 docs/glossary.zh-en.yaml，由 scripts/sync-glossary.sh 同步到 src/i18n/glossary.yaml。

export type GlossaryContext =
  | 'ui_action'
  | 'structural'
  | 'bridge_type'
  | 'material'
  | 'era'
  | 'taxonomy_lvl1'
  | 'ui_state'
  | 'general'
  | 'traditional_construction';

export interface Term {
  readonly zh: string;
  readonly en: string;
  readonly context: GlossaryContext;
  readonly notes?: string;
}

interface GlossaryFile {
  version: number;
  generated_at?: string;
  updated_at?: string;
  terms: Term[];
}

const GLOSSARY_PATH = path.resolve(process.cwd(), 'src/i18n/glossary.yaml');

let _cache: readonly Term[] | null = null;

function loadRaw(): readonly Term[] {
  if (_cache) return _cache;
  const raw = readFileSync(GLOSSARY_PATH, 'utf-8');
  const parsed = yaml.load(raw) as GlossaryFile;
  _cache = Object.freeze(parsed.terms.map((t) => Object.freeze({ ...t })));
  return _cache;
}

export function loadGlossary(context?: GlossaryContext): readonly Term[] {
  const terms = loadRaw();
  if (!context) return terms;
  return terms.filter((t) => t.context === context);
}

/**
 * 测试用：清缓存后重新读文件。生产代码不应调用。
 */
export function _clearGlossaryCache(): void {
  _cache = null;
}
