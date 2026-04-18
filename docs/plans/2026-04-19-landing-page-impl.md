# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `web/` 根路径 `/` 增设一个极简 landing page（CSS 渐变 hero + 衬线 slogan + 单 CTA），把原知识图谱页迁到 `/knowledge`。

**Architecture:** 纯 server component，零数据依赖。路由迁移通过「移动文件 + 改链接」完成；新 landing 通过 Tailwind v4 `@theme` 注册 `Noto Serif SC` 为 `--font-serif`，组件端用 `font-serif` utility。Header 保留但 NAV 条目改路径。

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · shadcn/ui Button · next/font/google (`Noto_Serif_SC`)

---

## 上下文速览

- 工作目录：`/Users/uu/Documents/Coding/4C2026/web`
- 不写 vitest（per `web/README.md:83`「UI 组件人工验证」）
- 项目使用 Conventional Commits
- 设计依据：`docs/plans/2026-04-19-landing-page-design.md`

---

### Task 1: 迁移知识图谱页到 /knowledge

**Files:**
- Move: `src/app/page.tsx` → `src/app/knowledge/page.tsx`（内容零改动）

**Step 1: 用 git 迁移文件（保留 history）**

Run:
```bash
cd /Users/uu/Documents/Coding/4C2026/web
mkdir -p src/app/knowledge
git mv src/app/page.tsx src/app/knowledge/page.tsx
```

**Step 2: 验证迁移成功**

Run: `git status`
Expected: 看到 `renamed: src/app/page.tsx -> src/app/knowledge/page.tsx`。

**Step 3: 不要立刻 commit** —— 等 Task 2 建好新 `page.tsx` 再一起提交，避免中间态 `/` 404。

---

### Task 2: 创建 landing 页的空占位（防 / 404）

**Files:**
- Create: `src/app/page.tsx`

**Step 1: 写最小占位（临时内容，Task 5 再填充）**

Content of `src/app/page.tsx`:
```tsx
export default function LandingPage() {
  return <div>landing placeholder</div>;
}
```

**Step 2: 跑 dev server 确认 / 与 /knowledge 都能路由**

Run: `npm run dev`（后台跑；Ctrl+C 之前先确认下述）
- 访问 `http://localhost:3000/` 看到 "landing placeholder"
- 访问 `http://localhost:3000/knowledge` 看到原知识图谱页（四大主线 + 知识树）

**Step 3: Commit 路由迁移**

```bash
git add src/app/page.tsx src/app/knowledge/page.tsx
git commit -m "refactor(routing): move knowledge graph from / to /knowledge

Prepares / for a landing page; knowledge graph content moves unchanged."
```

---

### Task 3: 更新 Header 导航到 /knowledge

**Files:**
- Modify: `src/components/layout/Header.tsx:9-15`（NAV 数组）
- Modify: `src/components/layout/Header.tsx:27`（active 判断逻辑）

**Step 1: 改 NAV 第一项的 href**

Edit `src/components/layout/Header.tsx` line 10:

```diff
- { href: '/', label: '知识图谱' },
+ { href: '/knowledge', label: '知识图谱' },
```

**Step 2: 简化 active 判断**

Edit `src/components/layout/Header.tsx` line 27:

```diff
- const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
+ const active = pathname.startsWith(n.href);
```

（NAV 不再有 `/` 条目，特例判断不再需要；Logo 的 `/` 链接不走 active 逻辑。）

**Step 3: 人工验证**

在 dev server 下：
- 访问 `/` ：Header 里「知识图谱」tab **不**高亮
- 访问 `/knowledge`：Header 里「知识图谱」tab 高亮
- 访问 `/map`：「地图」高亮、其他不亮

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "refactor(header): point 知识图谱 nav to /knowledge"
```

---

### Task 4: 更新 FavoritesList 空态链接

**Files:**
- Modify: `src/components/me/FavoritesList.tsx:38`

**Step 1: 改 href**

Edit the line:
```diff
- 还没有收藏，去 <Link href="/" className="underline">知识图谱</Link> 或 <Link href="/map" className="underline">地图</Link> 探索吧。
+ 还没有收藏，去 <Link href="/knowledge" className="underline">知识图谱</Link> 或 <Link href="/map" className="underline">地图</Link> 探索吧。
```

**Step 2: 人工验证**

（FavoritesList 在 `/me` 收藏 tab 的空态展示，假设当前用户无收藏：）
- 访问 `/me`，点到收藏 tab
- 点空态里的「知识图谱」链接 → 跳 `/knowledge`

如果跳不通或看不到空态（已有收藏），用 DevTools 临时清 localStorage 的 device-id 或直接手动访问 `/knowledge` 验证链接地址正确。

**Step 3: Commit**

```bash
git add src/components/me/FavoritesList.tsx
git commit -m "fix(me): update favorites empty-state link to /knowledge"
```

---

### Task 5: 加载 Noto Serif SC 字体

**Files:**
- Modify: `src/app/layout.tsx:1-19`

**Step 1: 引入字体**

Edit `src/app/layout.tsx`：

```diff
- import { Geist, Geist_Mono } from 'next/font/google';
+ import { Geist, Geist_Mono, Noto_Serif_SC } from 'next/font/google';
```

**Step 2: 初始化字体实例**

在 `geistMono` 定义后追加：

```tsx
const notoSerifSC = Noto_Serif_SC({
  variable: '--font-noto-serif-sc',
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
});
```

**Step 3: 挂到 `<html>`**

```diff
- <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
+ <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable}`}>
```

**Step 4: 验证 typecheck 通过**

Run: `npm run typecheck`
Expected: 无 error。

**Step 5: 暂不 commit**（与 Task 6、7 一起提交）

---

### Task 6: 在 Tailwind @theme 注册 font-serif

**Files:**
- Modify: `src/app/globals.css:7-49`（@theme inline 块）

**Step 1: 在 @theme inline 里添加一行**

在 `--font-mono: var(--font-geist-mono);`（line 11）之后、`--font-heading` 之前插入：

```diff
  --font-mono: var(--font-geist-mono);
+ --font-serif: var(--font-noto-serif-sc);
  --font-heading: var(--font-sans);
```

这样 Tailwind v4 会自动生成 `font-serif` utility class。

**Step 2: 验证 build 无 CSS 告警**

Run: `npm run build`
Expected: build succeeds（这一步之后 Task 7 再加页面）。实际可以把这步跟 Task 7 合并跑一次。

**Step 3: 暂不 commit**

---

### Task 7: 实现 landing page hero

**Files:**
- Modify: `src/app/page.tsx`（替换 Task 2 的占位）

**Step 1: 写完整 hero**

Replace the content of `src/app/page.tsx` with:

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <section
      className="relative -mx-4 -my-6 flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0a0f1e 0%, #14213d 55%, #1d3557 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] -top-[10%] h-[55%] w-[55%] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,160,74,0.35) 0%, rgba(212,160,74,0) 70%)',
        }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <h1 className="font-serif text-[clamp(48px,9vw,112px)] font-bold leading-[1.05] tracking-[0.12em] text-slate-50">
          千年古桥　一念即达
        </h1>
        <p className="mt-6 text-sm tracking-[0.3em] text-slate-300/80 md:text-base">
          中国古桥知识图谱 · 桥知 BridgingChina
        </p>
        <Link href="/knowledge" className="mt-12">
          <Button size="lg">开始探索</Button>
        </Link>
      </div>
    </section>
  );
}
```

**关键细节：**
- `-mx-4 -my-6` 抵消 `layout.tsx:33` 的 `<main>` 内边距，让 hero 能贴到视口边缘
- `min-h-[calc(100dvh-3.5rem)]`：扣掉 sticky Header 的 14px
- 背景渐变用 inline `style` 而非 Tailwind arbitrary value，因为 oklch/hex 颜色嵌在 gradient 字符串里更稳
- 光晕 blob 用 `aria-hidden` 纯装饰
- Slogan 中间是**全角空格**（U+3000），不是半角空格

**Step 2: typecheck + lint + build 全绿**

Run in parallel:
```bash
npm run typecheck
npm run lint
npm run build
```
Expected: 全部 pass。

**Step 3: 人工验证 hero**

Dev server（`npm run dev`）已在 Task 2 启动，若未启动则 `npm run dev`。
- 访问 `/`：
  - 看到深色渐变全屏
  - 看到左上金色光晕
  - 主标题衬线字、粗、带字距；「千年古桥」与「一念即达」之间有气口（全角空格）
  - 副标题小号、灰白、大字距
  - CTA 按钮可点击
- 点 CTA → 跳 `/knowledge` → 看到四大主线 + 知识树
- Header 叠在 hero 上方，`backdrop-blur` 让文字仍可读
- 响应式：窗口缩到 390px（移动端模拟）标题自动缩（clamp 下限 48px）

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat(landing): add minimal hero landing page at /

Dark gradient + radial warm-gold glow + Noto Serif SC slogan
\"千年古桥　一念即达\" + CTA to /knowledge. Pure CSS, no assets."
```

---

### Task 8: 终局验证

**Step 1: 再跑一次 full check**

Run:
```bash
npm run typecheck && npm run lint && npm run build
```
Expected: 全绿。若 build 警告字体未被使用的子集，可接受。

**Step 2: 人工完整回归**

清单：
1. ✅ `/` 渲染 landing，看不到任何知识图谱内容
2. ✅ CTA「开始探索」→ `/knowledge`，知识图谱正常
3. ✅ Header 里「知识图谱」tab 在 `/knowledge` 高亮，在 `/` 不亮
4. ✅ Header 其他 tab（地图/识景/搜索/我的）正常
5. ✅ Header 的 logo「桥知 BridgingChina」点击回 `/`（landing）
6. ✅ `/me` 收藏空态「知识图谱」链接跳 `/knowledge`
7. ✅ 乱访问 `/does-not-exist` → 404 页「回到首页」跳 `/`（landing）
8. ✅ 移动宽度（<640px）标题不溢出

**Step 3: 如果有任何点没过，回相应 Task 修复并追加 fix 提交。全过则 done。**

---

## 文件修改汇总（供审阅）

| 文件 | 动作 |
|---|---|
| `src/app/page.tsx` | 新建（landing hero） |
| `src/app/knowledge/page.tsx` | 从 `src/app/page.tsx` 迁移（git mv，内容不变） |
| `src/app/layout.tsx` | +Noto_Serif_SC 字体、挂 CSS var |
| `src/app/globals.css` | +`--font-serif: var(--font-noto-serif-sc);` |
| `src/components/layout/Header.tsx` | NAV 第一项 href：`/` → `/knowledge`；active 判断简化 |
| `src/components/me/FavoritesList.tsx` | 空态「知识图谱」链接 `/` → `/knowledge` |

## 明确不做（YAGNI 复述）

- 无新增测试（UI 人工验证）
- 无 `src/components/landing/` 目录（inline 够用）
- 无 scroll hint / 动效 / 第二屏
- 无 OG image / SEO 专项
- Header logo 仍指 `/`，not-found 仍指 `/`（设计文档已说明保留）
