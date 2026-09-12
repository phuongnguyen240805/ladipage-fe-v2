# PHASE 05–06 — Browser Performance, Cache Strategy, Pagination and Database Scale

# Phase 05 — Bundle/Rendering/Data-fetch performance

## 1. Không tối ưu theo số lượng chunk

Mục tiêu không phải “DevTools chỉ còn vài file như LadiPage”.

KPI:
- transferred JS;
- executed JS;
- unused JS;
- parse/hydration;
- route-specific dependencies;
- Core Web Vitals.

Nhiều chunk nhỏ hợp lý tốt hơn một vendor bundle lớn.

## 2. Route bundle rules

### `/landing-pages`
Initial route không được chứa:
- Pixi;
- Builder editor;
- FullCalendar;
- XLSX;
- tsParticles;
- Stripe;
- Customer Care socket;
- Education;
- Ads;
- AI SEO.

### `/builder`
Được phép:
- Pixi/editor/DnD;
- builder-specific runtime.

### `/cskh`
Được phép:
- socket/client realtime;
- care-specific runtime.

### `/ai-seo`
Được phép:
- AI SEO charts/workflow dependencies.

## 3. Shared package tree-shaking

Tránh barrel export khổng lồ:
```text
@liora/ui
```
kéo editor/chart/calendar.

Target:
```text
@liora/ui/button
@liora/ui/modal
@liora/ui/table
@liora/charts/...
@liora/editor/...
```

`sideEffects:false` chỉ khi package thật sự side-effect free.

## 4. Dynamic import

Dùng cho:
- editor;
- chart nặng;
- map;
- calendar;
- XLSX export;
- dev tools;
- AI panels mở theo action.

Không dùng dynamic import để che kiến trúc import cycle hoặc mọi component nhỏ.

## 5. Server fetch parallelism

Sai:
```text
await user
await tenant
await plan
await dashboard
```

Nếu độc lập:
```text
Promise.all([user, tenant, plan, dashboard])
```

Nếu dependent:
```text
user/session
    |
    +--> tenant
    +--> permissions
    +--> plan
```
chỉ parallel nhánh độc lập.

Fan-out lớn phải bounded concurrency, không Promise.all 500 requests.

## 6. Không preload toàn SaaS

Preload/prefetch:
- route user có xác suất cao click;
- current viewport;
- current feature subroutes.

Không prefetch tự động hàng chục module dashboard.

Audit Link prefetch cho sidebar lớn; có thể disable/selective preload cho route nặng.

## 7. RSC payload

Server Component không có nghĩa gửi DB object khổng lồ qua RSC.

Pass ViewModel nhỏ:
```text
page summary
id/name/status/updatedAt/tags
```
không pass full editor JSON vào list page.

---

# Phase 06 — Cache, pagination, DB pool

## 1. Cache taxonomy

| Data | Policy |
|---|---|
| Public landing HTML | R2/CDN immutable |
| Public static assets | CDN long TTL + content hash |
| Public template catalog | CDN/revalidate |
| Tenant settings | Redis short/medium TTL + invalidation |
| Dashboard aggregates | Redis short TTL |
| Product/catalog | CDN/Redis theo sensitivity |
| Auth/session | session store/no public cache |
| Permission | no-store hoặc very short + event invalidation |
| Current user | private/no-store |
| Billing balance | source-of-truth, không stale cache |
| Credit quota | atomic source-of-truth |
| Builder draft | revision-aware |
| AI deterministic result | content-hash cache khi privacy cho phép |

## 2. Next cache user data

Rule:
```text
public -> cache
tenant -> cache key phải có tenant
user -> user key hoặc no-store
permission/billing -> ưu tiên no-store/very short
```

Không:
```text
cache key ["current-user"]
```
nếu callback đọc cookie user.

## 3. Cursor pagination

Dùng cursor khi:
- table lớn;
- infinite list;
- CRM/customer/leads/orders/events;
- logs/history;
- AI tasks.

Keyset:
```sql
WHERE tenant_id = :tenant
  AND (created_at, id) < (:createdAt, :id)
ORDER BY created_at DESC, id DESC
LIMIT :limit
```

Index:
```text
(tenant_id, created_at DESC, id DESC)
```

Offset giữ cho dataset nhỏ/admin page cần page number.

## 4. DB connection pool

PostgreSQL hiện có `DB_POOL_MAX` mặc định 10.

Capacity formula:
```text
API replicas * API pool
+ general worker replicas * worker pool
+ browser worker DB pool (nếu thật sự cần)
+ admin/migration reserve
< DB max connections
```

Browser worker tốt nhất không giữ DB credential nếu không cần.

### Khi scale
Xem xét PgBouncer:
```text
Nest/Workers -> PgBouncer -> PostgreSQL
```

Không tăng `DB_POOL_MAX` mù quáng để chữa slow query.

## 5. DB observability prerequisite
Trước tune:
- connection active/idle/wait;
- pool wait time;
- slow query;
- p95 query;
- rows scanned;
- lock/deadlock;
- top queries.

## 6. Query/index review
Ưu tiên query:
- landing list;
- customer/leads;
- orders;
- AI task/job list;
- analytics filters;
- domain routes.

Mỗi index mới phải có query evidence; không index mọi cột.

## 7. Redis
Phân namespace:
```text
session:
cache:
rate:
idempotency:
queue:
lock:
```

Tránh key collision.
TTL explicit.
Không dùng Redis cache làm source-of-truth cho money/credit nếu không có atomic model.

## 8. Acceptance criteria

Phase 05:
- route budgets green;
- `/landing-pages` zero-byte heavy unrelated features;
- giảm unused JS so baseline;
- không tăng hydration errors;
- data fetch độc lập không waterfall.

Phase 06:
- cache inventory documented;
- user/tenant cache có isolation tests;
- cursor cho ít nhất các high-volume list;
- pool budget tính theo replica;
- dashboard có DB/Redis metrics;
- không có endpoint critical phụ thuộc cache stale cho auth/billing/quota.

## Mục tiêu
Tăng tốc bằng cách giảm work thực sự ở browser/server/DB, không chỉ “chia nhiều bundle”.


## Revision 2026-09-11 — performance gates cho auth/UI mới

### Route budgets bổ sung
Đưa `/signin` và `/signup` vào critical route budget, cùng `/p/[slug]`.

Đo riêng:
- first-party JS trước/sau provider extraction;
- Google GIS third-party script transferred/executed;
- time từ click Google -> credential callback -> BFF -> Nest/Supabase -> dashboard ready;
- auth route LCP/INP/CLS;
- layout shift khi Google button/script/captcha/spinner xuất hiện;
- public landing hydration/JS trước/sau bỏ Auth/Sidebar/Query providers.

### Mục tiêu kiến trúc
- Google GIS chỉ tải trên auth surface, không root/admin route khác.
- Public landing không bootstrap Zustand auth/extension auth.
- Permission/menu cache client không được giữ lâu để “tối ưu” security-sensitive UI.
- Auth provider external latency phải tách khỏi internal Nest latency khi đo.

### Auth backend latency
Google login có external Supabase/Google dependency nên không ép cùng một SLO với CRUD nội bộ.

Đề xuất tách:
```text
auth.google.total p95
auth.google.provider p95
auth.google.nest_internal p95
auth.session.refresh p95
auth.email.local_or_supabase p95
```

Chỉ tối ưu sau trace. Có thể parallel các lookup độc lập trong issue-login flow nhưng không đổi transaction/authorization semantics chỉ để giảm vài ms.

### UI regression gate
- Playwright visual baseline cho signin/signup desktop/mobile.
- axe/accessibility smoke cho form.
- keyboard-only auth flow.
- no double-submit khi Google/email loading.
- no layout jump khi error/captcha/button trạng thái thay đổi.
