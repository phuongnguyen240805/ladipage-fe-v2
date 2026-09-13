# Phase 0-3 baseline and guardrails

Source snapshot: user-provided frontend archive, reviewed 2026-09-13.

This patch intentionally does not invent runtime performance numbers. Generate the
measured baseline from a production build with the existing commands:

```bash
pnpm build
pnpm perf:baseline
pnpm perf:report
```

Minimum routes to capture under the same device/network profile:

- `/landing-pages`
- `/ai-seo`
- `/facebook-ads`
- `/cskh`
- `/e-learning`
- `/builder/<known-page-id>`
- `/signin`
- one public `/p/<slug>`

Record initial/route JS gzip, LCP, INP, CLS, request count, hydration time,
route-transition time, API waterfall, Cloudflare hit/miss and Nest p50/p95/p99.

## Phase 0-3 architectural invariants

1. Root layout must not import Query/Auth/Sidebar providers.
2. Browser REST traffic uses `/api/backend/*`; no browser-visible Nest REST URL.
3. Browser code does not attach a Nest `Authorization: Bearer` header.
4. Nest access/refresh credentials are held in HttpOnly cookies.
5. Auth refresh is POST-only; middleware never refreshes via navigation GET.
6. Generic BFF cannot expose `/auth/*`, `/account/reissue-token` or logout.
7. Customer Care realtime uses a short-lived scoped ticket, not the session JWT.
8. CORS browser origins are exact allowlist entries.

Run `pnpm security:phase-0-3` in CI before build/test to detect regressions cheaply.
