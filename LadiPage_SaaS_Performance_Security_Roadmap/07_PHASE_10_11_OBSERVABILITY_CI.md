# PHASE 10–11 — Observability, SLOs, CI/CD Gates and Operational Hardening

# Phase 10 — Observability trước khi scale

## 1. Correlation IDs

Tạo một request context xuyên:
```text
Cloudflare
 -> Next
 -> Nest
 -> DB/Redis
 -> BullMQ
 -> Worker
 -> provider
```

Fields:
```text
requestId
traceId
tenantId
userId
route
operation
jobId
pageId
publishVersion
idempotencyKey
```

Không log:
- password;
- bearer/session token;
- Supabase service key;
- provider API key;
- raw credit card;
- full sensitive prompt nếu policy không cho phép.

## 2. OpenTelemetry
Instrument:
- Next server/BFF;
- Nest;
- HTTP clients;
- TypeORM/DB;
- Redis;
- BullMQ producer/consumer;
- external AI/provider calls.

Queue trace:
- inject trace context vào job metadata;
- worker span link/child trace.

## 3. Metrics

### Frontend/Edge
- Web Vitals p75 theo route;
- JS bundle/route budget;
- edge cache hit;
- edge error;
- R2 latency;
- origin fallback rate.

### Next
- route p50/p95/p99;
- server fetch latency;
- BFF error;
- timeout;
- cache hit/miss.

### Nest
- RPS;
- p50/p95/p99;
- 4xx/5xx;
- 401/403/429;
- timeout;
- idempotency replay/conflict.

### DB
- connections;
- pool active/idle/wait;
- query latency;
- slow query;
- lock/deadlock;
- transaction duration.

### Redis
- command latency;
- memory;
- evictions;
- connection count.

### BullMQ
- queue depth;
- oldest waiting age;
- active;
- completed/failed;
- retry;
- job duration;
- DLQ/final failure.

### AI
- tokens;
- estimated/actual cost;
- latency;
- provider error;
- quota denied;
- model usage per tenant.

## 4. SLO initial

Ví dụ, tune sau baseline:
```text
Admin availability: 99.9%
Sync API p95: < 500 ms nominal
Auth p95: < 500 ms
Publish enqueue p95: < 500 ms
Publish completion p95: workload-defined
Public landing edge p95 TTFB: target region-specific
Public edge success: 99.95%+
```

Không chọn SLO không đo được.

## 5. Alerts
Alert theo symptom:
- 5xx burn rate;
- p95/p99 latency;
- queue lag;
- DB pool wait;
- public origin fallback spike;
- quota/AI spend anomaly.

Không alert mọi CPU > 70% ngay lập tức nếu không ảnh hưởng service.

---

# Phase 11 — CI/CD gates

## 6. Frontend CI

Pipeline:
```text
install locked dependencies
 -> typecheck
 -> lint
 -> unit tests
 -> build
 -> perf:check
 -> OpenAPI client freshness
 -> OpenNext route validation
 -> smoke routes
 -> security headers/CSP checks
```

### Bundle gate
Fail nếu:
- route exceeds budget;
- heavy forbidden package enters critical route;
- route JS grows beyond tolerated delta.

## 7. OpenNext/Cloudflare
Custom deploy script dùng internal OpenNext implementation => exact-pin compatible OpenNext version.

Không dùng caret cho dependency mà deployment script phụ thuộc internal modules.

CI:
- `build:cf`;
- dry-run deploy plan;
- verify expected workers/routes;
- no route overlap/unowned route;
- router deploy last.

## 8. Backend CI

```text
typecheck/build affected
unit
integration
tenant isolation tests
OpenAPI generation
migration validation
queue/idempotency tests
security tests
```

Nx:
- thêm tags `scope:*`, `type:*`;
- enforce module boundaries;
- AppModule chỉ composition, không trở thành dependency dumping ground.

## 9. TypeScript strict migration
Backend hiện chưa strict toàn bộ.

Không bật strict global rồi sửa hàng nghìn lỗi.

Target:
- new libs strict;
- new module strict;
- domain-by-domain migration;
- CI không cho module đã strict regress.

## 10. Dependency/security
- lockfile;
- dependency audit;
- container scan;
- secret scan;
- SBOM nếu production/compliance cần;
- exact versions cho deployment-sensitive libs;
- scheduled dependency upgrades, không auto-major production.

## 11. Database migration gate
Mỗi migration:
- forward;
- rollback hoặc documented irreversible reason;
- index creation impact;
- lock expectation;
- backfill strategy.

Large table:
```text
expand -> backfill -> dual-read/write if needed -> contract
```
không rename/drop trong một deploy nếu app cũ còn running.

## 12. Deployment
Blue/green hoặc rolling:
1. backward-compatible DB;
2. deploy backend;
3. deploy workers;
4. deploy Next;
5. feature flag enable;
6. monitor;
7. remove compatibility code ở release sau.

## 13. Secrets
- Cloudflare secrets/env, không `NEXT_PUBLIC_`;
- backend secret manager/runtime env;
- rotate provider keys;
- least privilege per worker;
- dev/test/prod tách credential.

## 14. Acceptance criteria

Phase 10:
- trace một publish từ Next tới worker.
- dashboard có p95/p99 + queue + DB pool.
- alert chạy thử thành công.
- logs redaction test.

Phase 11:
- PR không pass bundle/security/tenant tests thì không merge.
- deployment route config validated.
- OpenNext exact pinned.
- migrations có gate.
- worker/API images và secrets tách đúng role.
- rollback được thực hành staging.

## Mục tiêu
Scale dựa trên số liệu và ngăn regression kiến trúc quay trở lại sau vài tháng phát triển.
