# POST-CHANGE REVIEW — Google Login, Session, UI/UX (2026-09-11)

## 1. Kết luận

Roadmap gốc đúng về kiến trúc và vẫn nên giữ. Tuy nhiên code hiện nằm giữa quá trình chuyển từ browser bearer-token sang BFF/HttpOnly. Đây là trạng thái cần hoàn tất sớm, vì refresh token đã được bảo vệ tốt hơn nhưng access token vẫn JavaScript-readable và persisted.

### Đánh giá
- **Roadmap design:** tốt, giữ nguyên chiến lược modular monolith + BFF + edge + worker separation.
- **Phase 01:** chưa đạt — root/admin client boundary còn rộng.
- **Phase 02:** partial — đã có BFF ở một số feature nhưng direct Nest client vẫn tồn tại.
- **Phase 03:** partial/high-risk migration state — HttpOnly refresh tốt, access token/browser persistence chưa đạt acceptance.
- **Phase 05:** có tiến bộ — `/landing-pages` dùng dynamic imports; chưa có bundle/runtime evidence trong gói source để chứng minh KPI.
- **Backend security:** nền tảng guard/validation tốt nhưng CORS, password legacy, token-at-rest, throttling exemptions cần harden.
- **Google login:** nonce hash/raw implementation đúng hướng; cần chuyển exchange vào BFF và cân nhắc server-bound single-use challenge.

## 2. Findings theo mức ưu tiên

### P0 / release-gating

#### P0-01 — Browser vẫn giữ Nest access token
Evidence:
- `src/features/auth/stores/auth.store.ts`: persisted `nestToken`, permissions, menus vào localStorage.
- `src/features/auth/utils/session-cookie.ts`: JS ghi session cookie.
- `src/app/api/auth/session/route.ts`: GET trả `{ token }`; POST nhận raw token pair từ browser.
- `src/app/api/auth/refresh/route.ts`: POST trả access token JSON.
- `src/lib/api-client.ts`: browser lấy Zustand token và gắn Bearer.

Action:
- same-origin login/Google/refresh/logout BFF;
- access/refresh HttpOnly hoặc opaque server session;
- remove token from Zustand/localStorage/JS cookie/JSON;
- browser API client same-origin only.

#### P0-02 — Backend authenticated CORS wildcard
Evidence:
- `apps/ladipage-backend/src/main.ts`: `origin: "*"` + `credentials: true`.

Action:
- exact origin allowlist ngay;
- private Nest after BFF;
- automated CORS tests.

#### P0-03 — Legacy password MD5
Evidence:
- `libs/nest-core/src/modules/auth/auth.service.ts` vẫn `md5(password + psalt)`.
- frontend/backend password policy còn max 16.

Action:
- Argon2id/versioned migration hoặc disable legacy path;
- allow long passphrases.

#### P0-04 — Provider/bearer credentials trong client persistence
Evidence:
- auth store persist toàn bộ `facebook` state; code tham chiếu `profile.tokenSet.eaag`.
- settings/token utilities đọc token từ browser storage.

Action:
- inventory provider tokens;
- move API-capable provider credentials server-side / short-lived scoped channel;
- persist only non-secret display state.

### P1

#### P1-01 — Google exchange chưa same-origin
Current:
- Google credential + raw nonce đi từ browser trực tiếp vào Nest auth API.

Action:
- `/api/auth/google` BFF owns backend exchange.
- Keep current hashed nonce to Google/raw nonce to Supabase contract.
- Add server-bound challenge if stronger replay binding is required.

#### P1-02 — Refresh rotation bằng GET
`GET /api/auth/refresh?redirect=...` changes session state.

Action:
- middleware presence gate only;
- transparent refresh inside BFF/server request or same-origin POST.

#### P1-03 — Token DB storage raw + long access TTL
- access default 24h, refresh 30d;
- entities/service lookup raw token value.

Action:
- short access token after BFF;
- hash/HMAC refresh token storage;
- session/family ID + replay detection;
- transaction-safe rotation.

#### P1-04 — Rate limiting exemptions
- global throttle 20/min;
- many controllers use `@SkipThrottle()` including AI/landing/customer-care/cloud-phone routes.

Action:
- Redis-backed distributed named policies;
- weighted limits for expensive work;
- exemption review + edge/internal authentication.

#### P1-05 — Root provider/client layout remains global
- public/auth route still receives Query/Auth/Sidebar client runtime.
- `AuthProvider` rehydrates auth state even before public early return.
- admin layout remains pathname-driven client shell.

Action:
- route groups/providers scoped per domain;
- server admin layout + small client shell;
- verify `/p/[slug]` and auth routes zero admin-only runtime.

### P2 / UX & maintainability

#### P2-01 — “Keep me logged in” is UI-only
Implement real session persistence selection or remove it.

#### P2-02 — Google signup bypasses Terms checkbox branch
Email submit checks `isChecked`; Google handler runs independently.

If consent is a product/legal requirement:
- require same gate for both;
- store `termsVersion`, `acceptedAt`, `provider`.

#### P2-03 — Accessibility/copy
- password eye uses clickable `<span>`;
- mixed English/Vietnamese on signin;
- signup success uses `alert()`.

Replace with semantic button + aria-label, unified locale, non-blocking feedback.

#### P2-04 — Swagger/proxy/header hardening
- `/docs` enabled with persisted authorization;
- Fastify `trustProxy: true`;
- hard-coded cookie secret;
- missing Origin is rewritten to Host;
- no security-header policy found in reviewed Next source config.

Gate Swagger in prod, trust known proxy path, remove synthetic Origin, move cookie secret to env/remove if unused, and verify actual Cloudflare response headers before adding duplicate policy.

## 3. Positive changes to preserve

- Google nonce generation uses Web Crypto and correct SHA-256 hex/raw split for Supabase.
- Supabase server client disables `persistSession`/auto-refresh.
- refresh token is now HttpOnly and backend rotation consumes the old DB record.
- global Nest ValidationPipe uses whitelist/forbidUnknown style hardening.
- JWT/RBAC guards are global.
- `/landing-pages` already uses substantial dynamic import for non-initial UI.
- roadmap already has good CSP Report-Only -> enforce, tenant isolation, async/edge and observability sequencing.

## 4. Recommended implementation order

### Wave 1 — close auth exposure
1. Exact CORS allowlist.
2. Add same-origin Google/email auth BFF.
3. Set credential cookies HttpOnly / server session.
4. Remove token from Zustand/localStorage/session JSON.
5. Move browser API client to same-origin for account/session first.
6. Add regression tests before removing compatibility path.

### Wave 2 — backend credential hardening
1. Disable/migrate MD5.
2. Hash refresh token at rest + family/reuse model.
3. Per-route distributed throttling; remove unjustified skips.
4. Proxy/Origin/Swagger hardening.
5. Security headers/CSP report collection.

### Wave 3 — performance/UI boundaries
1. Freeze new UI baseline.
2. Move Auth/Sidebar/Query providers out of root.
3. Convert admin layout to server + client islands.
4. Measure `/signin`, `/signup`, `/landing-pages`, `/p/[slug]`.
5. Fix auth a11y/terms/remember-me/copy.
6. Enforce route bundle budgets in CI.

## 5. Auth test matrix

| Test | Expected |
|---|---|
| Google valid credential | session created, no token exposed to JS |
| nonce mismatch | 401/422 |
| challenge expired | reject |
| challenge replay | second attempt rejected if server-bound mode |
| expired/wrong-audience token | reject |
| existing email link | only approved verified-identity path |
| concurrent Google register | one account/workspace outcome |
| refresh twice concurrently | one valid rotation outcome |
| old refresh replay | reject + family policy |
| logout | refresh/server session revoked |
| role changed mid-session | backend immediately denies old privilege |
| disallowed Origin | CORS/CSRF rejected |
| direct Nest protected call | authz/tenant guard enforced |
| signup without Terms | same behavior Google/email |
| remember-me off | non-persistent browser session if feature retained |

## 6. Performance test matrix

Routes:
- `/signin`
- `/signup`
- `/landing-pages`
- `/p/[slug]`
- representative admin feature
- builder

Capture:
- transferred/executed/unused JS;
- hydration duration;
- LCP/INP/CLS;
- Google script cost on auth only;
- navigation/login total latency split provider vs internal;
- request waterfall;
- route transition;
- Nest p50/p95/p99;
- Redis/DB waits.

No performance claim should be considered complete until Phase 00 evidence is produced from a production build/staging topology.
