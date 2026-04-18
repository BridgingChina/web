# Landing Page 设计 · 2026-04-19

## 背景

当前 `web/` 根路径 `/` 直接是「知识图谱」主功能页（四大主线 + 知识树 + 最近浏览），新访客落地即是密集信息。需要在 `/` 增设一个极简 landing page，把功能页迁到 `/knowledge`。

## 决策摘要（用户逐项确认）

| 维度 | 选择 |
|---|---|
| 路径策略 | 替换现有 `/`；原知识图谱页迁到 `/knowledge` |
| 受众 / 风格 | 极简：一张视觉 + slogan + 单 CTA |
| 视觉方案 | 纯 CSS 渐变 + 字体排版，零素材依赖 |
| Slogan | 主「千年古桥，一念即达」+ 副「中国古桥知识图谱 · 桥知 BridgingChina」 |
| CTA | 点击进 `/knowledge`；保留顶栏 Header |

## 架构

- 新 `src/app/page.tsx` = LandingPage（server component，无状态、无请求）
- 原 `src/app/page.tsx` 内容 → 迁到 `src/app/knowledge/page.tsx`（代码零改动）
- 不建 `src/components/landing/` 目录：只有一个 hero 区块，inline 即可（YAGNI）

## 视觉规格

- **布局**：`min-h-[calc(100dvh-3.5rem)]` 扣掉 sticky Header（14px=3.5rem），flex 垂直居中
- **背景**：深色渐变 `bg-gradient-to-br from-[#0a0f1e] via-[#14213d] to-[#1d3557]` + 左上径向光晕（`#d4a04a` 金泥色，透明度 0.25）
  - 备选浅色宣纸方案弃用原因：深色底下「千年」二字厚度更足，评审首屏情绪更对
- **字体**：追加 `Noto_Serif_SC` weight 700，仅用于 `<h1>`
- **主标题**：`text-[clamp(48px,9vw,112px)] font-serif font-bold tracking-[0.12em] text-slate-50`，内容 `千年古桥　一念即达`（中间全角空格作气口）
- **副标题**：`mt-6 text-sm md:text-base text-slate-300/80 tracking-[0.3em]`，内容 `中国古桥知识图谱 · 桥知 BridgingChina`
- **CTA**：`<Link href="/knowledge"><Button size="lg" className="mt-12">开始探索</Button></Link>`，shadcn 默认 primary

## 字体加载（layout.tsx）

```tsx
import { Noto_Serif_SC } from 'next/font/google';
const notoSerifSC = Noto_Serif_SC({
  variable: '--font-noto-serif-sc',
  weight: ['700'],
  subsets: ['latin'],
});
// <html className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable}`}>
```

`globals.css` / `@theme` 中暴露 `.font-serif { font-family: var(--font-noto-serif-sc), ui-serif, serif; }`。

## 链接审计（5 处 → 改 3 处）

| 文件 | 行 | 改动 |
|---|---|---|
| `src/components/layout/Header.tsx` | 10 | NAV `{ href: '/' }` → `{ href: '/knowledge' }` |
| `src/components/layout/Header.tsx` | 27 | active 判断简化为 `pathname.startsWith(n.href)`，去掉 `/` 特例 |
| `src/components/me/FavoritesList.tsx` | 38 | `<Link href="/">知识图谱</Link>` → `<Link href="/knowledge">` |
| `src/components/layout/Header.tsx` | 24 logo | 保留 `/`（点 logo 回 landing 是品牌惯例） |
| `src/app/not-found.tsx` | 13 | 保留 `/`（404 回 landing 合理） |

## 数据流 / 错误 / 加载

Landing 全静态，无网络、无 loading、无 error 态。`/knowledge` 数据流与原 `/` 完全一致，继续沿用 React Query hooks。

## 测试 / 验证

- **不写 vitest**（按 CLAUDE.md「UI 组件人工验证」）
- 必跑：`npm run typecheck` + `npm run lint` + `npm run build`
- 人工验证清单：
  1. `/` 打开看到 hero 一屏 + CTA
  2. CTA 点击跳 `/knowledge`，知识图谱正常渲染
  3. Header 「知识图谱」tab 在 `/knowledge` 路径下高亮；在 `/` 不高亮
  4. FavoritesList 空态链接跳 `/knowledge`
  5. 404 页「回到首页」跳 landing

## 明确不做（YAGNI）

- 第二屏 features section
- Scroll hint、AOS、Framer Motion 动效
- 视频、Lottie、3D
- 独立 OG image（沿用 `layout.tsx` 既有 metadata）
- A/B 实验、埋点
