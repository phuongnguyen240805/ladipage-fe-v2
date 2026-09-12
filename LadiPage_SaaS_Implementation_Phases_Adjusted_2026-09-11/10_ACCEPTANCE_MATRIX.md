# Acceptance Matrix — Không đóng phase nếu chưa đạt

| Control | Evidence cần có |
|---|---|
| Root layout nhẹ | import graph + source review |
| Feature isolation | bundle analyzer / forbidden-package check |
| Server Component first | route review + reduced client boundaries |
| Browser không biết Nest | DevTools Network/Sources + build grep |
| Server API client duy nhất | source dependency rule |
| Header allowlist | unit/integration tests |
| HttpOnly session | browser cookie flags + no JS access |
| Auth ≠ AuthZ | direct endpoint tests |
| UI hide ≠ security | curl/HTTP tests |
| Tenant DB isolation | cross-tenant suite + schema/index review |
| Explicit DTO | API snapshot/schema |
| Fast/async separation | 202 job flow |
| Layered rate limit | edge + API config tests |
| Idempotency | duplicate concurrent mutation test |
| Retry bounded | fault test + retry counters |
| Downstream timeout | timeout tests/traces |
| Cache taxonomy | cache inventory |
| Next user cache safety | tenant/user cache-key tests |
| DB pool capacity | replica×pool budget + metrics |
| Cursor pagination | query plan + API contract |
| Parallel fetch | trace waterfall |
| No whole-SaaS preload | route network/bundle graph |
| Shared tree-shake | package exports + bundle proof |
| CSP | report-only dashboard, then enforce |
| Input validation | Next + Nest + DB tests |
| AI SSRF | private/metadata/redirect tests |
| Atomic quota | concurrency test |
| Observability | end-to-end trace |
| Public edge | cache hit causes 0 origin API/DB |
| Worker separation | process/image inspection |
| CI gates | failing regression blocks merge |
| Rollback | staging exercise |

## Release blockers

### Critical
Không release nếu:
- cross-tenant leak;
- auth bypass;
- quota double-spend;
- SSRF vào private/metadata;
- browser exposed service-role secret;
- publish có thể double side-effect gây corrupt state.

### High
Không full rollout nếu:
- authenticated Nest CORS vẫn mở rộng không kiểm soát;
- no idempotency on payment/credit/publish;
- CSP critical XSS path unresolved;
- DB pool saturation;
- queue job duplicate không safe.

### Performance
Không full rollout nếu:
- critical route JS vượt budget >20% không có phê duyệt;
- p95 API >2x baseline do refactor;
- public edge fallback unexpectedly high;
- browser worker leak process/memory.

## Evidence lưu theo release

```text
docs/release-evidence/<version>/
  bundle-report.json
  web-vitals.md
  load-test.md
  tenant-tests.xml
  ssrf-tests.xml
  security-headers.txt
  api-latency.json
  db-pool.json
  queue-metrics.json
  rollout.md
```


## Revision 2026-09-11 — Acceptance delta

| Control mới | Evidence cần có |
|---|---|
| No browser bearer | localStorage/sessionStorage/IndexedDB/cookie JS scan + DevTools |
| No token JSON | contract tests cho `/api/auth/session`, login, refresh |
| Google nonce correctness | hash/raw unit test + Supabase integration test |
| Google challenge anti-replay | mismatch/expired/replay E2E nếu server-bound mode bật |
| Refresh safe semantics | POST/BFF flow + concurrency test; không state-changing GET |
| Legacy password hardening | Argon2id/versioned hash migration evidence hoặc legacy path disabled |
| Token at-rest hardening | refresh hash/family schema + migration/replay test |
| Provider token isolation | client storage scan |
| Auth route rate policy | Redis-backed/named throttle test |
| UI auth accessibility | keyboard + axe + focus regression |
| Consent consistency | email/Google signup contract test |
| Auth performance | provider/internal/total latency dashboard |
| CORS exact | automated response test by allowed/disallowed origin |
| Trusted proxy boundary | edge/origin firewall + forwarded IP test |

### Không đóng Phase 03 nếu còn đồng thời các điều kiện sau
- refresh cookie đã HttpOnly **nhưng** access token vẫn localStorage/Zustand/JS-cookie;
- Google login đi trực tiếp browser -> Nest;
- session route còn trả token cho JavaScript;
- authenticated CORS vẫn wildcard.
