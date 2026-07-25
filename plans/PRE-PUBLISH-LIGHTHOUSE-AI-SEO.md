# Plan: BullMQ + Unlighthouse pre-publish (list + editor) + AI-SEO

> **Tóm tắt:** Đánh giá lab (Lighthouse/CWV) trên landing **trước và sau** publish; Unlighthouse qua BullMQ; OpenSEO + Umami theo đúng giai đoạn.  
> **Publish auto AI-SEO:** **vẫn giữ nguyên** (ensure project, link page, inject script Umami/pixel, fail-soft) — pre-publish **bổ sung**, không thay thế.  
> **Không code** — plan kiến trúc & triển khai.  
> **Liên quan:** `ladipage-backend` module `ai-seo`, OpenSEO, Umami, Unlighthouse (`unlighthouse-ci`).

---

## 0. Mục tiêu đạt được

### 0.1 Mục tiêu sản phẩm (outcomes)

| # | Mục tiêu | User / hệ thấy gì khi “xong” |
|---|----------|------------------------------|
| **G1** | **Đánh giá trước publish** | Trong editor + list LP: scan lab, xem điểm Performance/SEO/A11y/BP + CWV **trước** khi lên sóng |
| **G2** | **Lab Lighthouse free, ổn định** | Unlighthouse worker (BullMQ); không phụ thuộc DataForSEO Lighthouse cho use case LP |
| **G3** | **Giữ luồng AI-SEO tự động khi publish** | Publish vẫn auto: SEO project, link page, pixel, Umami — **không bị gỡ** |
| **G4** | **Khép vòng sau publish** | Public URL → lab (re-check) + OpenSEO domain (nếu public) + traffic Umami + tasks |
| **G5** | **Nhiều cửa vào scan** | Editor · List item · AI-SEO · (auto) Publish — không chỉ một nút publish |
| **G6** | **Chỉ số tin cậy cho quyết định** | User biết trang “khỏe” cỡ nào trước publish; so sánh draft vs prod sau publish |
| **G7** | **AI-SEO actionable** | Issues lab (+ HTML rules) → tasks; agent có context lab / domain / traffic đúng giai đoạn |
| **G8** | **Ops an toàn** | Chrome không trong API; queue, quota, cooldown, fail-soft — publish **không fail** vì scan |

### 0.2 Mục tiêu kỹ thuật

| # | Mục tiêu | Tiêu chí |
|---|----------|----------|
| **T1** | Queue Path C | Mọi Unlighthouse scan qua `ai-seo-lighthouse` (BullMQ) |
| **T2** | Preview ephemeral (P1) | Draft → HTML tạm → URL worker reach được → score phản ánh bản đang edit |
| **T3** | Normalize payload gọn | Scores + CWV + top issues; không full LH JSON mặc định |
| **T4** | Multi-source scores | Tách Lab / Domain / Traffic trên API + FE |
| **T5** | Publish pipeline không regression | `preparePublishedHtml` + `afterPublish` (ensure, inject, soft-fail) **giữ hành vi hiện tại** |
| **T6** | Local/preview vs public | Path A OpenSEO chỉ public domain; Path C chạy cả preview/local (nếu reach) |

### 0.3 Không nằm trong mục tiêu (out of scope / không hứa)

- OpenSEO domain overview / keyword / backlink trên `localhost` hay draft không public.
- Umami traffic **trước** khi có script + page public (pre-publish).
- “Tự động SEO 100%” sửa page không người — semi-auto task + AI gợi ý.
- Auto-scan mỗi lần gõ phím trong editor.

### 0.4 Nguyên tắc: pre-publish **bổ sung**, publish auto **giữ**

```
Hiện tại (giữ):
  Publish → AI-SEO ensure project + link + inject Umami/pixel (+ soft domain/SEO)

Bổ sung:
  Editor/List → Unlighthouse pre-publish (lab only)
  Publish     → (thêm) optional/auto Unlighthouse trên publicUrl
              → AI-SEO hybrid đầy đủ hơn khi user/AI scan project
```

**Kết luận G3:** Có — **vẫn giữ luồng tự động AI-SEO khi publish**.  
Pre-publish Unlighthouse **không thay** và **không được làm hỏng** pipeline publish hiện có.

---

## 0b. Mô hình chốt

```
Unlighthouse  →  đo & chấm lab (Lighthouse + CWV)     [BullMQ worker]
OpenSEO       →  SEO market / domain / KW / (AI)      [public domain]
Umami         →  traffic thật                          [sau script + publish]
Ladi AI-SEO   →  orchestrator + UI + tasks + jobs
```

**Publish không còn là điều kiện duy nhất** để chạy Unlighthouse.  
Publish vẫn là lúc **bật AI-SEO tự động đầy đủ** (project + scripts + traffic path) và **có thể** thêm lab trên URL public.

---

## 1. Có nên đưa luồng vào BullMQ?

### Kết luận: **Có — bắt buộc cho Unlighthouse (Path C)**

| Path | Thời gian | Nên BullMQ? |
|------|-----------|-------------|
| **C Unlighthouse** (Chrome + Lighthouse) | 30s–vài phút | **Có** |
| **B HTML rules** | &lt; vài giây | Có thể sync trong API |
| **A OpenSEO domain** | vài giây–hàng chục giây | Nên queue nếu chậm/rate-limit; MVP soft-sync OK |
| **Umami** | API stats nhanh | Sync + cache (đã có), không cần queue scan |

### Vì sao Path C phải queue

1. Lighthouse **không** xong trong 1 HTTP request FE (timeout 30–60s).
2. Chrome **nặng** — không chạy trong process API Nest.
3. Nhiều user bấm Scan cùng lúc → cần **hàng đợi + concurrency** (1–2 Chrome).
4. FE cần **poll job** (pattern `useJobPolling` / AI-SEO jobs đã có).
5. Editor/list bấm Scan **không block** UI chỉnh sửa.

### Mô hình queue đề xuất

```
API Nest (enqueue only)
    → Redis + BullMQ queue: ai-seo-lighthouse
        → Worker process (Chromium + unlighthouse-ci)
            → normalize → ghi DB → job status
```

**Không** cần một job thần thánh gộp OpenSEO + Umami + Unlighthouse.  
Nên **1 job Unlighthouse**; A/B chạy song song soft; Umami **độc lập**.

| Job type | Queue | Trigger |
|----------|-------|---------|
| `lighthouse.scan` | `ai-seo-lighthouse` | Editor / list / AI-SEO / publish (optional) |
| (optional sau) `openseo.domain` | `ai-seo-openseo` | Khi domain public + user muốn full SEO |
| Umami | không | Get traffic on demand + cache |

### Unlighthouse: package CLI, không fork monorepo

- Cài `@unlighthouse/cli` (+ Chromium/puppeteer) trong **worker image**.
- Chạy `unlighthouse-ci` headless (`--reporter jsonExpanded`).
- **Không** nhúng Chrome trong API Nest; **không** bắt buộc microservice full UI Unlighthouse.
- Production: worker/container riêng (cách ly OOM) — “microservice nhẹ” của Ladi, vẫn là CLI trong container.

---

## 2. Điểm kích hoạt (không chỉ Publish)

```
1) Danh sách Landing Page (mỗi item)  →  “Scan tốc độ / Lighthouse”
2) Editor đang sửa                    →  “Đánh giá trang (trước publish)”
3) AI-SEO project / linked page       →  Scan SEO hybrid
4) Publish (optional)                 →  Auto QUICK scan sau public URL
```

### Ma trận: trigger × hệ

| Trigger | Unlighthouse | OpenSEO domain/KW | Umami traffic | Mục đích user |
|---------|--------------|-------------------|---------------|---------------|
| **Editor – pre-publish** | ✓ QUICK, 1 URL draft/preview | ✗ (thường local/draft) | ✗ | Xem điểm trước publish |
| **List LP item** | ✓ QUICK hoặc STANDARD | nếu đã publish public | nếu đã có script | So sánh nhiều LP |
| **AI-SEO Scan** | ✓ + sample multi | ✓ nếu public domain | ✓ đọc snapshot | Full SEO loop |
| **Sau Publish** | ✓ optional auto | ensure project + soft domain | inject script + sync site | Khép vòng prod |

---

## 3. Vấn đề cốt lõi: “đang edit” scan URL nào?

Unlighthouse **không** đọc state Puck/editor trong memory. Nó cần **HTTP URL** Chrome mở được.

### Các lớp URL theo vòng đời LP

| Trạng thái LP | URL khả dụng | Scan pre-publish |
|---------------|--------------|------------------|
| Draft, chỉ editor | Không public URL | Cần **Preview URL** tạm |
| Draft + preview server | `preview…` / signed URL | ✓ Unlighthouse |
| Local dev | `localhost` / host.docker | ✓ nếu worker reach |
| Published | `publicUrl` | ✓ full hybrid |

### OpenSEO vs Unlighthouse trên local

| URL | Unlighthouse | OpenSEO domain overview |
|-----|--------------|-------------------------|
| `https://lp.example.com` | ✓ | ✓ |
| `http://localhost:3000` | ✓* | ✗ (BE đã reject non-public host) |
| Preview nội bộ | ✓* | ✗ nếu không public registrable |
| Draft chưa publish | ✓ qua preview ephemeral | ✗ |

\*Worker phải **reach** được URL (`localhost` trong Docker ≠ host — cần `host.docker.internal` / network host / tunnel).

### Hướng render pre-publish (chốt P1)

| Hướng | Mô tả | Ưu / nhược |
|-------|--------|------------|
| **P1 — Preview ephemeral (khuyến nghị)** | Render HTML draft (gần pipeline publish, **không** go-live), host tạm TTL 15–30’ hoặc path signed; worker scan URL đó | Gần production; score tin được |
| **P2 — Scan public bản cũ** | LP đã publish: scan `publicUrl` | Dễ; **không** phản ánh bản đang sửa |
| **P3 — Chỉ local dev** | Scan `localhost` editor preview | Dev only |

**Plan lấy P1 làm mặc định cho editor.**  
List item: published → `publicUrl`; draft → P1 hoặc disable + tooltip.

---

## 4. Cấu trúc hệ thống

### 4.1 Sơ đồ

```
fe-v2
  · Landing list  → Scan button / badge scores
  · Editor shell  → Panel “Chất lượng trang” (Lighthouse)
  · AI-SEO        → Hybrid scan + traffic + tasks

ladipage-backend
  · AiSeoModule / ScanOrchestrator
  · PreviewPrepare (render draft HTML → preview URL)
  · UnlighthouseClient → BullMQ
  · OpenSeoClient / UmamiClient (theo ma trận)

BullMQ worker
  · unlighthouse-ci → JSON summary → DB

Lưu trữ
  · scan run per page (latest + history ngắn)
  · scores trên item LP + editor panel
```

### 4.2 Cấu trúc BE đề xuất (`ai-seo`)

```
apps/ladipage-backend/src/modules/ai-seo/
├── controllers/          # projects, jobs, tasks, traffic, lab-scan…
├── services/
│   ├── ai-seo-project.service.ts
│   ├── ai-seo-landing-page.service.ts
│   ├── ai-seo-task.service.ts
│   ├── ai-seo-traffic.service.ts       # Umami
│   ├── ai-seo-publish.service.ts
│   ├── ai-seo-jobs.service.ts          # poll (mở rộng Path C)
│   ├── scan/
│   │   ├── scan-orchestrator.service.ts   # Path A+B+C
│   │   ├── url-planner.service.ts
│   │   └── issue-to-task.mapper.ts
│   └── adapters/
│       ├── openseo-client.service.ts
│       ├── umami-client.service.ts
│       └── unlighthouse-client.service.ts
├── workers/unlighthouse/
│   ├── unlighthouse.processor.ts
│   ├── unlighthouse.runner.ts          # unlighthouse-ci
│   └── unlighthouse.normalizer.ts
├── entities/                           # siteAudit.lighthouse, page scores
└── utils/                              # domain (public vs local), page-audit
```

API Nest **không** chạy Chrome; chỉ enqueue.

### 4.3 Deploy

```
┌─────────────────┐     enqueue      ┌──────────────────────────┐
│  API Nest       │ ───────────────► │  Redis + BullMQ          │
│  (không Chrome) │                  └────────────┬─────────────┘
└─────────────────┘                               │
                                                  ▼
                                    ┌──────────────────────────┐
                                    │  Worker + Chromium       │
                                    │  unlighthouse-ci         │
                                    └────────────┬─────────────┘
                                                 ▼
                                           target URL
                                    preview | public | local
```

---

## 5. Luồng chi tiết

### 5.1 Editor (trước publish)

```
[User trong Editor] bấm “Đánh giá trang” / “Scan Lighthouse”
        │
        ▼
[FE] POST …/landing-pages/:id/lab-scan
     body: { source: "editor", depth: "quick" }
        │
        ▼
[BE] 1. Load draft / editor_data → render HTML (gần publish, Umami off trên preview)
     2. Host tạm → Preview URL (TTL, noindex)
     3. Tạo jobId + scan_run status=queued
     4. Enqueue BullMQ { url, pageId, mode: pre_publish, trigger: editor }
        │
        ▼
[Worker] unlighthouse-ci (1 page, mobile, samples 1–2) --reporter jsonExpanded
        │
        ▼
[Persist] scores + CWV + top issues
        │
        ▼
[FE poll] Panel: Performance / SEO / A11y / BP + LCP·CLS·TBT + gợi ý
          “Scan lúc … · bản draft (chưa publish)”
```

**Không** gọi OpenSEO domain / Umami trong luồng này.

### 5.2 List Landing Page (mỗi item)

```
[User] list LP → “Scan”
        │
        ▼
resolve target: published → publicUrl | draft → preview (P1) hoặc disable
        │
        ▼
Enqueue Unlighthouse QUICK
        │
        ▼
Badge: Perf · SEO · LCP · lastScanAt
```

Optional: domain public → soft Path A (không chặn lab).

### 5.3 AI-SEO hybrid

```
Path A OpenSEO   domain overview (+ backlink soft)  — public only
Path B HTML      meta/heading/alt rules
Path C Unlighthouse  lab (async BullMQ)
        → siteAudit + tasks ON_PAGE/TECHNICAL
```

| Depth | C policy (gợi ý) |
|-------|------------------|
| **quick** | 1–2 URL, mobile, samples 1–2 |
| **full** | tới N URL / sample, samples 3, throttle on |

### 5.4 Publish — **giữ AI-SEO tự động** + lab bổ sung

#### Có còn luồng tự động AI-SEO khi publish không?

**Có — bắt buộc giữ (non-negotiable).** Pre-publish **không** thay thế bước này.

| Bước khi Publish | Hiện trạng / plan | Bắt buộc? |
|------------------|-------------------|-----------|
| `preparePublishedHtml` — inject SEO pixel + Umami (nếu bật) | **Giữ** | **Có** (fail-soft) |
| `afterPublish` — ensure SEO project + link landing page | **Giữ** | **Có** (fail-soft) |
| Soft sync traffic / SEO project id | **Giữ** | **Có** (fail-soft) |
| Publish **không** fail vì OpenSEO/Umami down | **Giữ** | **Có** |
| Enqueue Unlighthouse trên `publicUrl` | **Bổ sung** | Khuyến nghị bật mặc định; có flag tắt; skip nếu draft lab &lt; N phút |
| Path A domain overview ngay lúc publish | Tùy product; có thể soft / lazy | Không chặn publish |

```
Publish success
  │
  ├─ [GIỮ] AI-SEO auto pipeline (fail-soft, không block publish)
  │     · preparePublishedHtml → inject pixel + Umami script
  │     · afterPublish → ensure SeoProject + link SeoProjectPage
  │     · traffic/seo sync status trả về FE (ok | skipped | failed)
  │
  ├─ [BỔ SUNG] Unlighthouse QUICK trên publicUrl (BullMQ)
  │     · trigger=publish, phase=post_publish
  │     · skip nếu pre-publish scan cùng page < N phút (config)
  │     · fail lab → chỉ ghi scan_run failed; publish vẫn success
  │
  └─ [TÙY CHỌN] soft OpenSEO domain / AI-SEO scan project
        · khi hostname public registrable
```

**Tóm lại:** User publish một lần vẫn được **tự động gắn AI-SEO + traffic script** như hiện tại; thêm (mặc định) **lab trên URL thật** — không bắt user vào editor quét trước mới publish.

### 5.5 Pre vs post publish

```
        PRE-PUBLISH (mới, manual)              POST-PUBLISH (GIỮ auto AI-SEO + lab)
   ┌──────────────────────────┐         ┌────────────────────────────────────┐
   │ Unlighthouse (preview)   │         │ [GIỮ] ensure project + link page   │
   │ HTML rules optional      │         │ [GIỮ] inject Umami + SEO pixel     │
   │ OpenSEO    ✗             │         │ [GIỮ] fail-soft, publish luôn OK   │
   │ Umami      ✗             │         │ [+] Unlighthouse publicUrl (queue) │
   │                          │         │ [+] OpenSEO khi domain public      │
   │                          │         │ [+] Umami bắt đầu đếm traffic      │
   └──────────────────────────┘         └────────────────────────────────────┘
            ▲                                          ▲
     Editor + List                            Publish (tự động)
```

---

## 6. Hợp đồng dữ liệu

### 6.1 Chỉ đẩy “kết quả quan trọng” (normalize)

**Per page:** url, finalUrl, device, scores (4 category 0–100), metrics (LCP, CLS, TBT, FCP, SI, TTFB…), top issues (auditKey, title, severity, impact, ≤10 items), source=`unlighthouse`, lighthouseVersion, fetchedAt.

**Aggregate (project):** pagesScanned/failed, avg/p50/p90 perf, worstPages[], recurringIssues[].

**Không persist mặc định:** screenshots, full network, full LH JSON, HTML client Unlighthouse (optional raw TTL 7 ngày ops).

### 6.2 Scan run (logic)

| Field | Ý nghĩa |
|-------|---------|
| `id` / `jobId` | BullMQ + poll |
| `landingPageId` | Item LP |
| `seoProjectId?` | Nếu đã link AI-SEO |
| `trigger` | `editor` \| `list` \| `ai_seo` \| `publish` |
| `phase` | `pre_publish` \| `post_publish` |
| `targetUrl` | preview hoặc public |
| `targetKind` | `preview` \| `public` \| `local` |
| `status` | queued / active / completed / failed |
| `scores` / `metrics` / `issues[]` | lab result |
| `createdAt`, `finishedAt` | |

History: **5–10 run/page** hoặc 7–14 ngày (before/after).

### 6.3 Multi-source scores (FE/API)

```text
scores:
  domain:     { technicals, ux, authority, content }   // OpenSEO-ish + HTML
  lighthouse: { performance, accessibility, bestPractices, seo, cwv }
  traffic:    { pageviews, visitors, … }              // Umami

siteAudit.modes: ["domain_overview", "page_audit", "unlighthouse"]
tasks[].source: html_rules | unlighthouse | open_seo | agent
```

**Không gộp mù** 3 nguồn thành 1 “SEO score” trừ khi có công thức công bố.

---

## 7. Preview ephemeral (điều kiện pre-publish)

1. **Input:** `pageId` + draft (FE snapshot hoặc BE đọc DB).
2. **Render:** pipeline HTML gần publish; **Umami off** trên preview; pixel SEO tùy chọn off.
3. **Host:** path nội bộ `preview-scan/{token}` (worker VPC) **hoặc** static host tạm.
4. **Header:** `noindex`, TTL, token hết hạn.
5. **Security:** tenant-only; worker allowlist host (preview domain + tenant domains + localhost dev).
6. **Sau scan:** xóa hoặc expire preview.

Không có P1 → **không** hứa “scan đúng bản đang edit”.

---

## 8. UX

### 8.1 Editor

- Entry: toolbar / sidebar “Chất lượng (Lighthouse)”.
- States: Idle → Queued → Scanning → Result / Error.
- Result: 4 scores + CWV + “Vấn đề chính”.
- Copy: *“Đo trên bản xem trước, chưa phải traffic thật / SEO domain”*.
- CTA: gợi ý fix; “Publish để đo traffic & SEO domain”.
- Rate limit: 1 scan active/page; cooldown 60–120s.

### 8.2 Landing list

- Badge Perf / SEO lab + lastScanAt.
- Action Scan · drawer chi tiết.
- Draft chưa preview: disable + tooltip.

### 8.3 AI-SEO

- Scorecards tách: Lab | Domain | Traffic.
- Tasks từ lab; filter theo `source`.

### 8.4 Không làm

- Auto-scan mỗi keystroke.
- Chạy Unlighthouse trên browser user.
- Bắt OpenSEO khi pre-publish local.

---

## 9. BullMQ vận hành

| Hạng mục | Đề xuất |
|----------|---------|
| Queue name | `ai-seo-lighthouse` |
| Concurrency | 1–2 job/global (Chrome) |
| Priority | `editor` / `list` > `publish` auto / nightly |
| Timeout | quick 3–5’; full 20–45’ |
| Retry | 1 lần (chrome flaky) |
| Idempotency | cùng page + trigger trong 30s → reuse job |
| Dead letter | failed + message user-friendly |
| Metrics | queue lag, fail rate, p95 duration |

Worker: process tách (pattern `worker.main`), image Chromium; Docker: `--no-sandbox` (docs Unlighthouse).

Node **≥ 22.18** (yêu cầu Unlighthouse).

---

## 10. Roadmap phase

### Phase 0 — Quyết định & PoC (2–3 ngày)

- [ ] Chốt P1 preview ephemeral
- [ ] PoC: draft → HTML → URL → `unlighthouse-ci` 1 page → JSON
- [ ] PoC BullMQ 1 job end-to-end
- [ ] Đo thời gian p50/p95 QUICK

### Phase 1 — Nền lab + BullMQ (3–5 ngày)

- [ ] Queue `ai-seo-lighthouse` + worker Chromium
- [ ] Contract scan_run + normalize
- [ ] API `lab-scan` + job status
- [ ] Concurrency, timeout, retry, allowlist URL

### Phase 2 — Preview pre-publish (3–5 ngày)

- [ ] Prepare preview từ draft
- [ ] TTL / noindex / auth token
- [ ] Gắn `trigger=editor`
- [ ] Fail-soft nếu render fail

### Phase 3 — FE Editor panel (3–4 ngày)

- [ ] Nút “Đánh giá trang”
- [ ] Poll + 4 scores + CWV + issues
- [ ] Cooldown + empty/error
- [ ] Copy pre-publish vs prod

### Phase 4 — FE Landing list (2–3 ngày)

- [ ] Action scan / item
- [ ] Badge scores + lastScanAt
- [ ] Drawer chi tiết
- [ ] Draft vs published resolve URL

### Phase 5 — AI-SEO hybrid + optional publish auto (3–5 ngày)

- [ ] Path C vào scan AI-SEO
- [ ] Tasks từ issues (dedup + cap)
- [ ] Publish auto-scan flag + skip nếu draft scan mới
- [ ] Scorecards Lab / Domain / Traffic

### Phase 6 — Polish & production (3–5 ngày)

- [ ] Quota scan/ngày theo plan
- [ ] Priority queue
- [ ] History before/after
- [ ] Metrics + runbook
- [ ] E2E: edit → scan → sửa → re-scan → publish → traffic

**MVP pre-publish (user value):** Phase 0→4 (~2–3 tuần).  
**Full AI-SEO loop:** + Phase 5–6 (+1–2 tuần).

### Phụ thuộc

```
Phase 0 PoC
    → Phase 1 BullMQ + normalize
        → Phase 2 Preview
            → Phase 3 Editor ∥ Phase 4 List
                → Phase 5 AI-SEO hybrid
                    → Phase 6 Harden
```

---

## 11. Definition of Done (rút gọn)

### Map mục tiêu G1–G8

- [ ] **G1** Editor + list: lab pre-publish có scores + CWV
- [ ] **G2** Unlighthouse qua BullMQ worker; không DFS LH cho LP lab
- [ ] **G3** Publish: ensure project + link + inject Umami/pixel **vẫn chạy** (regression test)
- [ ] **G4** Sau publish: lab publicUrl (hoặc skip policy) + traffic path + SEO project linked
- [ ] **G5** Đủ trigger: editor · list · ai_seo · publish
- [ ] **G6** UI phân biệt draft lab vs prod lab; lastScanAt
- [ ] **G7** Tasks/agent dùng issues lab đúng phase
- [ ] **G8** Publish success khi OpenSEO/Umami/Unlighthouse fail (fail-soft)

### Pre-publish lab

- [ ] Editor scan draft qua preview → hiện scores + CWV
- [ ] List item scan + badge
- [ ] BullMQ + worker ổn định; poll job
- [ ] OpenSEO/Umami **không** bắt buộc pre-publish

### Publish auto AI-SEO (không regression)

- [ ] `preparePublishedHtml` / `afterPublish` hành vi hiện tại được giữ
- [ ] FE vẫn nhận `seoSyncStatus` / `trafficSyncStatus` / scriptsInjected
- [ ] Unlighthouse post-publish không block response publish
- [ ] Skip lab post-publish khi draft scan mới (config N phút) hoạt động đúng

### AI-SEO hoàn thiện (mở rộng)

- [ ] Hybrid A+B+C; partial success rõ
- [ ] Tasks từ LH + HTML (dedup)
- [ ] Traffic Umami post-publish
- [ ] Agent context 3 nguồn (lab + domain + traffic)
- [ ] Quota, SSRF allowlist, metrics runner

---

## 12. Rủi ro & giảm thiểu

| Rủi ro | Giảm |
|--------|------|
| Preview ≠ prod (CDN, domain) | Copy rõ “lab trên preview”; re-scan sau publish |
| Spam scan | Cooldown, quota, 1 job/page |
| Chrome OOM | Worker tách, concurrency thấp |
| Score dao động | samples≥2 “chuẩn”; quick disclaimer |
| Docker localhost | `host.docker.internal` / host network / tunnel |
| OpenSEO local | Path A tắt; message rõ |

---

## 13. Báo cáo stakeholder (1 trang)

### Mục tiêu đạt được (promise)

1. Editor/list đánh giá **chất lượng lab trước publish** (G1).  
2. Lab free/ổn định qua Unlighthouse + BullMQ (G2).  
3. **Publish vẫn tự động AI-SEO** như hiện tại — project, link, Umami/pixel (G3).  
4. Sau publish: traffic + SEO domain + (thêm) lab URL public (G4).  
5. AI-SEO có task/chỉ số đầy đủ hơn, không mất automation cũ (G5–G8).

### Vấn đề

- Chỉ (hoặc chủ yếu) phụ thuộc publish → khó biết LP yếu **trước** khi lên sóng.
- OpenSEO không chấm lab local/draft.
- Lighthouse nặng → không sync trên API.
- Sợ “làm pre-publish” làm **mất** auto SEO lúc publish → plan **giữ** pipeline cũ.

### Giải pháp

1. **BullMQ + worker Unlighthouse** cho mọi lab scan.  
2. **Nhiều trigger:** Editor, List, AI-SEO, Publish (auto lab **bổ sung**).  
3. **Preview ephemeral** để đo đúng bản đang edit.  
4. **Publish auto AI-SEO giữ nguyên** (fail-soft); OpenSEO + Umami post-publish.  
5. Pre-publish **additive** — không thay publish hook.

### Lợi ích

| Ai | Lợi ích |
|----|---------|
| Marketer/Editor | Tự chấm tốc độ/SEO lab **trước** publish |
| List LP | So sánh nhanh nhiều trang |
| AI-SEO | Lab + domain + traffic sau khi live; **automation publish không mất** |
| Ops | Queue kiểm soát tải Chrome; publish không phụ thuộc Chrome |

### Câu hỏi thường gặp

| Hỏi | Đáp |
|-----|-----|
| Publish còn auto AI-SEO không? | **Có.** Ensure project, link page, inject Umami/pixel — giữ. |
| Phải scan editor trước mới publish? | **Không.** Pre-publish là optional UX; publish vẫn full auto SEO. |
| Unlighthouse thay OpenSEO/Umami? | **Không.** Chỉ lab; 3 hệ bổ sung. |

---

## 14. Tham chiếu docs Unlighthouse

- Installation / CLI: https://unlighthouse.dev/guide/getting-started/installation  
- CI: https://unlighthouse.dev/integrations/ci (`unlighthouse-ci`, reporters, `--urls`, samples, throttle)  
- How it works: https://unlighthouse.dev/guide/getting-started/how-it-works  
- Config / accuracy / Docker: unlighthouse.dev guides  
- Build-tool integrations: **deprecated** → dùng CLI/CI  

**Yêu cầu runtime:** Node ≥ 22.18, Chrome/Chromium.

---

## 15. Trả lời chốt

1. **Mục tiêu đạt được?** G1–G8 (§0): pre-publish lab, BullMQ Unlighthouse, **giữ publish auto AI-SEO**, khép vòng post-publish, multi-trigger, multi-source scores, tasks/AI, ops fail-soft.  
2. **Publish còn luồng tự động AI-SEO không?** **Có — giữ nguyên** ensure project + link page + inject Umami/pixel + fail-soft. Pre-publish **không thay** bước này; Unlighthouse sau publish chỉ **bổ sung**.  
3. **BullMQ?** Có — bắt buộc cho Unlighthouse Path C.  
4. **Không chỉ publish?** Đúng — Editor + List pre-publish; publish vẫn là cửa auto AI-SEO đầy đủ.  
5. **OpenSEO/Umami?** Post-publish / domain public; không bắt buộc pre-publish.  
6. **Cài Unlighthouse?** npm CLI + Chrome trong worker — không fork monorepo upstream.

---

*Tài liệu plan — cập nhật khi chốt host preview (P1 path nội bộ vs static) trước implement.*

---

## 17. Current Status (2026-07-22)

| | |
|--|--|
| **Container** | `liora-ladipage-dev` — **Up** (health starting) |
| **Image** | `docker-liora-ladipage` |
| **Node** | **v22.23.1** |
| **Chromium** | `/usr/bin/chromium-browser` |
| **Unlighthouse** | **ok** |

**EOL**: "Quét lab thất bại" + quá lâu đã được xử lý (inline mock + no worker conflict). Restart Nest là đủ để scan.

---

## 16. Implementation status (2026-07-21)

### Đã ship (MVP trong `ladipage-backend` + `fe-v2`)

| Hạng mục | Trạng thái |
|----------|------------|
| Queue `ai-seo-lighthouse` + worker module | Done |
| `LabScanService` tenant-scoped + URL policy SSRF | Done |
| Mock runner (`UNLIGHTHOUSE_MODE=mock` / test) + CLI path | Done |
| API `POST/GET /ai-seo/lab-scans` | Done |
| Landing page scan → Unlighthouse Path C | Done |
| Publish `afterPublish` giữ ensure/link/Umami + soft lab enqueue | Done |
| Jobs poll `lab-*` không gọi OpenSEO | Done |
| FE: lab columns, `LabScanPanel`, API client | Done |
| Tests ai-seo (68) + fe mapper/ai-seo (8) | Pass |

### Chưa (phase sau theo plan)

- Preview ephemeral HTML draft (P1 full host TTL)
- Editor builder chrome mount `LabScanPanel` (panel đã có, gắn AI-SEO landing list)
- Dual-write OpenSEO ingest
- Chromium prod image + non-mock CLI validation E2E

### Env gợi ý

| Env | Ý nghĩa |
|-----|---------|
| `UNLIGHTHOUSE_MODE=mock` | Không cần Chromium (dev/test) |
| `UNLIGHTHOUSE_AUTO_ON_PUBLISH=true` | (default) lab sau publish |
| `UNLIGHTHOUSE_ALLOW_LOCAL=true` | Cho localhost ngoài trigger editor |
| `UNLIGHTHOUSE_INLINE=true` | Chạy sync không queue |
| `UNLIGHTHOUSE_BIN` | Path `unlighthouse-ci` |
| `UNLIGHTHOUSE_FALLBACK_MOCK=true` | CLI fail → mock soft |
