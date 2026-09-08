# PHASE 07–08 — Async Workloads, Reliable Publish Pipeline, KV/R2 Edge Delivery

# Phase 07 — Fast path vs async path

## 1. Phân loại API

### Fast path
Target hoàn thành trong request:
- CRUD nhỏ;
- metadata;
- settings;
- permission lookup;
- list/detail;
- lightweight validation.

### Async path
Chuyển queue:
- AI generation;
- landing publish;
- Lighthouse/Puppeteer;
- bulk import/export;
- large SEO audit;
- automation;
- email/batch;
- long report.

Không giải quyết job 1–5 phút bằng tăng HTTP timeout.

## 2. Backend runtime separation

Backend đã có `worker.main.ts` và `WorkerAppModule`.

Target strict:
```text
main.ts
 -> ApiAppModule
 -> KHÔNG import worker processors

worker.main.ts
 -> WorkerAppModule
 -> queue processors
```

Hiện API AppModule có conditional worker imports; loại hành vi “HTTP API cũng chạy worker” khỏi production architecture.

## 3. Browser-heavy worker riêng

Target images/process:
```text
production-api
  Node only
  no Chromium

production-worker
  Node only
  publish/automation/general AI

production-browser-worker
  Node + Chromium
  Lighthouse/Puppeteer/URL scan
```

Lợi ích:
- API image nhỏ;
- API không chịu Chromium memory spikes;
- scale browser workload riêng;
- security blast radius nhỏ.

---

# Publish pipeline

## 4. API contract

```http
POST /api/pages/:id/publish
Idempotency-Key: ...
```

Nest:
1. authenticate;
2. authorize;
3. verify tenant/page;
4. reserve/validate dependencies;
5. create `publish_job`;
6. enqueue BullMQ;
7. trả `202 Accepted`.

Response:
```json
{
  "jobId": "pub_...",
  "status": "queued"
}
```

## 5. Publish state machine

```text
QUEUED
  |
  v
VALIDATING
  |
  v
RENDERING
  |
  v
SEO_TRANSFORM
  |
  v
WRITING_ARTIFACT
  |
  v
UPDATING_ROUTE
  |
  v
PUBLISHED
```

Failure:
```text
FAILED_RETRYABLE
FAILED_FINAL
CANCELLED
```

## 6. Idempotency

Key scope:
```text
tenantId
+ userId
+ operation
+ pageId
+ Idempotency-Key
+ request body hash
```

Nếu cùng key + khác body => reject.

Nếu completed => replay result.
Nếu processing => return same job or conflict policy.

DB unique constraint vẫn cần.

## 7. Retry

Mỗi publish step phải biết:
- retryable hay không;
- max attempts;
- backoff;
- side effect idempotency.

Ví dụ:
- temporary R2 failure: retry.
- invalid page schema: no retry.
- 429 provider: retry respecting `Retry-After`.
- DNS error external integration: bounded retry.

Không retry toàn pipeline từ đầu nếu bước trước đã side-effect mà không idempotent.

## 8. Versioning

Immutable publish version:
```text
page_id
publish_version
draft_revision
artifact_key
artifact_hash
published_at
published_by
status
```

Artifact:
```text
landing/{pageId}/{version}/index.html
```

Rollback = đổi active route pointer về version trước, không render lại.

## 9. Outbox/event reliability

Nếu DB commit và queue publish không atomic:
- dùng transactional outbox hoặc reconciliation worker.

Ví dụ:
```text
DB transaction
  -> publish_job
  -> outbox_event
COMMIT

dispatcher
  -> BullMQ
  -> mark dispatched
```

Tránh “DB says queued nhưng queue không có job”.

## 10. Progress
Frontend:
```text
SSE/WebSocket
  publish.job.updated
```

Không polling 1 giây nếu đã có SSE/Socket infra.

---

# Phase 08 — Public delivery KV + R2

## 11. Current target transition

Hiện public `/p/[slug]` là fallback/origin.

Target:
```text
Visitor
  |
Cloudflare Worker
  |
KV lookup: host + path
  |
R2 artifact key
  |
R2 HTML
  |
CDN cache
```

Không:
```text
Visitor -> Next -> Supabase -> HTML
```
trong cache-miss hot path cuối cùng.

## 12. KV route model

Key:
```text
route:{hostname}:{normalizedPath}
```

Value:
```json
{
  "artifactKey": "landing/123/42/index.html",
  "pageId": "123",
  "version": 42,
  "etag": "...",
  "status": "published"
}
```

Normalize:
- lower-case hostname;
- canonical slash policy;
- reject invalid host/path;
- custom domain ownership đã verify ở publish/config layer.

## 13. R2
Immutable:
```text
landing/{pageId}/{version}/index.html
landing/{pageId}/{version}/assets/...
```

Cache:
```text
immutable artifact -> long TTL
route pointer -> short/controlled cache
```

## 14. Rollout

Stage 1:
```text
KV/R2 read miss -> fallback /p/[slug]
```

Stage 2:
- publish dual-write DB + R2/KV;
- compare HTML hash/result.

Stage 3:
- 1% edge traffic;
- 10%;
- 50%;
- 100%.

Stage 4:
- `/p/[slug]` giữ emergency fallback/admin preview, không hot path.

## 15. Cache invalidation
Không overwrite immutable HTML.
Publish mới:
1. upload new artifact;
2. verify checksum;
3. atomically update KV pointer;
4. optional purge route cache;
5. old artifact giữ cho rollback/retention.

## 16. Failure modes

### R2 upload fail
Không đổi active KV.

### KV update fail
Artifact tồn tại nhưng chưa active; retry update.

### DB update fail sau KV
Cần ordering/outbox/saga để reconciliation.

### Bad artifact
Rollback KV về previous version.

## Acceptance criteria

Phase 07:
- publish HTTP không chạy rendering dài;
- API trả 202 nhanh;
- worker processing idempotent;
- job progress observable;
- API process không chạy worker processors production;
- browser worker tách runtime.

Phase 08:
- edge cache-hit public request không gọi Next/Nest/DB;
- R2 artifacts immutable/versioned;
- rollback một publish bằng pointer switch;
- dual-read/fallback trước 100% cutover;
- có metrics cache hit/origin fallback/error.

## Mục tiêu
Đây là phase tăng scalability mạnh nhất cho public traffic và reliability mạnh nhất cho publish.
