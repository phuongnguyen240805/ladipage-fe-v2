# Target Architecture & Request Flows

## A. Admin read

```text
Browser
  |
GET /landing-pages
  |
Cloudflare
  |
Next Server Component
  |
backendClient.server.ts
  |
Nest
  |
AuthN -> RBAC -> Tenant
  |
Repository
  |
Postgres
  |
Response DTO
  |
RSC HTML + small client islands
```

Security:
- no backend URL/token in browser;
- tenant query scoped;
- no public cache for user-sensitive result.

Performance:
- server fetch;
- parallel independent reads;
- small ViewModel;
- low hydration.

---

## B. Mutation

```text
Browser
  |
POST same-origin /api/...
  |
Origin/CSRF check
  |
Next schema validation
  |
server backend client
  |
Nest DTO validation
  |
AuthN
  |
AuthZ
  |
Tenant resource check
  |
Idempotency
  |
DB transaction
  |
explicit DTO
```

---

## C. Publish

```text
Browser
  |
POST /publish + Idempotency-Key
  |
Next BFF
  |
Nest
  |
AuthN/RBAC/Tenant
  |
create job + outbox
  |
202 jobId
  |
BullMQ
  |
General Publish Worker
  |
snapshot -> render -> SEO -> R2
  |
KV route pointer
  |
DB publish version
  |
event
  |
SSE/WebSocket -> Browser
```

---

## D. Public landing

```text
Visitor
  |
Cloudflare
  |
Route Worker
  |
KV(host,path)
  |
R2 immutable artifact
  |
CDN
```

Fallback only during migration:
```text
KV/R2 miss -> legacy /p/[slug]
```

---

## E. AI URL scan

```text
Browser
 |
Next BFF
 |
Nest
 |
AuthN/RBAC/Tenant
 |
weighted rate limit
 |
atomic credit reserve
 |
job
 |
Browser Worker
 |
URL parser
 |
DNS resolve
 |
public-IP validation
 |
egress firewall
 |
Puppeteer/Lighthouse
 |
result
 |
commit/refund quota
```

---

## F. Auth

```text
Browser
 |
same-origin sign-in
 |
Next
 |
provider/Nest exchange
 |
HttpOnly Secure session cookie
 |
subsequent request
 |
Next verifies session
 |
Nest internal request
 |
Nest final authorization
```

---

# Target frontend dependency boundaries

```text
Core:
  React/Next
  tiny design primitives

Admin shell:
  sidebar/header only

Landing:
  landing list/detail dependencies

Builder:
  editor/Pixi/DnD

Care:
  realtime/socket

AI:
  AI SEO

Education:
  education

Ads:
  facebook/gads
```

Rule:
**Feature A không import implementation nội bộ của Feature B.**

Shared:
- pure primitives;
- shared contract/client;
- platform auth/session interfaces.

---

# Target backend module boundaries

```text
ApiAppModule
  PlatformModule
  LandingModule
  CommerceModule
  CustomerCareModule
  AdsModule
  AutomationModule
```

`PlatformModule`:
- auth;
- RBAC;
- tenant context;
- logging/tracing;
- DB/Redis abstractions;
- storage;
- queue abstraction;
- idempotency;
- rate limiting.

Không đưa business logic Landing/CRM/Ads/CustomerCare vào platform/nest-core.

Workers:
```text
WorkerAppModule
  PublishWorker
  AutomationWorker
  GeneralAIWorker

BrowserWorkerAppModule
  LighthouseWorker
  PuppeteerScanWorker
```

---

# Dependency direction

```text
UI -> Application contract
Application -> Domain
Domain -> interfaces
Infrastructure -> implementations
```

Không:
```text
Domain -> Next
Domain -> controller
Domain -> raw Supabase browser SDK
```

---

# Deployment target

```text
Cloudflare:
  Next router/multi-workers
  public route worker
  KV
  R2
  WAF/rate

Container platform:
  Nest API replicas
  General worker replicas
  Browser worker replicas

Data:
  PostgreSQL
  PgBouncer when scale requires
  Redis/BullMQ
```

Scale độc lập:
- public edge;
- API;
- queue worker;
- browser worker.
