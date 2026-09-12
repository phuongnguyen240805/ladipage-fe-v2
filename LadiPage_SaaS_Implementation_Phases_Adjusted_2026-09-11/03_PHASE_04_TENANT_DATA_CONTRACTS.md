# PHASE 04 — Tenant Isolation, Data Ownership, DTO and API Contracts

Phase này không nên làm song song với thay đổi schema lớn khác. Đây là phase bảo mật dữ liệu quan trọng nhất của SaaS.

## 1. Tenant isolation từ database

### Nguyên tắc
Mọi resource tenant-owned phải có `tenant_id NOT NULL` hoặc ownership key tương đương.

Không:
```sql
SELECT * FROM landing_pages WHERE id = :id;
```

Phải:
```sql
SELECT *
FROM landing_pages
WHERE tenant_id = :tenantId
  AND id = :id;
```

### Index
Cho query phổ biến:
```sql
CREATE INDEX ...
ON landing_pages(tenant_id, id);
```

List:
```sql
ON landing_pages(tenant_id, created_at DESC, id DESC);
```

### Cross-tenant foreign key
Các aggregate quan trọng phải chống reference tenant chéo.

Ví dụ logical requirement:
```text
Order(tenant A) -> Customer(tenant A)
```
không chỉ validate bằng controller.

Có thể triển khai:
- composite unique `(tenant_id, id)`;
- composite FK `(tenant_id, customer_id)`;
- DB trigger chỉ khi composite FK không khả thi;
- domain/repository invariant.

## 2. Tenant context không lấy mù quáng từ client

```text
Session
  -> verified user
  -> membership
  -> active tenant
  -> server tenant context
```

Không tin:
```text
X-Tenant-Id: arbitrary value from browser
```

Nếu user chuyển team:
- browser gửi selected workspace ID như intent;
- server verify membership;
- server tạo effective tenant context.

## 3. Repository/query policy

Không để developer quên tenant filter.

Ưu tiên:
```text
TenantAwareRepository
  findById(tenantId, id)
  list(tenantId, cursor)
  update(tenantId, id, ...)
```

Hoặc scoped query builder.

Không expose raw global repository trong domain service nếu có thể.

## 4. PostgreSQL RLS

Nếu production dùng PostgreSQL/Supabase và model phù hợp, dùng RLS cho bảng rủi ro cao như:
- landing pages;
- domains;
- leads/customer data;
- billing/customer identifiers;
- tenant settings;
- AI projects/history nếu chứa dữ liệu tenant.

RLS là defense-in-depth, không thay RBAC.

Nếu backend service role bypass RLS, phải có repository tenant enforcement + tests bắt buộc.

## 5. Tenant automated tests

Bắt buộc tạo fixtures:
```text
Tenant A: userA, pageA, customerA
Tenant B: userB, pageB, customerB
```

Test:
- read B bằng token A -> 404/403.
- update B bằng A -> fail.
- delete B bằng A -> fail.
- list A không chứa B.
- search A không chứa B.
- export/import không leak.
- job worker nhận tenant context đúng.
- cache key không collide.
- websocket/SSE room không cross tenant.
- object storage path không cross tenant.

## 6. Data ownership

Target:
```text
Browser
 -> Next BFF
 -> Nest domain/application layer
 -> Postgres/Supabase
```

Không duy trì lâu dài:
```text
Builder browser -> Supabase direct write landing_pages
Next route -> Supabase business logic
Nest -> same table business logic
```

### Migration
1. Inventory tất cả write paths tới `landing_pages`.
2. Chọn Nest làm source-of-truth cho write.
3. Next BFF gọi Nest.
4. Browser direct Supabase write bị disable.
5. Sau ổn định mới consolidate read paths.

Realtime có thể giữ Supabase realtime nếu có lý do, nhưng authorization và data ownership phải rõ.

## 7. DTO — không trả Entity thẳng

Layer:
```text
DB Entity
   |
Repository
   |
Domain/Application object
   |
Response DTO / Presenter
   |
Controller
```

DTO chỉ chứa field contract.

Không để thêm field DB mới tự động trở thành API output.

### Sensitive fields cần review
- password hash;
- provider token;
- service role;
- Stripe/customer internal IDs;
- internal flags;
- deleted timestamps nếu không cần;
- secret integration config;
- raw prompt/provider response có sensitive data.

## 8. Input validation boundaries

Backend hiện có ValidationPipe tốt:
- whitelist;
- forbid non-whitelisted;
- transform;
- 422;
- không expose target.

Giữ nguyên.

Bổ sung:
```text
Browser input
 -> Next Zod/schema
 -> Nest DTO/class-validator
 -> domain invariant
 -> DB constraint
```

Mỗi tầng có mục đích riêng.

## 9. API contract một nguồn

Hiện FE và BE có package api-types và đã có nguy cơ drift.

Target:
```text
Nest DTO + Swagger decorators
        |
        v
OpenAPI JSON
        |
        v
codegen
  +-------------------+
  |                   |
  v                   v
@liora/api-client   @liora/contracts
```

Tools phù hợp:
- Orval;
- Kubb;
- openapi-typescript.

### CI
- generate;
- `git diff --exit-code` hoặc compare generated artifact;
- build fail nếu stale.

Không copy types thủ công.

## 10. Cache key tenant-safe

Mọi tenant cache:
```text
tenant:{tenantId}:settings:v2
tenant:{tenantId}:page:{pageId}
```

User-specific:
```text
tenant:{tenantId}:user:{userId}:...
```

Không:
```text
page:{id}
```
nếu ID không bảo đảm global/ownership boundary.

## 11. Object storage
Path:
```text
tenants/{tenantId}/...
```
hoặc immutable artifact key có mapping tenant-controlled.

Presigned URLs:
- TTL ngắn;
- server verify tenant;
- không cho arbitrary key;
- content type/size restrictions.

## 12. Definition of Done

- Có bảng inventory resource → tenant ownership.
- 100% critical tenant tables có ownership field/index.
- Query mutation critical có tenant scope.
- Cross-tenant integration test green.
- Cache tenant-keyed.
- Worker jobs carry tenant ID verified.
- DTO output explicit cho critical APIs.
- OpenAPI-generated contract chạy CI.
- Browser direct write vào critical landing tables đã bị loại hoặc documented exception.
- Không có data migration không rollback plan.

## Mục tiêu
Sau phase này, bug ở UI hoặc route handler không đủ để tạo cross-tenant breach; dữ liệu được bảo vệ bằng nhiều lớp.
