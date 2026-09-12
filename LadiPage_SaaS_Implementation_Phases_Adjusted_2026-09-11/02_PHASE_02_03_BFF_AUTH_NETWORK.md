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


# Revision 2026-09-11 — Google Login + partial HttpOnly migration

## A. Những gì đã đúng

Google button hiện:
- tạo random 32-byte nonce;
- hash SHA-256 dạng hex cho `google.accounts.id.initialize({ nonce })`;
- gửi raw nonce vào backend Supabase `signInWithIdToken`.

Không đổi ngược cơ chế hash/raw này.

Refresh flow hiện cũng đã có bước tốt:
- refresh token được Next ghi `HttpOnly`;
- refresh token được rotate phía backend;
- response auth dùng `Cache-Control: no-store`.

## B. P0 — Hoàn tất BFF/session cutover, không dừng ở “HttpOnly refresh”

Current state vẫn còn:
```text
Google credential
  -> browser platformAuthService
  -> direct Nest /auth/google
  -> token + refreshToken trả về browser JS
  -> browser POST token pair sang /api/auth/session
  -> access token vào localStorage/Zustand + JS cookie
  -> refresh token mới trở thành HttpOnly
```

Target mới:
```text
Google credential
  -> same-origin POST /api/auth/google
  -> Next server -> Nest /auth/google
  -> token pair chỉ tồn tại server-side / HttpOnly cookie boundary
  -> browser nhận safe session/user metadata, KHÔNG nhận Nest token
```

### Migration tối thiểu
1. Tạo same-origin BFF cho email login, Google login/register, logout, refresh.
2. Next gọi Nest bằng `NEST_INTERNAL_URL` server-only.
3. Access + refresh credential phải `HttpOnly` hoặc nằm sau opaque BFF session.
4. Xóa `nestToken` khỏi Zustand persisted state.
5. Không trả `{ token }` từ `/api/auth/session` GET và `/api/auth/refresh` POST.
6. Xóa JS-readable access token cookie.
7. `src/lib/api-client.ts` browser client chỉ gọi same-origin `/api`.
8. Xóa direct browser `NEXT_PUBLIC_API_URL` sau từng feature migration.
9. Persist client chỉ giữ UI-safe state; permission/menu không được dùng như security authority.

### Recommended session shape
**Stage 1 (ít thay đổi):**
- Nest access token: `HttpOnly; Secure; SameSite=Lax`, short TTL.
- Nest refresh token: `HttpOnly; Secure; SameSite=Lax`, longer rotating TTL.
- Next server đọc cookie và forward Authorization tới private Nest.

**Stage 2 (tùy scale/security):**
- browser chỉ giữ opaque `lp_session` HttpOnly;
- Redis/server session giữ backend token pair/session metadata;
- hỗ trợ revoke family, device/session listing và reuse detection.

## C. P1 — Google nonce phải gắn với server session/challenge nếu muốn anti-replay mạnh

Client-generated nonce hiện phù hợp Supabase flow, nhưng backend chỉ so sánh với raw nonce do chính browser gửi cùng request. Defense-in-depth target:

```text
GET /api/auth/google/challenge
  -> server tạo rawNonce + challengeId
  -> Redis SETNX challenge TTL 3–5 phút
  -> browser chỉ nhận hashedNonce
  -> challengeId ở HttpOnly cookie hoặc signed state

Google credential callback
  -> POST /api/auth/google { credential }
  -> Next atomic-consume challenge
  -> Next lấy rawNonce server-side
  -> Nest/Supabase verifies ID token + rawNonce
```

Acceptance:
- nonce mismatch fail;
- challenge expired fail;
- cùng credential/challenge replay lần 2 fail;
- challenge không được log;
- endpoint có rate limit.

Không bắt buộc block release chỉ vì chưa có server-bound nonce nếu Stage 1 BFF đã hoàn tất, nhưng phải có test token replay và documented risk decision.

## D. Refresh semantics

Hiện `GET /api/auth/refresh?redirect=...` làm thay đổi session/token rotation.

Target:
- middleware chỉ cheap gate, không rotate token bằng GET;
- BFF/server request tự refresh khi cần hoặc dùng POST same-origin;
- state-changing token rotation không dùng GET;
- refresh response không expose access token cho JavaScript sau cutover;
- refresh race/concurrency phải có test.

## E. Token lifecycle/backend storage

Hiện access token default 24h, refresh 30d và DB lưu raw token.

Target sau BFF:
- access token ngắn hơn (ví dụ 10–15 phút, tune theo tracing/risk);
- refresh 7–30 ngày theo product policy, rotation mỗi lần dùng;
- DB không lưu raw refresh bearer: lưu hash/HMAC lookup + session/family id;
- access revocation dùng `jti`/hash thay vì cần raw JWT nếu khả thi;
- replay một refresh token đã consume phải revoke/flag family theo policy;
- create/consume/rotate token phải transaction-safe hoặc có compensation rõ ràng.

## F. CORS / proxy / Origin

P0 ngay trước full rollout:
- thay `origin: "*"` + `credentials: true` bằng exact allowlist;
- sau BFF, authenticated Nest nên private/no browser CORS;
- bỏ việc tự set `Origin = Host` khi request thiếu Origin;
- `trustProxy: true` chỉ giữ khi origin bị firewall/private và trusted hops được kiểm soát;
- nếu origin public, giới hạn trusted proxy/hops và chặn direct-origin bypass.

## G. Password legacy

Nếu legacy username/password còn bật production:
- thay MD5 bằng Argon2id (hoặc approved adaptive KDF);
- version password hash;
- successful-login rehash hoặc reset strategy;
- không giữ max password 16 ký tự; cho passphrase dài hợp lý;
- rate limit + captcha/risk control không thay thế password hashing.

Nếu production bắt buộc dùng Supabase Auth:
- disable hẳn legacy password verification path để MD5 không còn reachable.

## H. Provider credential scope

Roadmap cũ nói chủ yếu về Nest bearer. Bổ sung:
- không persist Facebook/provider access tokens trong Zustand `localStorage` hoặc IndexedDB nếu token có thể gọi provider API;
- chuyển provider credential cần bảo mật về server vault/BFF hoặc short-lived scoped mechanism;
- client state chỉ giữ non-secret account/display metadata.

## I. Auth abuse/rate limiting

Global 20 req/min không đủ policy cho mọi route, trong khi nhiều controller skip throttle.

Auth target:
- `/auth/login`, `/auth/google`, `/auth/google/register`, `/auth/refresh`: named/bucketed limits;
- distributed counter qua Redis cho multi-replica;
- key theo IP + account/provider subject phù hợp;
- Google register có anti-abuse tương đương email register nhưng tránh captcha nếu không cần để giữ UX;
- 429 có `Retry-After`;
- monitor false-positive và conversion.

## J. Auth UI behavior security/UX

- “Keep me logged in” hiện không đổi session lifetime: hoặc implement thật server-side, hoặc bỏ control.
- Google signup hiện không bị chặn bởi state checkbox Terms như email signup: thống nhất behavior; nếu cần audit consent, lưu `termsVersion`, `acceptedAt`, source/provider server-side.
- password visibility toggle phải là `<button type="button">` có aria-label và keyboard focus, không dùng clickable `<span>`.
- thay `alert()` bằng app feedback/toast không block UI.
- thống nhất ngôn ngữ Sign In/Back to dashboard/Keep me logged in với phần còn lại.
