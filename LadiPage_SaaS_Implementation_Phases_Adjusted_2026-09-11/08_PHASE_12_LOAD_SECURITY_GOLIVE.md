# PHASE 12 — Load Test, Security Validation and Production Rollout

Đây là phase xác nhận. Không nên coi “build pass” là bằng chứng hệ thống đã scale/an toàn.

## 1. Staging phải giống production
Tối thiểu:
- Cloudflare/OpenNext topology tương đương;
- Redis/BullMQ;
- DB engine/pool settings tương đương;
- R2/KV;
- API + general worker + browser worker separate;
- CSP headers;
- same-origin BFF.

Không dùng production customer data thật cho load/security test.

## 2. Load profiles

### Admin browse
```text
login
landing list
filters
detail
update metadata
```

### Builder
```text
open editor
load draft
autosave
manual save
publish enqueue
```

### Public
```text
many unique landing routes
mostly cache hit
controlled cache miss
custom domains
```

### AI
```text
small generate
SEO audit
Lighthouse/browser scan
burst per tenant
```

## 3. Measurements
- Cloudflare request/CPU/cache;
- Next p95/p99;
- Nest p95/p99;
- DB connections/pool wait;
- Redis;
- queue depth/lag;
- worker CPU/memory;
- browser worker crash rate;
- cost/request.

## 4. Capacity test
Tăng load tới khi một bottleneck chạm SLO.

Không chỉ tìm “max RPS”.
Xác định:
```text
SLO-compliant capacity
```

Ví dụ:
```text
X concurrent admin users
Y publish jobs/min
Z public cache-hit RPS
N browser scans concurrently
```

## 5. Soak test
Chạy vài giờ:
- memory leak;
- socket leak;
- DB connection leak;
- browser orphan process;
- Redis growth;
- queue backlog;
- temp file/object leak.

## 6. Failure injection
Test:
- Redis restart;
- DB slow;
- provider 429/503;
- R2 temporary error;
- worker crash giữa publish;
- duplicate job delivery;
- Next instance restart.

Kỳ vọng:
- idempotency không double side effect;
- queue retry;
- published pointer không corrupt;
- API fail fast, không treo chain timeout.

## 7. Security validation checklist

### Auth
- stolen/expired session;
- session fixation;
- logout invalidation;
- privilege change;
- direct Nest access;
- CSRF mutation.

### Authorization
- user role A gọi role B endpoint;
- hide button bypass via direct HTTP;
- object-level authorization.

### Tenant
- A read/update/delete/export B;
- websocket/SSE room leak;
- cache collision;
- worker job wrong tenant.

### Input
- unknown fields;
- oversized JSON;
- invalid enum/types;
- file upload abuse.

### Browser/Web
- XSS vectors;
- CSP violation;
- iframe/frame-ancestors;
- unsafe redirect;
- referrer leakage.

### AI
- SSRF private IP;
- metadata;
- redirect;
- DNS rebinding strategy;
- huge page/download;
- browser timeout;
- arbitrary tool call.

### Quota
- concurrent debit;
- duplicate idempotency;
- retry double charge;
- failed job refund.

## 8. Public edge validation
For cache hit:
- no Next request;
- no Nest request;
- no DB query.
- correct ETag/cache-control.
- custom domain mapping correct.
- bad route -> controlled 404.
- rollback version immediate/consistent.

## 9. Canary rollout
Recommended:
```text
internal
 -> 1%
 -> 5%
 -> 10%
 -> 25%
 -> 50%
 -> 100%
```

Auth/BFF cutover có thể rollout theo feature/user group thay vì raw percentage.

Edge public:
- dual-read fallback;
- monitor origin fallback and 5xx.

## 10. Rollback triggers
Define trước deploy:
- auth error > threshold;
- p95 > 2x baseline;
- 5xx burn;
- cross-tenant anomaly;
- publish failure;
- DB pool wait;
- bundle regression critical.

Rollback action phải cụ thể:
- feature flag;
- previous worker;
- previous KV pointer;
- revert release;
- disable AI/browser scan.

## 11. Go-live Definition of Done

Performance:
- budgets pass;
- Web Vitals pass target hoặc có documented exception;
- sync API SLO pass;
- no DB pool starvation;
- public edge cache path proven.

Security:
- no critical/high unresolved findings;
- tenant suite green;
- SSRF suite green;
- auth/BFF same-origin complete for scoped features;
- CSP enforce hoặc documented staged enforcement with expiry date;
- secrets isolated.

Reliability:
- async publish idempotent;
- worker crash recovery tested;
- rollback tested;
- alerts on-call actionable.

Operations:
- dashboards;
- runbook;
- backup/restore;
- DB migration rollback;
- incident contacts;
- cost dashboard.

## 12. Sau go-live
Theo dõi 7–14 ngày trước khi xóa compatibility/fallback code.

Chỉ sau đó:
- remove direct Nest browser path;
- remove old token refresh code;
- remove `/p/[slug]` hot-path dependency;
- remove old publish sync orchestration;
- tighten CSP từ report-only sang full enforce nếu chưa làm.


## Revision 2026-09-11 — go-live blockers sau Google/UI change

Bổ sung vào security validation:

### Google identity
- nonce hash/raw contract đúng;
- server-bound challenge nếu feature đã enable;
- nonce mismatch/expired/replay;
- ID token expired/wrong audience/invalid signature handled;
- email/account link collision;
- existing local account -> Google link policy;
- duplicate Google register concurrency;
- abuse rate limit không gây lockout diện rộng.

### Browser session
- DevTools/Application không có Nest bearer/provider bearer trong localStorage/sessionStorage/IndexedDB;
- JavaScript không đọc được access/refresh credential;
- `/api/auth/session` và `/api/auth/refresh` không trả token JSON;
- token rotation không có state-changing GET;
- logout revoke cả server session/refresh family theo policy.

### UI/UX
- Terms behavior giống nhau giữa email/Google signup;
- remember-me behavior có test hoặc control đã bỏ;
- keyboard/screen-reader password visibility control;
- loading/error state không cho double submit;
- Vietnamese/English copy đã thống nhất theo product locale.

### New release blockers
**Critical/High**
- legacy MD5 login vẫn reachable ngoài documented migration window;
- browser persistent storage còn bearer credential;
- Google/Nest login BFF đã scope nhưng vẫn trả raw token về JS;
- CORS authenticated API wildcard;
- replayable server challenge khi roadmap tuyên bố single-use;
- provider tokens persisted client-side không có approved exception.
