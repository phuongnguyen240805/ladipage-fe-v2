# Checklist triển khai: Free Subdomain (Plan A) + Customer Domain (Plan B)

> Cập nhật: 2026-07-17  
> Runtime: `ladipage-fe-v2` · Edge: Cloudflare Worker · Origin: Next `/p/{slug}`

---

## 0. Hardcode / naming — đã xử lý

| Không hardcode | Nguồn đúng |
|----------------|------------|
| Tên landing page | `landing_pages.name` (user nhập) |
| Slug | `landing_pages.slug` (từ name hoặc user) |
| Link xem / share | `resolveLandingPublicViewUrl(slug)` / `publicUrl` publish |
| Host free site | `{slug}.{FREE_SITE_DOMAIN}` động |

**Còn hardcode hợp lệ:** fixture unit test (`cafe-ha-noi`, …), template seed marketing, comment docs.  
**Không** dùng slug/tên demo trong UI hoặc env production.

Fallback tên trống: `"Untitled Page"` (i18n-friendly placeholder, không phải page cụ thể).

---

## 1. Plan A — Free subdomain local (đã có code)

### 1.1 Env FE (`ladipage-fe-v2/.env`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
LANDING_ORIGIN_URL=http://localhost:3000

LANDING_FREE_SUBDOMAIN_ENABLED=true
NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED=true
FREE_SITE_DOMAIN=liora.app
NEXT_PUBLIC_FREE_SITE_DOMAIN=liora.app
FREE_SUBDOMAIN_DELIVERY=proxy

LANDING_CUSTOM_DOMAIN_EDGE_ENABLED=false
```

- [ ] Restart `pnpm dev` sau khi đổi env  
- [ ] Publish page (slug **của page**, không gõ tay `cafe-…` trừ khi đúng slug DB)  
- [ ] Response: `deliveryMode=subdomain`, `publicUrl=http://{slug}.liora.app:3000`  
- [ ] Menu **Xem xuất bản** / badge **Live** mở `publicUrl`  
- [ ] Hosts: `127.0.0.1 {slug}.liora.app`  
- [ ] Browser: `http://{slug}.liora.app:3000` = HTML landing  
- [ ] `http://localhost:3000` vẫn là app mẹ  

### 1.2 UI “Xem xuất bản” luôn `publicUrl`

| Điểm | Hành vi mong đợi | Done |
|------|------------------|------|
| `GET /api/landing-pages` | Field `public_url` / `published_url` (absolute) | ☐ |
| List → **Xem xuất bản** / **Live** | `window.open(publicUrl)` | ☐ |
| Copy link editor | `resolveLandingPublicViewUrl(slug)` | ☐ |
| **Xem và xuất bản** (publish) | Mở `result.publicUrl` | ☐ |
| Không còn primary link | `localhost:3000/p/{slug}` khi Plan A on | ☐ |

**Fallback khi Plan A off:** `publicUrl` = `{APP_URL}/p/{slug}`.

---

## 2. Plan A — Worker + DNS `*.liora.app` trên internet

### 2.1 Điều kiện trước

- [ ] Sở hữu zone DNS (vd `liora.app`) trên Cloudflare  
- [ ] Origin public HTTPS app (vd `https://app.liora.app` hoặc staging)  
- [ ] Publish L1 đã ghi `published_html` + status published  

### 2.2 Env staging/prod FE

```env
NEXT_PUBLIC_APP_URL=https://app.liora.app
LANDING_ORIGIN_URL=https://app.liora.app
LANDING_FREE_SUBDOMAIN_ENABLED=true
NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED=true
FREE_SITE_DOMAIN=liora.app
NEXT_PUBLIC_FREE_SITE_DOMAIN=liora.app
FREE_SUBDOMAIN_DELIVERY=proxy
```

- [ ] Deploy FE/origin với env trên  
- [ ] Publish smoke page → `publicUrl=https://{slug}.liora.app`  

### 2.3 Worker deployable

Tham chiếu: `cloudflare/landing-edge-worker.stub.ts`

- [ ] Tạo Worker project (wrangler) từ stub → `landing-edge-worker`  
- [ ] Env Worker:  
  - `FREE_SITE_DOMAIN=liora.app`  
  - `LANDING_ORIGIN_BASE_URL=https://app.liora.app`  
- [ ] Handler Plan A:

```text
Host {slug}.liora.app  (không reserved)
  → fetch LANDING_ORIGIN_BASE_URL + /p/{slug}
  → return response (forward status/body)
```

- [ ] Unit test Host→slug (đã có stub tests)  
- [ ] `wrangler deploy` staging  

### 2.4 DNS + SSL

- [ ] Cloudflare zone `liora.app`  
- [ ] Route: `*.liora.app/*` → Worker (hoặc `* .liora.app` worker route)  
- [ ] **Không** trỏ `app.liora.app` / apex vào free-site worker nếu app mẹ khác host  
- [ ] SSL: Universal SSL / wildcard cert active  
- [ ] (Tuỳ chọn) CNAME `fallback.liora.app` cho Plan B sau  

### 2.5 E2E Plan A staging

| # | Bước | Kỳ vọng | ☐ |
|---|------|---------|---|
| 1 | Publish slug `demo-shop` | `publicUrl=https://demo-shop.liora.app` | |
| 2 | GET `https://demo-shop.liora.app` | 200, HTML = published | |
| 3 | GET `https://app.liora.app/p/demo-shop` | 200, cùng nội dung | |
| 4 | Unpublish | free host 404 hoặc empty draft | |
| 5 | Reserved host `www.liora.app` | không serve landing user | |
| 6 | UI **Xem xuất bản** | mở `https://{slug}.liora.app` | |

---

## 3. Plan B — Customer domain

### 3.1 Env

```env
LANDING_CUSTOM_DOMAIN_EDGE_ENABLED=true
CUSTOM_DOMAIN_CNAME_TARGET=fallback.liora.app
CLOUDFLARE_SAAS_FALLBACK_ORIGIN=fallback.liora.app
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ZONE_ID=...
CLOUDFLARE_API_TOKEN=...   # Custom Hostnames + Workers KV
CLOUDFLARE_LANDING_ROUTES_KV_ID=...
```

- [ ] Migrations: `landing_domains`, `landing_domain_routes`, CF columns  
- [ ] Token quyền Custom Hostnames + KV  

### 3.2 API (đã có BFF)

| Endpoint | Việc | ☐ |
|----------|------|---|
| `GET/POST /api/landing-pages/domains` | list / create PENDING + CF hostname | |
| `POST .../domains/:id/refresh` | poll verify/SSL | |
| `DELETE .../domains/:id` | CF delete + KV purge | |
| `GET/POST/DELETE .../routes` | map page + path | |
| Publish hook | `syncRoute` all routes → KV | |

### 3.3 DNS user

```text
CNAME  www.customer.com  →  fallback.liora.app
```

- [ ] UI hiện `cname_target` + status PENDING/VERIFIED  
- [ ] Refresh → VERIFIED + SSL ACTIVE  

### 3.4 Worker nhánh custom Host

```text
key = hostname + path   (buildEdgeKvKey)
config = KV.get(key)
→ fetch config.originBaseUrl + /p/ + config.originSlug
```

- [ ] Deploy cùng Worker Plan A (if free Host else KV custom)  
- [ ] Custom hostname traffic → Worker (CF for SaaS)  

### 3.5 UI Domains (partial → hoàn thiện)

| UI | Status code / target |
|----|----------------------|
| List domains | Có `DomainsConfig` — nối status CF, SSL badge | ☐ |
| Add domain | Modal → API PENDING | ☐ |
| DNS instructions | Hiện CNAME target | ☐ |
| Refresh / Delete | Gọi API | ☐ |
| Map page + path | Routes CRUD UI | ☐ |
| Publish success | Hiện `customPublicUrl` | ☐ |

### 3.6 E2E Plan B

| # | Bước | Kỳ vọng | ☐ |
|---|------|---------|---|
| 1 | Add `www.shop-test.example` | PENDING + cname | |
| 2 | CNAME → fallback | DNS ok | |
| 3 | Refresh | VERIFIED / SSL ACTIVE | |
| 4 | Map route page `/` | route row | |
| 5 | Publish page | `edge_status=synced`, `deliveryMode=custom-domain` | |
| 6 | GET custom URL | 200 landing | |
| 7 | Unmap / delete | 404 + KV/CF clean | |
| 8 | Free plan | quota block add domain | |

### 3.7 Priority URL (chung A+B)

```text
customPublicUrl  >  subdomainUrl  >  platformUrl (/p/slug)
```

- [ ] `pickPublicUrl` / `publicUrl` publish đúng thứ tự  
- [ ] UI luôn mở `publicUrl`  

---

## 4. Thứ tự ship khuyến nghị

```text
1) Local Plan A + UI publicUrl          ← code sẵn / checklist §1
2) Staging Worker + DNS *.FREE_SITE     ← §2
3) Staging Plan B CF SaaS + UI domains  ← §3
4) Prod flags + monitoring
```

---

## 5. Smoke commands

```bash
# Publish (auth cookie/token)
curl -sS -X POST "$APP/api/landing-pages/$PAGE_ID/publish" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'

# Expect publicUrl host = {slug}.liora.app when Plan A on

# Free subdomain edge
curl -sI "https://{slug}.liora.app" | head -5

# Platform origin
curl -sI "https://app.liora.app/p/{slug}" | head -5
```

---

## 6. Troubleshooting

| Triệu chứng | Check |
|-------------|--------|
| UI vẫn `/p/slug` | `NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED` + restart; GET list có `public_url`? |
| `subdomainUrl` null | Flag, `FREE_SITE_DOMAIN`, slug reserved? |
| Host free 522/SSL | DNS Worker route, cert wildcard |
| Host free 404 HTML | Origin `/p/slug` published? Worker origin env? |
| Custom không verify | CNAME target, CF hostname API, refresh |
| KV pending | Token + `CLOUDFLARE_LANDING_ROUTES_KV_ID` |

---

## 7. Definition of Done tổng

- [ ] Không hardcode tên/slug page demo trong product path  
- [ ] **Xem xuất bản** / Live / copy / post-publish → `publicUrl`  
- [ ] Staging `https://{slug}.liora.app` 200  
- [ ] Staging custom domain full lifecycle 200  
- [ ] Unpublish / delete domain clean  
- [ ] Runbook ops + env.example đồng bộ  
