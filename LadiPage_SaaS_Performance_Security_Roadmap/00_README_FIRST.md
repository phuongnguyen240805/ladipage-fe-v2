# LadiPage SaaS – Performance & Security Hardening Roadmap

**Phạm vi repo**
- Frontend: `phuongnguyen240805/ladipage-fe-v2`
- Backend: `phuongnguyen240805/nest-admin-backend`
- Trọng tâm backend: `apps/ladipage-backend`

**Mục tiêu**
Tái cấu trúc theo hướng **modular SaaS + strict boundaries + edge delivery**, giữ nguyên nền tảng Next.js + NestJS + Redis/BullMQ + PostgreSQL/Supabase + Cloudflare, **không rewrite**, **không microservice hóa sớm**, và không sửa code ngoài phạm vi phase.

## 1. Nguyên tắc điều hành

1. **Không big-bang refactor.** Mỗi phase phải có baseline, acceptance criteria, rollback.
2. **Không sửa code không liên quan.** Mỗi PR chỉ được thay đổi file thuộc phạm vi phase.
3. **Server Component first.** Client Component chỉ dùng cho interaction/realtime/editor.
4. **Browser chỉ biết same-origin Next/BFF.** URL Nest nội bộ không xuất hiện trong client bundle.
5. **Backend là owner của business rules.** Supabase/Postgres là hạ tầng dữ liệu, không là application service thứ hai.
6. **Authentication, authorization, tenant authorization là ba lớp riêng.**
7. **Async cho việc chậm.** AI, publish, Lighthouse/Puppeteer, import/export lớn, automation chạy qua queue.
8. **Public landing không đi qua DB/API hot path.** Target: Cloudflare Worker → KV → R2/CDN.
9. **Security by enforcement, không bằng UI.** Hide button chỉ là UX.
10. **Đo trước khi scale.** Không quyết định scale bằng CPU/RAM cảm tính.

## 2. Current-state evidence đã dùng để lập kế hoạch

Frontend:
- `src/app/layout.tsx`: global Theme/MSW/Query/Auth/Sidebar provider tree.
- `src/providers/QueryProvider.tsx`: cài Customer Care auth boundary cho QueryClient toàn app.
- `src/app/(admin)/layout.tsx`: client layout, nhiều `pathname.startsWith()` để điều phối domain.
- `src/lib/api-client.ts`: browser Axios gọi `NEXT_PUBLIC_API_URL`, lấy Nest token từ Zustand và refresh.
- `next.config.ts`: comment xác nhận browser gọi Nest trực tiếp; Instatic same-origin rewrite riêng.
- `open-next.config.ts`: đã split Cloudflare server workers theo `landing`, `builder`, `ai`, `education`, `ads`, `commerce`, ...
- `scripts/deploy-cloudflare-all.mjs`: custom multi-worker deployment.
- `src/app/api/...`: đã tồn tại BFF routes cho Builder/Landing/AI SEO.
- `src/app/p/[slug]/route.ts`: public landing hiện vẫn qua Next.
- `package.json`: Next 16.2.12, React 19.2.0; có bundle guard/performance scripts.

Backend:
- `apps/ladipage-backend/src/app/app.module.ts`: global JWT, RBAC, throttling, timeout, idempotency; module graph rất lớn; API có thể conditionally import worker modules.
- `apps/ladipage-backend/src/main.ts`: global ValidationPipe tốt; CORS production hiện `origin: "*"` cùng `credentials: true`.
- `apps/ladipage-backend/src/worker.main.ts`: worker process riêng đã có.
- `apps/ladipage-backend/src/app/worker-app.module.ts`: Landing AI, AI SEO Lighthouse, Ads, Automation worker modules.
- `libs/database/...`: TypeORM DataSource; PostgreSQL pool có `DB_POOL_MAX` mặc định 10.
- Docker production: cần tách API runtime khỏi Chromium/browser worker.
- Backend có Redis/BullMQ, SSE/WebSocket, idempotency, RBAC và tenant infrastructure – đây là nền tảng tốt để harden, không cần rewrite.

## 3. Target architecture

```text
                           INTERNET
                              |
                       Cloudflare WAF/CDN
                              |
              +---------------+---------------+
              |                               |
              v                               v
        Admin / Builder                  Public Landing
           Next.js                     Cloudflare Worker
              |                               |
         same-origin BFF                      +--> KV route map
              |                               +--> R2 immutable HTML/assets
              v
         Nest LadiPage API
              |
      +-------+---------+----------------+
      |                 |                |
      v                 v                v
 PostgreSQL/Supabase   Redis            BullMQ
                                         |
                         +---------------+---------------+
                         |                               |
                         v                               v
                  General Worker                  Browser Worker
              publish/automation/AI       Lighthouse/Puppeteer/URL scan
                                                   isolated egress
```

## 4. Phase map

| File | Phases | Trọng tâm |
|---|---|---|
| `01_PHASE_00_01_BASELINE_NEXT_BOUNDARIES.md` | 0–1 | Baseline + feature/route boundaries + root layout/RSC |
| `02_PHASE_02_03_BFF_AUTH_NETWORK.md` | 2–3 | Same-origin BFF + HttpOnly session + header/CORS/CSP foundation |
| `03_PHASE_04_TENANT_DATA_CONTRACTS.md` | 4 | Tenant isolation + DTO + API contract + ownership |
| `04_PHASE_05_06_PERFORMANCE_CACHE_DB.md` | 5–6 | Bundle, parallel fetch, cache policy, pagination, DB pool |
| `05_PHASE_07_08_ASYNC_PUBLISH_EDGE.md` | 7–8 | BullMQ publish pipeline + KV/R2 public delivery |
| `06_PHASE_09_AI_SECURITY_RATE_QUOTA.md` | 9 | SSRF + weighted rate limit + atomic quota |
| `07_PHASE_10_11_OBSERVABILITY_CI.md` | 10–11 | Tracing/metrics + CI/CD/security/performance gates |
| `08_PHASE_12_LOAD_SECURITY_GOLIVE.md` | 12 | Load test, tenant test, security test, rollout/go-live |

## 5. Fast-track

**Một kỹ sư full stack:** khoảng 25–35 ngày làm việc nếu triển khai an toàn và kiểm thử đầy đủ.

**Hai luồng song song:** khoảng 15–20 ngày làm việc:
- Track A: Next boundaries → BFF/Auth → bundle/cache.
- Track B: tenant/data → async publish → AI security/observability.
- Giao nhau tại Phase 3, Phase 7 và Phase 10.

Không nên rút ngắn bằng cách gộp migration auth + tenant + publish vào một deploy.

## 6. KPI cuối

- Browser không thấy `NEXT_PUBLIC_API_URL` cho Nest.
- Browser không giữ Nest bearer token trong localStorage/Zustand persistent storage.
- Root layout không bọc toàn SaaS bằng feature-specific client providers.
- `/landing-pages` không tải Pixi, XLSX, FullCalendar, Customer Care socket, AI SEO, Education, Ads code nếu không sử dụng.
- Initial first-party JS gzip `/landing-pages`: mục tiêu 200–300 KB hoặc thấp hơn sau đo baseline.
- LCP p75 < 2.5 s, INP p75 < 200 ms, CLS < 0.1.
- API CRUD p95 < 300–500 ms trong tải danh định.
- Long-running work trả `202 + jobId`.
- Public landing cache-hit không gọi Next/Nest/DB.
- 0 cross-tenant leakage trong test suite.
- CSP enforce sau thời gian Report-Only.
- SSRF test private/link-local/metadata/redirect/DNS rebinding đều bị chặn.
- Credit/quota atomic, concurrency test không overspend.
- Có trace xuyên Browser/Next/Nest/DB/Redis/BullMQ/Worker.
