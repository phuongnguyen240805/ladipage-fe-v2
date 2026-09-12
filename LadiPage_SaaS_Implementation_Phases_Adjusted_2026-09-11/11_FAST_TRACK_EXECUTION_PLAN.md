# Fast-Track Execution Plan

Mục đích: rút ngắn thời gian nhưng không trộn các migration có blast radius lớn vào một deploy.

## Track A — Frontend/BFF
```text
Phase 00 baseline
  -> Phase 01 layouts/RSC
  -> Phase 02 BFF
  -> Phase 03 session/network
  -> Phase 05 bundle
```

## Track B — Backend/Data/Workers
```text
Phase 00 baseline
  -> Phase 04 tenant/contracts
  -> Phase 07 async publish
  -> Phase 09 AI security/quota
```

## Track C — Edge/Platform
```text
Phase 00 baseline
  -> Phase 06 cache/DB metrics
  -> Phase 08 KV/R2
  -> Phase 10 observability
  -> Phase 11 CI
```

## Merge gates

### Gate 1
Trước BFF auth cutover:
- tenant authorization tests baseline;
- Nest server client skeleton;
- session rollback path.

### Gate 2
Trước publish async:
- idempotency;
- worker runtime stable;
- SSE/progress contract;
- DB job model.

### Gate 3
Trước KV/R2:
- versioned artifact;
- publish job stable;
- route ownership;
- fallback `/p/[slug]`.

### Gate 4
Trước AI wider rollout:
- SSRF;
- egress isolation;
- atomic quota;
- weighted rate limit.

## Lịch đề xuất 1 kỹ sư

### Tuần 1
- P00
- P01
- skeleton P02

### Tuần 2
- P02
- P03
- P04 inventory + critical tables

### Tuần 3
- P04 complete
- P05
- P06 metrics/pool/cache

### Tuần 4
- P07 async publish

### Tuần 5
- P08 KV/R2
- P09 AI security

### Tuần 6
- P10/P11
- P12 validation/go-live

Nếu codebase feature behavior phức tạp hoặc thiếu tests, giữ buffer 1–2 tuần.

## Lịch 2 kỹ sư

Engineer A:
- P01 → P02 → P03 → P05

Engineer B:
- P04 → P07 → P09

Cùng:
- P00
- P06
- P08 integration
- P10/P11/P12

Target 15–20 ngày làm việc, tùy test coverage.

## PR sizing
PR lý tưởng:
- 5–20 files cùng một boundary;
- không đổi business behavior + architecture đồng thời nếu tránh được;
- commit đủ nhỏ để revert.

Ví dụ:
1. extract AdminProviders.
2. move CustomerCare boundary.
3. add backendClient.server.
4. migrate landing read.
5. migrate landing mutations.
6. session cookie cutover.
7. remove browser token for migrated feature.

## Rules để không kéo dài kế hoạch
- Không microservice hóa.
- UI/UX redesign mới đã merge: đóng visual/a11y baseline tại snapshot hiện tại và không tiếp tục redesign trong BFF/session hardening; chỉ sửa regression/behavior inconsistency.
- Không đổi database engine.
- Không thay React/Next version giữa phase.
- Không custom splitChunks trước khi source boundaries sạch.
- Không áp CSP enforce ngay ngày đầu.
- Không chuyển tất cả API cùng một PR.
- Không tối ưu query chưa có trace/EXPLAIN evidence.
- Không triển khai CRDT/Yjs nếu chưa có realtime collaborative editing requirement.


## Revision 2026-09-11 — ưu tiên lại Track A

Do code auth đã ở trạng thái migration nửa chừng, Track A đổi thứ tự:

```text
A0 capture new UI/perf/auth baseline
 -> A1 exact CORS hotfix + auth tests
 -> A2 same-origin Google/email login BFF
 -> A3 remove JS/persistent Nest token
 -> A4 refresh/logout cutover
 -> A5 root/admin provider extraction
 -> A6 auth/public bundle + a11y gate
 -> A7 remove direct Nest compatibility path
```

Không để trạng thái “refresh HttpOnly nhưng access token vẫn JS-readable” kéo dài qua nhiều release.
