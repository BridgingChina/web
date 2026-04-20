# 桥知 BridgingChina · Web

Next.js 16 + React 19 desktop web client for the BridgingChina bridge knowledge platform. Mirrors the React Native mobile app's C-side experience (browse / search / detail / map / Q&A / flashcards) on top of the FastAPI public API (`/v1/*`).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- TanStack Query 5 + Zustand 5
- next-intl 4 (locale URL prefix, `zh-CN` / `en-US`, cookie detection)
- Better Auth client (cookie session → Bearer JWT for `/favorites|/review|/history`)
- AMap JS API 2.0 (`@amap/amap-jsapi-loader`)
- vitest 4 + @testing-library/react + Playwright (E2E)

## Develop

```bash
cp .env.example .env.local
# edit .env.local: set NEXT_PUBLIC_API_BASE_URL + NEXT_PUBLIC_AMAP_KEY
npm install
npm run dev          # http://localhost:3000
```

Backend default: `http://localhost:8000/v1` (RAG project on the same machine). Backend CORS already allows `http://localhost:3000`.

## Scripts

- `npm run dev` — Next.js dev server with Turbopack
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — vitest watch
- `npm run test:run` — vitest single run
- `npm run test:e2e` — Playwright E2E (auth-flow smoke)

## Project layout

```
middleware.ts     Root Next.js middleware — composes next-intl locale routing
                  with the Better Auth `/me` guard (see src/lib/auth-middleware.ts
                  for the pure helpers that are unit-tested separately).
src/
  app/
    [locale]/     All user-facing routes live under /<locale>/* (zh-CN | en-US).
                  Pages: home / map / search / recognize / knowledge / flashcards
                  / bridges / me. layout.tsx mounts NextIntlClientProvider +
                  QueryProvider + ConfigProvider + Header + QASheet.
    api/          Edge route handlers (AMap proxy).
  api/            apiClient + types + TanStack Query hooks. Bearer JWT is
                  auto-attached for /favorites|/review|/history via
                  ensureFreshJwt(); Accept-Language reads NEXT_LOCALE cookie.
  components/     Page-specific + shared UI
    LanguageSwitcher.tsx  Cookie + router.replace language toggle (Phase 1).
    layout/ qa/ knowledge/ bridge/ map/ recognize/ flashcard/ me/ feedback/
    common/ (FavoriteButton, RecordHistoryOnMount) · ui/ (shadcn primitives)
  i18n/           routing.ts (defineRouting) · navigation.ts (Link/useRouter
                  wrappers) · request.ts (server getRequestConfig) ·
                  glossary.yaml (bilingual terminology, synced from umbrella
                  docs/glossary.zh-en.yaml via scripts/sync-glossary.sh)
  messages/       zh-CN.json · en-US.json — UI strings
  lib/            auth-client (Better Auth) · auth-middleware (pure cookie/URL
                  helpers) · jwt-refresh · sse-client · amap-loader · glossary
                  (server-side YAML loader; do NOT import from client components)
                  · utils (cn)
  stores/         authStore · deviceStore · qaStore · filterStore (Zustand)
  providers/      QueryProvider · ConfigProvider
  constants/      config (env-driven)
docs/plans/       Design + impl plans (i18n Phase 1, unified auth Phase 4, …)
e2e/              Playwright E2E specs
```

## Relationship to other repos

- `../RAG/` — Python FastAPI backend (the public API at `/v1/*` is the only surface this web app touches)
- `../app/` — React Native mobile app (this web app reuses its `src/api/types.ts`, `client.ts`, hooks, and stores byte-for-byte where possible)
- `../RAG/web/` — separate admin console (not related to this C-side app)

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs typecheck + lint + tests + build on push / PR to `main`. The workflow is written assuming this `web/` directory sits inside a parent monorepo (`working-directory: web`). If you push this folder as its own repo, drop the `working-directory` and `cache-dependency-path` keys, or move the workflow up to the parent `.github/workflows/web-ci.yml`.

## Deployment

See `docs/DEPLOY.md` and `docs/plans/2026-04-16-web-version-design.md` for the full design.

Both Vercel and Cloudflare Pages are supported. Set:
- `NEXT_PUBLIC_API_BASE_URL` — backend public API URL
- `NEXT_PUBLIC_AMAP_KEY` — AMap JS API key (申请: https://lbs.amap.com/)
- `AMAP_SECURITY_CODE` — 高德 JS 安全密钥，服务端 secret（不加 `NEXT_PUBLIC_` 前缀）；由 `/api/amap` proxy 注入。Cloudflare 用 `wrangler secret put AMAP_SECURITY_CODE`。

Then add the deployed origin to the backend's `CORS_ORIGINS` env var.

## Conventions

- All commits use Conventional Commits (`feat:` / `fix:` / `chore:` / `test:` / `docs:`)
- TDD for non-UI logic (api/client, lib/sse-client, stores, constants, lib/auth-middleware, lib/jwt-refresh, lib/glossary)
- UI components manually verified via dev server; Playwright E2E covers the login → `/me` guard flow

## i18n (Phase 1)

- Locale detection chain: URL prefix (`/zh-CN/*` / `/en-US/*`) → `NEXT_LOCALE` cookie → `Accept-Language` header → default `zh-CN`.
- `<LanguageSwitcher />` writes the cookie and `router.replace(pathname, { locale })`; DB sync to the auth Worker (`preferred_locale`) is deferred to Phase 4.
- Server components: `useTranslations()` / `getTranslations()` from `next-intl`.
- API calls: `Accept-Language` is derived from the cookie inside `src/api/client.ts` — no need to thread locale from components. Server-side callers can pass `options.locale` explicitly.
- Bilingual glossary at `src/i18n/glossary.yaml` is the LLM-prompt term source; sync from umbrella `docs/glossary.zh-en.yaml` with `scripts/sync-glossary.sh --worktree <branch>`. Never `import '@/lib/glossary'` from a client component (bundles js-yaml).

## Auth (Phase 4)

- Root `middleware.ts` protects `/me` (locale-prefixed too). Unauthenticated requests 302 → `${NEXT_PUBLIC_AUTH_URL}/auth/login?callbackURL=…`.
- C-end API endpoints listed in `AUTHED_ENDPOINTS` (`/favorites`, `/review`, `/history`) auto-attach `Authorization: Bearer <jwt>` via `ensureFreshJwt()`. New authed endpoints go in that list.
- `/me` page renders a `LoginPrompt` when `useSession()` returns null — middleware covers direct URL access, this covers SPA navigation.
