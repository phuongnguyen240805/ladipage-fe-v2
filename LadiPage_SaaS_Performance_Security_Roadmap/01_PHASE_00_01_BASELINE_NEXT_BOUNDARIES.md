# PHASE 00–01 — Baseline, Next.js Feature Boundaries, Lightweight Layout, RSC First

## Phase 00 — Đóng baseline trước khi sửa

### Mục tiêu
Tạo mốc đo kỹ thuật để mọi refactor sau đều có thể chứng minh **nhanh hơn / an toàn hơn**, tránh tối ưu theo cảm giác.

### Không thay đổi behavior
Phase này chỉ thêm đo lường, CI report và tài liệu. Không đổi auth, API contract, data flow hay routing production.

### Baseline cần thu
Cho tối thiểu các route:
- `/landing-pages`
- `/ai-seo`
- `/facebook-ads`
- `/cskh`
- `/e-learning`
- `/builder/<known-page-id>`
- `/signin`
- một public `/p/<slug>`

Đo:
1. JS transferred gzip/brotli.
2. JS parsed/executed.
3. Coverage – unused JS.
4. request count.
5. TTFB, FCP, LCP, INP, CLS.
6. hydration time.
7. API waterfall.
8. route transition time.
9. Cloudflare cache hit/miss.
10. Nest p50/p95/p99 tương ứng.

### File hiện có tận dụng
Frontend:
- `package.json`
  - `analyze:bundle`
  - `perf:report`
  - `perf:baseline`
  - `perf:check`
- `scripts/performance/next-bundle-guard.mjs`

### Artifact baseline
Tạo:
```text
docs/performance/
  baseline-YYYYMMDD.md
  route-budget.json
  screenshots/
  traces/
```

Ví dụ budget:
```json
{
  "/landing-pages": {
    "initialJsGzipKb": 300,
    "routeJsGzipKb": 120,
    "lcpP75Ms": 2500,
    "inpP75Ms": 200
  }
}
```

### Definition of Done
- Có baseline commit SHA.
- Có performance report lưu CI artifact.
- Không có regression behavior.
- Sau các phase sau có thể compare cùng điều kiện.

---

# Phase 01 — Next.js route/feature boundaries

## Vấn đề hiện tại

`src/app/layout.tsx` hiện bọc:
```text
ThemeProvider
  -> MswProvider
    -> QueryProvider
      -> AuthProvider
        -> SidebarProvider
          -> entire app
```

`src/providers/QueryProvider.tsx` còn cài `CustomerCareAuthBoundary` cho QueryClient toàn hệ thống.

`src/app/(admin)/layout.tsx` là Client Component và tự xác định domain bằng nhiều `pathname.startsWith()`.

Kết quả:
- client boundary quá cao;
- feature-specific lifecycle chạy ở route không liên quan;
- admin layout trở thành central conditional router;
- dependency graph khó tree-shake;
- khó bảo đảm route chỉ tải feature của chính nó.

## Target folder architecture

Không cần đổi URL public. Chỉ dùng route group để phân layout/runtime:

```text
src/app/
  layout.tsx                      # HTML/body, cực nhẹ

  (public)/
    layout.tsx
    p/[slug]/...

  (auth)/
    layout.tsx
    signin/...

  (admin)/
    layout.tsx                   # server layout
    _components/
      AdminShell.client.tsx
    _providers/
      AdminProviders.client.tsx
    landing-pages/
    crm/
    analytics/
    billing/

  (admin-fullwidth)/
    layout.tsx
    ai-seo/
    cskh/
    cloudphone/

  (builder)/
    layout.tsx
    builder/[pageId]/

  (embedded)/
    layout.tsx
    extension-preview/...
```

Nếu đổi route group gây path conflict, thực hiện theo từng domain, không di chuyển tất cả một lúc.

## Root layout target

```text
RootLayout (Server)
  -> html
  -> body
  -> optional tiny Theme bootstrap only
  -> children
```

Không chứa:
- SidebarProvider
- Customer Care boundary
- Builder provider
- Socket provider
- MSW production runtime
- feature auth logic

## Provider scoping

### Admin
```text
(admin)/layout.tsx (Server)
   |
   +--> AdminProviders.client
          |
          +--> QueryClientProvider
          +--> UI-only auth state if necessary
          +--> SidebarProvider
          +--> AdminShell.client
```

### Customer Care
```text
cskh/layout.tsx
   |
   +--> CustomerCareProviders.client
          +--> socket
          +--> auth boundary
          +--> care-specific query defaults
```

### Builder
```text
(builder)/layout.tsx
   |
   +--> BuilderProviders.client
          +--> editor stores
          +--> DnD/Pixi only after entering builder
```

## Server Component first policy

Default `.tsx` không có `"use client"`.

Chỉ đánh dấu Client Component cho:
- drag/drop;
- editor canvas;
- realtime socket surface;
- modal;
- controlled form;
- local UI state;
- browser APIs.

Initial data:
```text
Server Page
  -> server-only backend client (Phase 02)
  -> pass serialized ViewModel
  -> small Client island
```

Không dùng `useEffect()` làm initial fetch nếu dữ liệu có thể lấy server-side.

## Landing Pages target graph

Initial `/landing-pages` KHÔNG được import:
- `pixi.js`
- `xlsx`
- `@fullcalendar/*`
- `@stripe/*`
- `socket.io-client`
- Customer Care runtime
- AI SEO modules
- Education modules
- Facebook Ads modules
- Builder editor extensions

Builder chỉ load khi:
```text
click Edit -> /builder/:id -> dynamic/import route chunk
```

## Cách triển khai ít rủi ro

### Step 1
Tách `SidebarProvider` khỏi root và đưa vào admin group.

### Step 2
Tách `CustomerCareAuthBoundary` khỏi global `QueryProvider`.

### Step 3
Đưa `MswProvider` về dev/test boundary; production không phải hydrate cho MSW.

### Step 4
Tách `AdminShell.client.tsx` khỏi layout server.

### Step 5
Di chuyển conditional layout theo filesystem route group từng feature:
1. Customer Care
2. AI SEO
3. CloudPhone
4. Builder/editor
5. Facebook Ads embed

### Step 6
Audit imports bằng bundle analyzer.

## Acceptance criteria

1. Root `layout.tsx` không import Sidebar/Auth/CustomerCare-specific provider.
2. Admin layout server-render được; chỉ shell interaction là client.
3. `/landing-pages` không có heavy-feature code không liên quan.
4. Functional behavior không đổi.
5. Bundle budget không xấu hơn baseline.
6. Không thêm custom Webpack `splitChunks` trong phase này.
7. Cloudflare multi-worker `open-next.config.ts` giữ nguyên trừ khi route move buộc update mapping.

## Rollback
Mỗi provider extraction là một commit riêng. Nếu lỗi:
- revert route-group commit;
- giữ component extraction đã an toàn;
- không rollback bundle tooling.

## Mục tiêu đạt được
- dependency graph sạch theo feature;
- giảm hydration/global client runtime;
- chuẩn bị cho BFF server fetching;
- browser chỉ tải feature đang dùng;
- giữ được OpenNext server-worker split hiện có.
