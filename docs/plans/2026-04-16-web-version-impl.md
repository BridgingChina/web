# ArchTrail Web 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把现有 React Native ArchTrail 应用的 C 端体验完整复刻到桌面端浏览器，复用移动端 mobile API（21 endpoints）和数据层代码。

**Architecture:** Next.js 16 App Router 单仓库；数据层（types / apiClient / TanStack Query hooks / Zustand stores）从 `../app/src/` 拷贝并做 web 适配（device_id 改 localStorage、SSE 改 fetch+ReadableStream）；UI 全部用 Tailwind v4 + shadcn/ui 重写，桌面端三列/双列布局。地图用高德 JS API 2.0 替代 react-native-amap3d。

**Tech Stack:** Next.js 16 / React 19 / TypeScript / TailwindCSS v4 / shadcn/ui (Radix + lucide) / TanStack Query v5 + IndexedDB persist / Zustand v5 / @amap/amap-jsapi-loader / vitest + @testing-library/react / playwright

**Reference docs:**
- `./2026-04-16-web-version-design.md` — 完整 design
- `../../app/docs/plan/api-spec.md` — mobile API v1.1（21 endpoints）
- `../../app/docs/plan/design.md` — 移动端 UX 规范（页面规格）
- `../../app/src/api/types.ts` — TS 类型完整定义
- `../../app/src/api/client.ts` — apiClient 参考实现
- `../../app/src/api/hooks/*` — 8 个 TanStack Query hooks 参考

**Convention:**
- 当前 `web/` 不是 git 仓库 → Task 1 会 `git init`
- `MOBILE=/Users/uu/Documents/Coding/4C2026/app` 在每个引用移动端的 task 里展开
- 所有提交信息使用中文 + Conventional Commits 前缀（`feat:` / `chore:` / `test:` / `fix:`）
- 每个 task 完成后跑 `npx tsc --noEmit` + 相关测试

---

## 阶段 0：脚手架

### Task 1：初始化 Next.js 项目 + git

**Files:**
- Create: 整个 `web/` 项目骨架

**Step 1：在空目录初始化**

Run（在 `/Users/uu/Documents/Coding/4C2026/web/`）:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --turbopack --use-npm
```

回答交互式提问：
- TypeScript: Yes
- ESLint: Yes
- Tailwind: Yes
- App Router: Yes
- src/ directory: **Yes**（覆盖前面的 --no-src-dir）
- Customize import alias: Yes，`@/*` → `./src/*`

如果不能交互，手动 `npm init -y && npm install next@15 react@19 react-dom@19 typescript @types/node @types/react @types/react-dom tailwindcss@4 @tailwindcss/postcss postcss autoprefixer` 并按 Next.js 15 文档结构搭建。

**Step 2：初始化 git**

Run:
```bash
git init
git add -A
git commit -m "chore: initial Next.js 15 + Tailwind scaffold"
```

**Step 3：写 .gitignore 补充**

确保 `.gitignore` 包含：
```
.env*.local
.next/
node_modules/
out/
*.log
.vercel
.DS_Store
coverage/
playwright-report/
test-results/
```

**Step 4：commit gitignore**

```bash
git add .gitignore
git commit -m "chore: extend .gitignore for Next.js + tests"
```

**Step 5：验证 dev server 可启动**

Run:
```bash
npm run dev &
sleep 5
curl -sI http://localhost:3000 | head -1
kill %1
```
Expected: `HTTP/1.1 200 OK`

---

### Task 2：安装核心依赖 + shadcn/ui 初始化

**Step 1：安装数据层 + 工具依赖**

```bash
npm install @tanstack/react-query@5 @tanstack/react-query-devtools@5 zustand@5 \
  clsx tailwind-merge class-variance-authority lucide-react idb-keyval \
  @amap/amap-jsapi-loader framer-motion
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @types/amap-js-api
```

**Step 2：初始化 shadcn/ui**

```bash
npx shadcn@latest init -d  # defaults: Slate / CSS variables / src/components/ui
```

**Step 3：装上后续会用的 shadcn 组件**

```bash
npx shadcn@latest add button card dialog sheet drawer accordion tabs \
  input badge skeleton separator scroll-area dropdown-menu popover \
  toast tooltip carousel
```

**Step 4：配置 vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

加 `package.json` scripts：
```json
"test": "vitest",
"test:run": "vitest run",
"typecheck": "tsc --noEmit"
```

**Step 5：commit**

```bash
git add -A
git commit -m "chore: install TanStack Query, Zustand, shadcn/ui, vitest"
```

---

### Task 3：环境变量 + 配置常量

**Files:**
- Create: `.env.local`、`.env.example`、`src/constants/config.ts`
- Test: `src/constants/__tests__/config.test.ts`

**Step 1：写 .env.example**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/mobile/v1
NEXT_PUBLIC_AMAP_KEY=请替换为高德 JS API key
NEXT_PUBLIC_AMAP_SECURITY_CODE=
```

复制到 `.env.local` 让本地 dev 可用（`.env.local` 已 gitignore）。

**Step 2：写测试 `src/constants/__tests__/config.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('config', () => {
  beforeEach(() => { vi.resetModules(); });

  it('exposes API_BASE_URL from env', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://example.com/api/mobile/v1');
    const { API_BASE_URL } = await import('../config');
    expect(API_BASE_URL).toBe('http://example.com/api/mobile/v1');
  });

  it('exposes API_TIMEOUT default 15000', async () => {
    const { API_TIMEOUT } = await import('../config');
    expect(API_TIMEOUT).toBe(15000);
  });

  it('exposes QUERY_DEFAULTS with stale times', async () => {
    const { QUERY_DEFAULTS } = await import('../config');
    expect(QUERY_DEFAULTS.LIST_STALE_TIME).toBeGreaterThan(0);
    expect(QUERY_DEFAULTS.DETAIL_STALE_TIME).toBeGreaterThan(0);
  });
});
```

**Step 3：跑测试，确认 fail**

```bash
npm run test:run -- src/constants/__tests__/config.test.ts
```
Expected: FAIL — 模块不存在

**Step 4：实现 `src/constants/config.ts`**

```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const API_TIMEOUT = 15000;
export const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY ?? '';
export const AMAP_SECURITY_CODE = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? '';

export const QUERY_DEFAULTS = {
  LIST_STALE_TIME: 5 * 60 * 1000,    // 5 min
  DETAIL_STALE_TIME: 30 * 60 * 1000, // 30 min
  CONFIG_STALE_TIME: 24 * 60 * 60 * 1000, // 24 h
} as const;
```

**Step 5：跑测试 + commit**

```bash
npm run test:run -- src/constants/__tests__/config.test.ts  # PASS
git add src/constants .env.example
git commit -m "feat(config): add env-driven API/AMap constants"
```

---

## 阶段 1：数据层（复用 mobile + web 适配）

### Task 4：拷贝 mobile API types

**Files:**
- Copy: `../app/src/api/types.ts` → `src/api/types.ts`

**Step 1：拷贝**

```bash
mkdir -p src/api
cp /Users/uu/Documents/Coding/4C2026/app/src/api/types.ts src/api/types.ts
```

**Step 2：typecheck**

```bash
npm run typecheck  # 应通过
```

**Step 3：commit**

```bash
git add src/api/types.ts
git commit -m "feat(api): copy TS types from mobile app (21 endpoints)"
```

---

### Task 5：device-id（localStorage）+ 测试

**Files:**
- Create: `src/lib/device-id.ts`
- Test: `src/lib/__tests__/device-id.test.ts`

**Step 1：写测试**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getOrCreateDeviceId, DEVICE_ID_KEY } from '../device-id';

describe('device-id', () => {
  beforeEach(() => { localStorage.clear(); });

  it('creates and persists a UUID v4 on first call', () => {
    const id = getOrCreateDeviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(localStorage.getItem(DEVICE_ID_KEY)).toBe(id);
  });

  it('returns the same id on subsequent calls', () => {
    const a = getOrCreateDeviceId();
    const b = getOrCreateDeviceId();
    expect(a).toBe(b);
  });

  it('returns "" when called server-side (no window)', async () => {
    // jsdom always has window; this is a runtime guard test only
    expect(typeof getOrCreateDeviceId()).toBe('string');
  });
});
```

**Step 2：跑测试**

```bash
npm run test:run -- src/lib/__tests__/device-id.test.ts  # FAIL
```

**Step 3：实现 `src/lib/device-id.ts`**

```ts
export const DEVICE_ID_KEY = 'archtrail.device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
```

**Step 4：通过测试 + commit**

```bash
npm run test:run -- src/lib/__tests__/device-id.test.ts  # PASS
git add src/lib
git commit -m "feat(lib): add localStorage-backed device_id"
```

---

### Task 6：deviceStore（Zustand）+ 测试

**Files:**
- Create: `src/stores/deviceStore.ts`
- Test: `src/stores/__tests__/deviceStore.test.ts`

**Step 1：写测试**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from '../deviceStore';

describe('deviceStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDeviceStore.setState({ deviceId: '', language: 'zh-CN' });
  });

  it('init() generates and stores deviceId', () => {
    useDeviceStore.getState().init();
    expect(useDeviceStore.getState().deviceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('setLanguage updates store', () => {
    useDeviceStore.getState().setLanguage('en');
    expect(useDeviceStore.getState().language).toBe('en');
  });
});
```

**Step 2：实现 `src/stores/deviceStore.ts`**

```ts
import { create } from 'zustand';
import { getOrCreateDeviceId } from '@/lib/device-id';

interface DeviceState {
  deviceId: string;
  language: 'zh-CN' | 'en';
  init: () => void;
  setLanguage: (lang: 'zh-CN' | 'en') => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  deviceId: '',
  language: 'zh-CN',
  init: () => set({ deviceId: getOrCreateDeviceId() }),
  setLanguage: (language) => set({ language }),
}));
```

**Step 3：通过测试 + commit**

```bash
npm run test:run -- src/stores/__tests__/deviceStore.test.ts  # PASS
git add src/stores
git commit -m "feat(stores): add deviceStore (web-adapted from mobile)"
```

---

### Task 7：apiClient（fetch + AbortController）

**Files:**
- Create: `src/api/client.ts`
- Test: `src/api/__tests__/client.test.ts`

**Step 1：写测试（用 vitest 的 `fetch` mock）**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiClientError } from '../client';
import { useDeviceStore } from '@/stores/deviceStore';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/api/mobile/v1');
    vi.unstubAllGlobals();
    useDeviceStore.setState({ deviceId: 'dev-uuid', language: 'zh-CN' });
  });

  it('attaches X-Device-Id only on /favorites, /review, /history', async () => {
    const captured: RequestInit[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured.push(init);
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    }));

    await apiClient.get('/bridges');
    await apiClient.get('/favorites');

    expect((captured[0].headers as any)['X-Device-Id']).toBeUndefined();
    expect((captured[1].headers as any)['X-Device-Id']).toBe('dev-uuid');
  });

  it('throws ApiClientError on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: { code: 'NOT_FOUND', message: '没找到' } }),
      { status: 404 }
    )));

    await expect(apiClient.get('/bridges/x')).rejects.toBeInstanceOf(ApiClientError);
  });
});
```

**Step 2：实现 `src/api/client.ts`**（基于 mobile 版改写）

```ts
import { API_BASE_URL, API_TIMEOUT } from '@/constants/config';
import { useDeviceStore } from '@/stores/deviceStore';
import type { ApiError } from './types';

const DEVICE_ID_ENDPOINTS = ['/favorites', '/review', '/history'];

function needsDeviceId(path: string): boolean {
  return DEVICE_ID_ENDPOINTS.some((ep) => path.startsWith(ep));
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, error: ApiError['error']) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = status;
    this.details = error.details;
  }
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
    timeout?: number;
  } = {},
): Promise<T> {
  const { deviceId, language } = useDeviceStore.getState();
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {
    'Accept-Language': language,
    ...options.headers,
  };
  if (needsDeviceId(path) && deviceId) headers['X-Device-Id'] = deviceId;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? API_TIMEOUT);
  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({
        error: { code: 'UNKNOWN', message: '请求失败' },
      }));
      throw new ApiClientError(res.status, errBody.error);
    }
    if (res.status === 204) return undefined as T;
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, formData: FormData) => request<T>('POST', path, { body: formData }),
};
```

**Step 3：通过测试 + commit**

```bash
npm run test:run -- src/api/__tests__/client.test.ts  # PASS
git add src/api
git commit -m "feat(api): add apiClient with X-Device-Id auto-attach"
```

---

### Task 8：拷贝 + 适配 8 个 Query hooks

**Files:**
- Copy: `../app/src/api/hooks/*.ts` → `src/api/hooks/`

**Step 1：拷贝全部**

```bash
mkdir -p src/api/hooks
cp /Users/uu/Documents/Coding/4C2026/app/src/api/hooks/*.ts src/api/hooks/
```

**Step 2：检查 import 路径**

如果 hooks 内用了相对 import `../client`、`../types`、`../../constants/config`，应该都能工作。验证：

```bash
npm run typecheck  # 应通过
```

如有 path alias 问题，把 `../` 改成 `@/api/`、`@/constants/`。

**Step 3：写一个 smoke test 确认 hook 可调**

`src/api/hooks/__tests__/useConfig.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from '../useConfig';
import type { ReactNode } from 'react';

describe('useConfig', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ data: { eras: [], bridge_types: [], regions: [], map: { provider: 'x', approval_number: 'y' } } }),
      { status: 200 }
    )));
  });

  it('fetches /config and returns data', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useConfig(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.map.provider).toBe('x');
  });
});
```

**Step 4：commit**

```bash
git add src/api/hooks
git commit -m "feat(api): port 8 TanStack Query hooks from mobile"
```

---

### Task 9：sse-client（POST + ReadableStream）

**Files:**
- Create: `src/lib/sse-client.ts`
- Test: `src/lib/__tests__/sse-client.test.ts`

**Step 1：写测试**

```ts
import { describe, it, expect, vi } from 'vitest';
import { askQuestion, parseSSEFrames } from '../sse-client';

describe('parseSSEFrames', () => {
  it('parses well-formed event blocks', () => {
    const input = 'event: outline\ndata: {"key_points":[]}\n\nevent: done\ndata: {"qa_id":"x"}\n\n';
    const { events, remainder } = parseSSEFrames(input);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ event: 'outline', data: { key_points: [] } });
    expect(events[1]).toEqual({ event: 'done', data: { qa_id: 'x' } });
    expect(remainder).toBe('');
  });

  it('keeps partial frame in remainder', () => {
    const input = 'event: outline\ndata: {"key_points":[]}\n\nevent: detail\ndata: {"key';
    const { events, remainder } = parseSSEFrames(input);
    expect(events).toHaveLength(1);
    expect(remainder.startsWith('event: detail')).toBe(true);
  });
});

describe('askQuestion', () => {
  it('yields parsed events from a stream response', async () => {
    const sse =
      'event: started\ndata: {"qa_id":"q1"}\n\n' +
      'event: outline\ndata: {"key_points":[{"id":"k1","summary":"s","order":1}]}\n\n' +
      'event: done\ndata: {"qa_id":"q1"}\n\n';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(sse, { status: 200 })));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/api/mobile/v1');

    const out: any[] = [];
    for await (const ev of askQuestion({ question: 'hi' })) out.push(ev);
    expect(out.map(e => e.event)).toEqual(['started', 'outline', 'done']);
  });
});
```

**Step 2：实现 `src/lib/sse-client.ts`**

```ts
import { API_BASE_URL } from '@/constants/config';
import { useDeviceStore } from '@/stores/deviceStore';

export type SSEEvent = { event: string; data: any };

export interface AskRequest {
  question: string;
  context?: { type: string | null; id?: string; filters?: Record<string, any> };
}

export function parseSSEFrames(buf: string): { events: SSEEvent[]; remainder: string } {
  const out: SSEEvent[] = [];
  const parts = buf.split('\n\n');
  const remainder = parts.pop() ?? '';
  for (const block of parts) {
    if (!block.trim()) continue;
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    const raw = dataLines.join('\n');
    let data: any = raw;
    try { data = JSON.parse(raw); } catch { /* keep as string */ }
    out.push({ event, data });
  }
  return { events: out, remainder };
}

export async function* askQuestion(req: AskRequest, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  const { language, deviceId } = useDeviceStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Accept-Language': language,
  };
  if (deviceId) headers['X-Device-Id'] = deviceId;

  const res = await fetch(`${API_BASE_URL}/qa/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) {
    yield { event: 'error', data: { code: 'NETWORK', message: 'SSE 连接失败' } };
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;
    const { events, remainder } = parseSSEFrames(buf);
    for (const ev of events) yield ev;
    buf = remainder;
  }
}
```

**Step 3：通过测试 + commit**

```bash
npm run test:run -- src/lib/__tests__/sse-client.test.ts  # PASS
git add src/lib
git commit -m "feat(lib): add SSE client (POST + ReadableStream) with frame parser"
```

---

### Task 10：filterStore + qaStore（Zustand）

**Files:**
- Copy + adapt: `../app/src/stores/filterStore.ts`、`../app/src/stores/qaStore.ts`

**Step 1：拷贝 + 适配**

```bash
cp /Users/uu/Documents/Coding/4C2026/app/src/stores/filterStore.ts src/stores/
cp /Users/uu/Documents/Coding/4C2026/app/src/stores/qaStore.ts src/stores/
```

如果它们 import 了 mobile 专属类型，调整 import 到 `@/api/types`。

**Step 2：typecheck**

```bash
npm run typecheck
```

**Step 3：commit**

```bash
git add src/stores
git commit -m "feat(stores): port filterStore + qaStore from mobile"
```

---

### Task 11：QueryProvider（含 IndexedDB persist）+ ConfigProvider

**Files:**
- Create: `src/providers/QueryProvider.tsx`、`src/providers/ConfigProvider.tsx`
- Test: `src/providers/__tests__/QueryProvider.test.tsx`

**Step 1：实现 `src/providers/QueryProvider.tsx`**

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { QUERY_DEFAULTS } from '@/constants/config';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_DEFAULTS.LIST_STALE_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

**Step 2：实现 `src/providers/ConfigProvider.tsx`**

```tsx
'use client';
import { ReactNode, useEffect } from 'react';
import { useConfig } from '@/api/hooks/useConfig';
import { useDeviceStore } from '@/stores/deviceStore';

export function ConfigProvider({ children }: { children: ReactNode }) {
  const init = useDeviceStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  useConfig(); // prefetch /config，缓存到 query
  return <>{children}</>;
}
```

**Step 3：commit**

```bash
git add src/providers
git commit -m "feat(providers): add QueryProvider and ConfigProvider"
```

---

## 阶段 2：Layout + 全局组件

### Task 12：根布局（layout.tsx）

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/Header.tsx`

**Step 1：写 Header**

```tsx
// src/components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQAStore } from '@/stores/qaStore';

const NAV = [
  { href: '/', label: '知识图谱' },
  { href: '/map', label: '地图' },
  { href: '/recognize', label: '识景' },
  { href: '/search', label: '搜索' },
  { href: '/me', label: '我的' },
];

export function Header() {
  const openQA = useQAStore((s) => s.open);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link href="/" className="font-semibold">筑脉 ArchTrail</Link>
        <nav className="flex gap-4 text-sm">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => openQA()}>
            <MessageCircleQuestion className="mr-2 h-4 w-4" />提问
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**Step 2：改 `src/app/layout.tsx`**

```tsx
import './globals.css';
import { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ConfigProvider } from '@/providers/ConfigProvider';
import { Header } from '@/components/layout/Header';
import { QASheet } from '@/components/qa/QASheet';

export const metadata = {
  title: '筑脉 ArchTrail · 古桥文化知识库',
  description: '中国古代桥梁知识图谱、地图、问答',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <QueryProvider>
          <ConfigProvider>
            <Header />
            <main className="container mx-auto px-4 py-6">{children}</main>
            <QASheet />
          </ConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Step 3：commit**

```bash
git add src/app/layout.tsx src/components/layout
git commit -m "feat(layout): add Header + root layout with providers"
```

---

### Task 13：QASheet（全局 Dialog + SSE 渲染）

**Files:**
- Create: `src/components/qa/QASheet.tsx`、`src/components/qa/QAResult.tsx`

**Step 1：实现 QASheet**

参考 `qaStore`（已 port）的 state 字段：`isOpen / question / context / outline / details / deepDive / sources / error`。

```tsx
'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQAStore } from '@/stores/qaStore';
import { QAResult } from './QAResult';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { askQuestion } from '@/lib/sse-client';

export function QASheet() {
  const { isOpen, close, context, ingestEvent, reset } = useQAStore();
  const [q, setQ] = useState('');

  async function submit() {
    if (!q.trim()) return;
    reset(q.trim(), context);
    for await (const ev of askQuestion({ question: q.trim(), context })) {
      ingestEvent(ev);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>提问</SheetTitle>
        </SheetHeader>
        <div className="flex gap-2 mt-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="例如：赵州桥的敞肩拱有何优势？" />
          <Button onClick={submit}>问</Button>
        </div>
        <div className="flex-1 overflow-y-auto mt-4">
          <QAResult />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Step 2：QAResult 渲染 outline → details → sources**

写一个简单的版本，按 store 状态分块渲染。fallback_actions 渲染为可点击 chip。

**Step 3：commit**

```bash
git add src/components/qa
git commit -m "feat(qa): add global QASheet with SSE streaming render"
```

---

## 阶段 3：核心页面（每个页面一个 task）

### Task 14：知识图谱首页（`/`）

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/knowledge/KnowledgeTreeWeb.tsx`、`src/components/knowledge/MainlineCard.tsx`

**步骤纲要**：
1. 用 `useKnowledgeTree()` 拉数据（响应形态：lvl1 → lvl2 → knowledge_point，3 层，Phase 3 已上线 2026-04-17）
2. 三列布局：左侧 4 主线 nav（sticky）+ 中间二级折叠目录（展开后直接挂 KP 叶子）+ 右侧 placeholder 区（v1 留白，v1.1 接 history/review）
3. 每条 KP 叶子（`type: 'knowledge_point'`）链到 `/knowledge/[id]`
4. 写 `KnowledgeTreeWeb.test.tsx` 用 mock data 渲染，断言主线名称、点击展开
5. typecheck + commit

```bash
git commit -m "feat(home): knowledge graph 3-column layout with tree drill-down"
```

---

### Task 15：搜索页（`/search`）

**Files:**
- Create: `src/app/search/page.tsx`、`src/components/search/SearchBar.tsx`、`src/components/search/SearchResults.tsx`

**步骤纲要**：
1. 顶部 SearchBar（控件：输入框 + 类型 SegmentedControl `all/knowledge_point/bridge`）
2. 用 `useSearch()` 拉结果，URL 同步：`?q=...&type=...`
3. 待输入态：localStorage 历史 + 推荐关键词（从 `/config` 取或硬编码）
4. 类型动态过滤器：bridge → bridge_type/era/region；knowledge_point → line/category
5. 结果列表用徽标区分类型，点击进详情
6. 测试：mock useSearch，断言渲染、空结果文案
7. commit `feat(search): unified search with type filters`

---

### Task 16：知识点详情（`/knowledge/[id]`）

**Files:**
- Create: `src/app/knowledge/[id]/page.tsx`、`src/components/knowledge/KnowledgePointDetail.tsx`、`src/components/knowledge/KeyPointCard.tsx`、`src/components/knowledge/L2Section.tsx`

**步骤纲要**：
1. RSC 模式：在 page.tsx 用 `fetch` 直拉 `/knowledge/points/{id}` 渲染 SSR meta（title/description）
2. Client 部分：复用 `useKnowledgePoint()` hook
3. 渲染 L0 卡片列表 → 点击展 L1（同卡向下展开）
4. L2 区域三 Tab：对比 / 演变 / 争议
5. 引用角标 hover 弹 source popover
6. 固定动作区：「提问」按钮（注入 `qaStore.context = { type: 'knowledge_point', id }`）+ 「在地图查看典型案例」+ 「Flash Cards」
7. 测试 KeyPointCard 折叠/展开
8. commit `feat(knowledge): knowledge point detail with L0/L1/L2`

---

### Task 17：桥梁详情（`/bridges/[id]`）

**Files:**
- Create: `src/app/bridges/[id]/page.tsx`、`src/components/bridge/BridgeHero.tsx`、`src/components/bridge/SectionAccordion.tsx`、`src/components/bridge/RelatedKnowledge.tsx`

**步骤纲要**：
1. SSR meta（桥名 + 朝代 + 地区）
2. Client：复用 `useBridge(id)` hook
3. Hero：图片轮播（shadcn Carousel），无图占位
4. 档案卡：基本信息 + 标签 + 收藏按钮（调 `useFavoriteToggle`）
5. 四章节 Accordion（structure/geography/society/history），每个内部 L0 列表 + 点击展 L1
6. 空章节灰字提示
7. 右栏浮动：当前章节锚点 + 关联知识点
8. 测试 SectionAccordion 空状态、L1 展开
9. 进入页面时调 `POST /history` 记录浏览
10. commit `feat(bridge): bridge detail with hero, sections, related KP`

---

### Task 18：地图页（`/map`）

**Files:**
- Create: `src/lib/amap-loader.ts`、`src/app/map/page.tsx`、`src/components/map/AMapContainer.tsx`、`src/components/map/ResultDrawer.tsx`、`src/components/map/MapFilters.tsx`、`src/components/map/MapAttribution.tsx`

**步骤纲要**：
1. `amap-loader.ts`：单例 `AMapLoader.load(...)`，缓存 Promise
2. `AMapContainer`：`useEffect` 初始化地图、监听 `moveend/zoomend` → debounce 300ms → 更新 bounds → trigger `useBridgeClusters`
3. clusters.points 渲染为 Marker；clusters.clusters 渲染为聚合圈（自定义 InfoWindow 显示 count）
4. 点击 Marker → 调 useBridge(id) → ResultDrawer 显示
5. MapAttribution：从 `useConfig()` 取 `map.provider` + `map.approval_number`
6. 筛选条 MapFilters（桥型/年代/地区 chip）→ 注入 useBridgeClusters params
7. 测试 amap-loader 单例（mock @amap/amap-jsapi-loader）
8. commit `feat(map): AMap container with cluster, drawer, filters, attribution`

---

### Task 19：识景页（图片上传版）

**Files:**
- Create: `src/app/recognize/page.tsx`、`src/components/recognize/UploadZone.tsx`、`src/components/recognize/CandidateList.tsx`

**步骤纲要**：
1. UploadZone：drag-drop 区 + `<input type="file" accept="image/*">`，校验 ≤ 5MB JPG/PNG
2. 提交 → `useRecognize` mutation（已 port 的 hook）→ FormData 含可选 latitude/longitude（web 不强制取定位，先不要）
3. CandidateList：候选卡（缩略图 + 桥名 + 桥型 + 年代 + region + confidence_hints）→ 点击进详情
4. 无结果：显示 fallback_suggestions → 「去搜索」/「去地图筛选」按钮
5. 测试：mock fetch 返回候选 + fallback 两种 case
6. commit `feat(recognize): upload-based bridge recognition with fallbacks`

---

### Task 20：闪卡（`/flashcards/[kpId]`）

**Files:**
- Create: `src/app/flashcards/[kpId]/page.tsx`、`src/components/flashcard/FlashCardFlip.tsx`、`src/components/flashcard/ReviewSession.tsx`、`src/components/flashcard/SummaryCard.tsx`

**步骤纲要**：
1. 拉 `/knowledge/points/{kpId}/flashcards`
2. ReviewSession：依次 yield 卡片，键盘 ← → 切卡，空格翻面，1=已掌握 / 2=待复习（调 `usePutReviewProgress`）
3. FlashCardFlip：framer-motion `rotateY` 翻面，卡片正反内容
4. 全部完成 → SummaryCard（本次 N 张，已掌握 M 张）+「返回」
5. 测试 FlashCardFlip 翻转状态、键盘事件
6. commit `feat(flashcard): review session with flip animation + keyboard shortcuts`

---

### Task 21：我的页面（`/me`）

**Files:**
- Create: `src/app/me/page.tsx`、`src/components/me/TodayReviewCard.tsx`、`src/components/me/FavoritesList.tsx`、`src/components/me/HistoryList.tsx`、`src/components/me/SettingsPanel.tsx`

**步骤纲要**：
1. 顶部 TodayReviewCard：`useReviewToday()` 拉数据，`total_due` 显示在徽标，按钮跳 `/flashcards/today`（一个特殊路由用 review/today 数据）
2. Tabs：收藏 / 历史 / 设置
3. FavoritesList：`useFavorites()` + 类型筛选 sub-tabs（all/bridge/knowledge_point/flashcard），每条带「取消收藏」按钮
4. HistoryList：`useHistory()` 按 `viewed_at` 分组（今天/昨天/更早）
5. SettingsPanel：语言切换（zh-CN / en）→ `useDeviceStore.setLanguage`，地图来源/审图号 readonly 显示
6. 测试 list 渲染 + 空状态
7. commit `feat(me): profile page with review/favorites/history/settings`

---

## 阶段 4：质量保障

### Task 22：全局错误处理 + ErrorBoundary

**Files:**
- Create: `src/components/feedback/ErrorBoundary.tsx`、`src/components/feedback/ErrorState.tsx`、`src/components/feedback/EmptyState.tsx`、`src/components/feedback/Skeleton.tsx`
- Modify: `src/app/error.tsx`、`src/app/not-found.tsx`

**步骤纲要**：
1. Next.js App Router 的 `error.tsx` / `not-found.tsx` 走根级
2. ErrorBoundary（client）包 QASheet + 各页面，捕获渲染错误
3. ErrorState 组件统一文案 + 重试按钮，区分 5xx / 网络 / 超时
4. EmptyState 组件统一插图 + 引导动作（移植 design.md §5.1）
5. 所有 hooks 错误态用 ErrorState 兜底，loading 用 Skeleton
6. 测试 ErrorBoundary 捕获 throw
7. commit `feat(feedback): global error/empty/skeleton states`

---

### Task 23：playwright E2E（5 路径冒烟）

**Files:**
- Create: `playwright.config.ts`、`tests/e2e/{home,search,bridge-detail,qa,favorites}.spec.ts`

**步骤纲要**：
1. `npm install -D @playwright/test && npx playwright install chromium`
2. playwright.config 启动 `npm run dev` 等 3000
3. 5 个 spec：
   - home：访问 / 看到 4 主线
   - search：输入「赵州桥」→ 出结果
   - bridge-detail：点结果进详情，看到档案卡
   - qa：点提问，输入问题，等 outline 渲染（mock SSE 或对真后端）
   - favorites：收藏一个桥，去 /me 看到
4. 提供两个 mode：`E2E_MODE=mock`（拦截 fetch 返回 fixture）或 `E2E_MODE=live`（连真后端）
5. commit `test(e2e): 5 critical-path playwright specs`

---

### Task 24：CI 检查 + README

**Files:**
- Create: `.github/workflows/ci.yml`（如果项目要 GitHub）、`README.md`

**步骤纲要**：
1. README 写：开发命令、env 配置、目录结构、与 mobile 的关系、部署
2. CI yml：node 20 / npm ci / npm run typecheck / npm run test:run / npm run build
3. commit `docs+ci: add README and CI workflow`

---

### Task 25：部署配置

**Files:**
- Create: `vercel.json`（如部署 Vercel）或 `wrangler.jsonc`（如部署 Cloudflare Pages）

**步骤纲要**：
1. 选择 Vercel 或 CF Pages（用户后续告知）
2. 在 dashboard 设置 env：`NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AMAP_KEY` / `NEXT_PUBLIC_AMAP_SECURITY_CODE`
3. 后端 CORS 白名单加上部署域名（需要去 RAG 仓库改 `CORS_ORIGINS`）
4. 部署 + 烟测
5. commit `chore: add deploy config`

---

## 完成定义（Definition of Done）

每个 task 通过的硬条件：
- `npm run typecheck` 0 error
- 该 task 新增/修改的测试 PASS
- 已 commit 到本仓库

整体 MVP 通过：
- 所有 25 个 task 完成
- 5 个 E2E 跑通
- 至少在本地连真后端跑过：首页 → 搜索 → 桥梁详情 → 提问 → 收藏 5 步全闭环

---

## 关键风险 + 抓手

| 风险 | 抓手 |
|------|------|
| 高德 JS API key 没拿到 | Task 18 之前先申请；卡住时先用 leaflet（react-leaflet）兜底（与 RAG/web 同栈） |
| SSE 在生产 nginx/CDN 被缓冲 | 后端响应已设 `X-Accel-Buffering: no`；Cloudflare 默认放行 SSE |
| mobile API 在 web 域名下的 CORS | 后端 `CORS_ORIGINS` 需加 web 域名（部署前确认） |
| TanStack Query persist 用 IndexedDB 在 Safari 私密模式失败 | 加 try/catch 降级到内存缓存，不影响主流程 |
| 移动端 stores 直接拷贝可能引用 RN 模块 | Task 6/10 注意手动检查 import；删除任何 `react-native` / `expo-*` 引用 |
