# 筑脉 ArchTrail · Web

Next.js 16 + React 19 desktop web client for the ArchTrail bridge knowledge platform. Mirrors the React Native mobile app's C-side experience (browse / search / detail / map / Q&A / flashcards) on top of the existing FastAPI mobile API.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- TanStack Query 5 + Zustand 5
- AMap JS API 2.0 (`@amap/amap-jsapi-loader`)
- vitest 4 + @testing-library/react

## Develop

```bash
cp .env.example .env.local
# edit .env.local: set NEXT_PUBLIC_API_BASE_URL + NEXT_PUBLIC_AMAP_KEY
npm install
npm run dev          # http://localhost:3000
```

Backend default: `http://localhost:8000/api/mobile/v1` (RAG project on the same machine). Backend CORS already allows `http://localhost:3000`.

## Scripts

- `npm run dev` — Next.js dev server with Turbopack
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — vitest watch
- `npm run test:run` — vitest single run

## Project layout

```
src/
  app/            App Router routes (home / map / search / recognize / me + dynamic detail pages)
  api/            apiClient + types + 8 TanStack Query hooks (ported from mobile)
  components/     Page-specific + shared UI components
    layout/       Header
    qa/           Global QASheet (right-side Sheet) + SSE renderer
    knowledge/    KP detail blocks + L2 tabs + citations + tree
    bridge/       Hero carousel + section accordion
    map/          AMap container + filters + drawer + attribution
    recognize/    Upload zone + candidate list
    flashcard/    Flip card + review session + summary
    me/           Today review + favorites/history/settings panels
    feedback/     ErrorBoundary + ErrorState + EmptyState
    common/       FavoriteButton + RecordHistoryOnMount
    ui/           shadcn/ui primitives
  lib/            sse-client (POST + ReadableStream) + amap-loader (singleton) + device-id (localStorage) + utils (cn)
  stores/         deviceStore / qaStore / filterStore (Zustand)
  providers/      QueryProvider / ConfigProvider
  constants/      config (env-driven)
docs/plans/       Design + impl plans
```

## Relationship to other repos

- `../RAG/` — Python FastAPI backend (the mobile API at `/api/mobile/v1/*` is the only surface this web app touches)
- `../app/` — React Native mobile app (this web app reuses its `src/api/types.ts`, `client.ts`, hooks, and stores byte-for-byte where possible)
- `../RAG/web/` — separate admin console (not related to this C-side app)

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs typecheck + lint + tests + build on push / PR to `main`. The workflow is written assuming this `web/` directory sits inside a parent monorepo (`working-directory: web`). If you push this folder as its own repo, drop the `working-directory` and `cache-dependency-path` keys, or move the workflow up to the parent `.github/workflows/web-ci.yml`.

## Deployment

See `docs/DEPLOY.md` and `docs/plans/2026-04-16-web-version-design.md` for the full design.

Both Vercel and Cloudflare Pages are supported. Set:
- `NEXT_PUBLIC_API_BASE_URL` — backend mobile API URL
- `NEXT_PUBLIC_AMAP_KEY` — AMap JS API key (申请: https://lbs.amap.com/)
- `AMAP_SECURITY_CODE` — 高德 JS 安全密钥，服务端 secret（不加 `NEXT_PUBLIC_` 前缀）；由 `/api/amap` proxy 注入。Cloudflare 用 `wrangler secret put AMAP_SECURITY_CODE`。

Then add the deployed origin to the backend's `CORS_ORIGINS` env var.

## Conventions

- All commits use Conventional Commits (`feat:` / `fix:` / `chore:` / `test:` / `docs:`)
- TDD for non-UI logic (api/client, lib/sse-client, stores, lib/device-id, constants)
- UI components manually verified via dev server; playwright E2E is on the roadmap
