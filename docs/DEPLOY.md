# Deployment

## Vercel (recommended)

1. Import this directory as a Vercel project (or set Root Directory to `web/` if monorepo).
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL` — e.g. `https://api.archtrail.example.com/api/mobile/v1`
   - `NEXT_PUBLIC_AMAP_KEY` — JS API key from https://lbs.amap.com/
   - `NEXT_PUBLIC_AMAP_SECURITY_CODE` — security code if your AMap project requires it
3. Deploy — Vercel auto-detects Next.js 16.
4. **Backend CORS:** add the deployed `*.vercel.app` origin to the FastAPI `CORS_ORIGINS` env var.

## Cloudflare Pages (alternative)

1. Connect repo, set framework preset to Next.js.
2. Build command: `npm run build`. Build output: `.next`.
3. Same environment variables as above.
4. Note: Cloudflare's Next.js adapter (@cloudflare/next-on-pages) may need separate setup if Edge runtime is required.

## Self-hosted (Docker)

```bash
npm run build
npm run start  # node server.js or next start
```

Set the env vars before `npm run start`. Front by nginx/caddy with SSE-friendly config (no buffering for `/api/mobile/v1/qa/ask`).

## Post-deploy checklist

- Open `/` — knowledge tree loads
- Open `/map` — AMap renders, attribution visible
- Open `/search?q=赵州桥` — results render
- Click 提问, ask a question — SSE streams in
- Check browser console for CORS / mixed content errors
