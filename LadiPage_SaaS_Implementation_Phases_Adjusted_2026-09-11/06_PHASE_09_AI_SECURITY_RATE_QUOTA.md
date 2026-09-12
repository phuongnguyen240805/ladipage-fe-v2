# PHASE 09 — AI SaaS Security: SSRF, Rate Limiting, Atomic Quota, Cost Control

AI/SEO/Lighthouse/Puppeteer tạo attack surface lớn hơn CRUD SaaS. Phase này phải hoàn thành trước khi mở workload URL-scan/AI lớn cho public/tenant rộng.

## 1. SSRF threat model

Input nguy hiểm:
```text
http://127.0.0.1
http://localhost
http://10.x.x.x
http://172.16-31.x.x
http://192.168.x.x
http://169.254.169.254
http://[::1]
http://[fc00::]
```

Attacker cũng có thể dùng:
- DNS rebinding;
- redirect từ public → private;
- IPv4-in-IPv6;
- decimal/hex IP representations;
- userinfo/URL parser confusion;
- alternative schemes;
- hostname resolve nhiều IP.

## 2. URL fetch policy

Pipeline:
```text
raw user URL
  |
parse canonical URL
  |
allow scheme http/https only
  |
validate port policy
  |
DNS resolve
  |
validate ALL resolved IPs are public/allowed
  |
connect
  |
for every redirect:
  parse -> resolve -> validate again
```

Block:
- loopback;
- private RFC1918;
- link-local;
- multicast/reserved as appropriate;
- cloud metadata IP/hostnames;
- internal service domains;
- Docker/Kubernetes service DNS.

## 3. Browser worker network isolation

Không chỉ validate trong app.

Infrastructure:
```text
Browser Worker
  |
  +--> internet 80/443 allowed
  X--> private VPC/service subnet
  X--> DB
  X--> Redis except queue endpoint if required
  X--> metadata
  X--> admin API
```

Worker credential tối thiểu:
- queue;
- R2 temp/result storage;
- provider keys cần thiết.

Không cấp Supabase service role/DB credentials nếu job không cần.

## 4. Puppeteer
- navigation timeout bounded;
- response/download size limits;
- block unnecessary resource types nếu scan không cần;
- disable file://;
- no arbitrary browser extensions;
- sandbox/container isolation phù hợp runtime;
- per-job fresh context;
- clear cookies/storage;
- terminate child/browser process on timeout.

## 5. AI prompt/input boundary
Validate:
- size;
- MIME;
- URL;
- model/provider;
- tool permissions;
- tenant policy.

Không cho model tự gọi arbitrary internal tools dựa trên prompt.

Tool calling:
```text
LLM intent
 -> policy engine
 -> typed tool schema
 -> authorization
 -> rate/quota
 -> execution
```

## 6. Rate limiting nhiều tầng

### Edge
Cloudflare:
- IP abuse;
- bot/WAF;
- suspicious paths;
- gross request rate.

### Next
- session/mutation abuse;
- CSRF/origin enforcement.

### Nest
Global + endpoint-specific:
```text
per IP
per user
per tenant
per API key
```

### Cost-weighted
Không coi mọi request = 1.

Ví dụ:
```text
GET profile          1
small AI generation 10
SEO page audit       50
Lighthouse scan     100
bulk audit          500+
```

## 7. Quota atomic

Sai:
```text
read balance
if enough:
  use AI
  write balance
```

Đúng:
```sql
UPDATE credit_wallet
SET balance = balance - :cost
WHERE tenant_id = :tenant
  AND balance >= :cost
RETURNING balance;
```

Hoặc transaction/ledger phù hợp DB.

## 8. Reserve/commit/refund

Async AI:
```text
request
  |
atomic reserve
  |
create job
  |
worker
  +--> success -> commit/finalize
  +--> failed  -> refund/release
```

Reservation fields:
```text
reservation_id
tenant_id
user_id
job_id
idempotency_key
amount
status
expires_at
```

Có reconciliation cho reservation stuck.

## 9. Monetary/credit ledger

Ưu tiên append-only ledger:
```text
credit_ledger
  debit
  credit
  refund
  adjustment
```

Wallet balance có thể materialized nhưng ledger cho audit.

## 10. Concurrency tests

100 concurrent requests cùng tenant:
- không âm balance;
- total committed <= initial + credits;
- duplicate idempotency không double debit;
- failed jobs refund đúng 1 lần;
- worker retry không double charge.

## 11. Provider controls
- provider timeout;
- max tokens;
- max output;
- allowlisted models;
- monthly tenant budget;
- per-day anomaly detection;
- circuit breaker khi provider error/cost spike;
- redact secrets/PII khỏi logs.

## 12. Upload/file security
AI input file:
- content type sniff;
- extension không đủ;
- max bytes/pages;
- decompression bomb guard;
- temporary storage lifecycle;
- malware scanning nếu threat model cần;
- no execution.

## Acceptance criteria

- SSRF unit/integration suite block private/link-local/metadata.
- Redirect SSRF block.
- DNS rebinding-safe connection strategy/documented resolver.
- Browser worker không reach private services.
- Weighted rate limit theo tenant/user.
- Quota debit atomic.
- Idempotency + quota concurrency tests green.
- Timeout/token limit tất cả AI provider calls.
- Audit log có tenant/user/job/cost nhưng không leak secret.
- Có emergency kill switch cho scan/model/provider.

## Mục tiêu
Một user độc hại không thể biến AI/browser worker thành proxy vào mạng nội bộ, và request concurrent không thể vượt quota/credit.
