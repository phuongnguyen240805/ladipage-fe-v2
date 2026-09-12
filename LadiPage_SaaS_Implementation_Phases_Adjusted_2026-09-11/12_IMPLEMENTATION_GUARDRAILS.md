# Implementation Guardrails

## 1. File scope
Trước mỗi phase tạo danh sách:
```text
MUST CHANGE
MAY CHANGE
DO NOT TOUCH
```

Nếu phát hiện bug ngoài scope:
- ghi issue;
- không “tiện tay” sửa trong PR hardening.

## 2. Compatibility
Mọi migration cross-repo:
```text
backend backward compatible first
 -> frontend switch
 -> observe
 -> remove old contract later
```

## 3. Feature flags
Dùng cho:
- BFF cutover;
- HttpOnly session cutover;
- async publish;
- KV/R2 read;
- AI browser worker;
- new quota.

Flag phải có:
- owner;
- expiry/removal date;
- dashboard;
- safe default.

## 4. Data migration
- backup;
- reversible where possible;
- online-safe index;
- batched backfill;
- no long lock without maintenance plan.

## 5. Security default
- deny by default;
- explicit allowlist;
- least privilege;
- no secrets in client;
- no trust of user-provided role/tenant headers.

## 6. Performance default
- no client component unless needed;
- no feature-wide preloads;
- no large RSC payload;
- no unbounded Promise.all;
- no unbounded DB pool;
- no blind retry.

## 7. Reliability default
- important mutation: idempotency;
- async side effect: state machine;
- external call: timeout;
- queue job: bounded retry;
- state transition: observable.

## 8. Review questions
Mỗi PR phải trả lời:
1. Có tăng client JS không?
2. Có thêm request waterfall không?
3. Có đổi auth/session không?
4. Tenant context lấy từ đâu?
5. Có new cache? key có tenant/user chưa?
6. Mutation có thể duplicate không?
7. External call timeout/retry là gì?
8. Có log secret/PII không?
9. Rollback bằng cách nào?
10. Metric nào chứng minh thành công?


## Revision 2026-09-11 — review questions bổ sung

11. Browser có thể đọc bất kỳ bearer/provider token nào không?
12. Auth response có vô tình serialize token về client không?
13. Google nonce/challenge được tạo, bind, expire và consume ở đâu?
14. Route mới có bypass throttle không? Nếu có, ai approve và edge control thay thế là gì?
15. UI auth mới có cùng Terms/remember-me behavior giữa provider và email không?
16. Provider/client layout thay đổi có làm public/auth route tải thêm JS không?
17. CORS/Origin/trusted-proxy assumption đã được test qua đường production edge chưa?
18. Permission/menu client cache có thể stale sau role change bao lâu?
