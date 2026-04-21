# web/CLAUDE.md

细化命令、栈、env 见 `README.md`。本文件只沉淀反复踩的约束。
全局拓扑、API surface 分工见 `../CLAUDE.md`。

## Auth（Better Auth + auth.bridgingchina.net）

- 判登录态**一律**用 `useSession()` from `@/lib/auth-client`。`useAuthStore.session` 看起来像 zustand store，实际生产代码从不 `setSession`（只测试写），用它做 gate 永远 false。
- 登录链接走跨子域：照抄 `src/app/[locale]/me/page.tsx` 的 `buildLoginHref()` —— 原生 `<a href="${NEXT_PUBLIC_AUTH_URL}/auth/login?callbackURL=<当前页>">`。**禁用** `@/i18n/navigation` 的 `<Link href="/sign-in">`：i18n 会加 locale 前缀 → `/zh-CN/sign-in` → 本仓无此路由 → 404。
- `src/api/client.ts` 的 `AUTHED_ENDPOINTS`（`/favorites` / `/review` / `/history`）未登录调返 401。消费这些的 hook（`useHistory` / `useFavorites` / `useReview`）要放在 "`session != null`" 分支**之后**渲染的子组件里，不要在顶层无条件 mount，否则产生 401 噪音。

## Deploy

- 生产部署走 **Cloudflare Workers Builds**（CF dashboard 里的 GitHub 集成）：push `main` 自动 build + deploy `bridge-web` worker，**不经** GitHub Actions。`.github/workflows/ci.yml` 只跑 `typecheck + lint + test + build`，不 deploy。
- 本地手动 `npm run deploy`（opennextjs-cloudflare）是 fallback —— CF 集成失灵、或想线下验证 build artifact 时用。

## Gotchas

- App Router 路由全部在 `src/app/[locale]/<page>/page.tsx`（i18n Phase 3 之后）。老 issue / 旧 plan 里写 `src/app/<X>/page.tsx` 要翻译成 `src/app/[locale]/<X>/page.tsx`。
- zsh 下路径含 `[locale]` 必须加引号（`git add "src/app/[locale]/..."`），否则 shell glob 报 `no matches found`。
- `npm run typecheck` 报一堆 `Cannot find module '.../page.js'` 一般是陈旧 `.next/types/` 残留，`rm -rf .next && npm run typecheck` 重跑。
- i18n 新增文案要**同时**更新 `src/messages/zh-CN.json` 和 `en-US.json`；缺 key 在 next-intl 下会直接 throw。rich-text key（带 `<tag>…</tag>`）用 `t.rich(key, { tag: (chunks) => <...>{chunks}</...> })`。
