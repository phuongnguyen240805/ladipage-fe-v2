# PHASE 02–03 — Same-Origin BFF, Server API Client, HttpOnly Session, Network Security

# Phase 02 — Browser không biết backend thật

## Vấn đề hiện tại
`src/lib/api-client.ts`:
- dùng `NEXT_PUBLIC_API_URL`;
- lấy Nest token từ Zustand;
- thêm `Authorization: Bearer ...`;
- refresh Nest token trong browser;
- timeout 30s.

`next.config.ts` xác nhận browser gọi Nest trực tiếp, trong khi một số feature lại đi qua Next BFF.

Đây là kiến trúc đa đường:
```text
Browser -> Nest
Browser -> Next BFF -> Supabase/Nest
Browser -> một số Supabase paths
```

## Target
```text
Browser
   |
   | same-origin /api/*
   v
Next BFF / Server Actions / Server Components
   |
   | NEST_INTERNAL_URL
   v
Nest API
   |
   +--> DB/Redis/Queue/external providers
```

### Browser không được biết
- `NEST_INTERNAL_URL`
- service bearer token
- Supabase service role
- internal service hostname
- role/tenant headers do client tự khai báo

## Proposed frontend folders

```text
src/lib/backend/
  client.server.ts
  request-context.server.ts
  errors.ts
  timeout.server.ts
  endpoints/
    auth.server.ts
    landing.server.ts
    billing.server.ts
    ...

src/lib/api/
  browser.ts               # same-origin only
  schemas/
```

`client.server.ts` phải:
```ts
import "server-only";
```

## Một server client duy nhất

Nhiệm vụ:
- base URL nội bộ;
- request ID;
- traceparent;
- timeout;
- auth/session-derived credential;
- error normalization;
- safe retry policy;
- response validation nếu cần.

Không cho từng feature tự tạo Axios/fetch client riêng.

## Header policy — explicit allowlist

Tuyệt đối không:
```ts
headers: request.headers
```

Cho phép từ browser BFF:
- `Content-Type`
- `Accept`
- `Idempotency-Key`
- conditional upload metadata đã validate

Do Next tạo:
- `Authorization` hoặc internal session credential
- `X-Request-Id`
- `traceparent`
- tenant context sau verify session

Không forward từ browser:
- `Host`
- `Connection`
- `X-Forwarded-*`
- `X-User-Id`
- `X-Role`
- `X-Tenant-Id`
- arbitrary Cookie
- arbitrary Authorization

## BFF route policy

Next BFF chỉ chịu trách nhiệm:
- session adaptation;
- CSRF;
- same-origin browser contract;
- schema validation ở boundary;
- upload normalization;
- response shaping cho UI nếu thật sự cần;
- Cloudflare/Next concerns.

Không đặt business rule tại BFF:
```text
page ownership
publish state
credit debit
tenant permission
domain mapping
```
các rule này thuộc Nest.

## Migration strategy

Không đổi toàn bộ API trong một commit.

Thứ tự:
1. Account/session read.
2. Landing list/detail.
3. Landing mutation.
4. Billing/plan.
5. Customer Care.
6. Ads/AI.
7. Loại `NEXT_PUBLIC_API_URL`.

Mỗi feature có feature flag:
```text
USE_BFF_LANDING=true
```
hoặc rollout theo route/server config, sau ổn định thì xóa flag.

---

# Phase 03 — Session/Auth network hardening

## Mục tiêu
Chuyển từ browser bearer-token model sang **HttpOnly secure session**.

## Target auth flow

```text
1. Browser -> POST /api/auth/signin
2. Next -> auth provider/Nest exchange
3. Next sets session cookie:
      HttpOnly
      Secure
      SameSite=Lax
      Path=/
4. Browser -> same-origin Next
5. Next validates session
6. Next server -> Nest
7. Nest thực hiện AuthN + AuthZ + Tenant AuthZ
```

Browser JavaScript không đọc access token.

## Cookie
Production:
```text
HttpOnly=true
Secure=true
SameSite=Lax
Path=/
short/rotating session
```

Nếu cross-site embed bắt buộc:
- thiết kế riêng `SameSite=None; Secure`;
- scope route/cookie;
- CSRF và origin validation;
- không mở rộng cookie chính toàn app.

## Middleware
`middleware.ts` chỉ làm:
- cheap session presence/expiry gate;
- host/public route routing;
- redirect sơ bộ.

Không coi middleware decode JWT là authorization cuối cùng.

## AuthN và AuthZ tách riêng

Backend pipeline:
```text
JWT/session verification
        |
        v
RBAC permission
        |
        v
tenant/resource ownership
        |
        v
domain operation
```

UI permission:
```tsx
{canDelete && <DeleteButton />}
```
chỉ để UX.

Nest endpoint vẫn phải reject nếu curl trực tiếp.

## CORS

Hiện backend có `origin: "*"` với `credentials: true`.

Target:
1. Khi Nest private: không cần browser CORS.
2. Nếu còn public endpoints:
   - allowlist exact origins;
   - public endpoints không phụ thuộc cookie admin;
   - tách public API security policy.

## CSRF
Với cookie auth:
- SameSite=Lax là baseline;
- mutation BFF kiểm `Origin`/`Host`;
- nếu có cross-site requirement dùng CSRF token/double-submit hoặc framework-supported token;
- không dựa vào CORS như CSRF defense duy nhất.

## CSP foundation

Triển khai:
1. `Content-Security-Policy-Report-Only`.
2. Thu violation từ các route chính.
3. Sửa Instatic/Stripe/Facebook/editor integrations.
4. Chuyển sang enforce.

Baseline:
```text
default-src 'self'
object-src 'none'
base-uri 'self'
frame-ancestors ...
script-src 'self' 'nonce-...'
connect-src 'self' <allowlist>
img-src 'self' data: https:<allowlist>
```

Không cố enforce CSP trong cùng deploy với auth migration.

## Security headers
Bổ sung phù hợp:
- `Referrer-Policy`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy`
- HSTS tại edge production
- frame policy qua CSP `frame-ancestors`

## Timeout hierarchy
Không để outer timeout ngắn hơn inner timeout.

Target khởi đầu:
```text
Browser UX timeout:       ~8s
Next BFF:                 ~6s
Nest sync handler budget: ~5s
External normal API:      2–4s
DB/Redis:                 bounded
Long AI/browser jobs:     async, không tăng HTTP timeout
```

Các con số phải tune theo tracing thực tế.

## Retry
Server client:
- GET/idempotent read: có thể retry 1–2 lần trên 502/503/504/429 với jitter.
- mutation: không retry nếu chưa có idempotency.
- tôn trọng `Retry-After`.
- không retry 4xx validation/auth.
- tránh retry amplification giữa Next/Nest/SDK/BullMQ.

## Files có khả năng thay đổi

Frontend:
- `src/lib/api-client.ts` – migrate/thu hẹp dần.
- `src/features/auth/providers/AuthProvider.tsx`
- `src/features/auth/stores/auth.store.ts`
- `src/features/auth/services/token-refresh.service.ts`
- `middleware.ts`
- `next.config.ts`
- các `src/app/api/**/route.ts`
- thêm `src/lib/backend/**`

Backend:
- `apps/ladipage-backend/src/main.ts`
- auth/session modules khi cần
- public API security config

## Acceptance criteria

1. Không còn Nest base URL trong browser source/network cho migrated routes.
2. Không lưu Nest bearer token trong persistent browser state.
3. Browser gọi same-origin.
4. Header forwarding có allowlist test.
5. CORS production không `*` cho authenticated API.
6. `curl` trực tiếp vào protected endpoint không bypass permission/tenant.
7. Auth migration không gây duplicate refresh loop.
8. CSP ở Report-Only, có report collector/dashboard trước enforce.

## Mục tiêu đạt được
- network topology kín hơn;
- XSS khó đánh cắp backend bearer token;
- giảm CORS complexity;
- central timeout/retry/header policy;
- chuẩn bị cho server-first data fetching.
