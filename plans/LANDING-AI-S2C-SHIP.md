# Plan 1 — Ship s2c (AI Generator + Clone URL)

> **Ngày:** 2026-07-07  
> **Phạm vi:** Tab AI Generator, Clone URL, PPC trong `CreatePageModal` — job async qua BullMQ + screenshot-to-code  
> **BE:** `liora-monorepo/apps/ladipage-backend/src/modules/landing-ai/` → Nest `/api/landing-ai/*`  
> **Microservice:** screenshot-to-code Docker `:7010`  
> **Editor:** Giữ **VisualEditor** hiện tại (`editor_data` + block `html_code`)  
> **Kế hoạch tiếp theo:** [LANDING-PUCK-MIGRATION.md](./LANDING-PUCK-MIGRATION.md)

---

## 0. Mục tiêu & phạm vi

### Mục tiêu

User tạo landing page bằng **AI Generator**, **Clone URL**, hoặc **PPC** → thấy progress thật từ job → mở builder → publish được HTML từ s2c.

### In scope

| Feature | `type` API | s2c mode |
|---------|-----------|----------|
| AI Generator | `ai` | `inputMode: text` |
| Clone URL | `clone` | screenshot → `inputMode: image` |
| PPC Campaign | `ppc` | `inputMode: text` (prompt có cấu trúc) |

- Job async BullMQ + poll status/events
- Mock mode dev (`LANDING_AI_MOCK_GENERATE=true`)
- Lưu `editor_data` (block `html_code` + `preserveHtml`)
- Backup `ai_source_html` cho migrate Puck sau

### Out of scope (để Plan 2)

- Puck editor
- HTML → block tree editable (`importMode: convert`)
- AI Copilot update mode (`landing-ai-update` processor)
- Billing/credit per job (stub only)
- Tách worker process production (phase cuối)

### Definition of Done

- [x] FE gọi `POST /api/landing-ai/jobs` cho `ai` | `clone` | `ppc`
- [x] Progress overlay hiển thị events thật (không còn `setInterval` fake)
- [x] Job `success` → mở builder với page có `editor_data`
- [x] Publish → `published_html` = HTML gốc từ s2c (`preserveHtml: true`)
- [ ] Mock mode hoạt động khi không có s2c (cần verify runtime)
- [ ] Clone URL chụp screenshot + generate thật (cần `SCREENSHOTONE_API_KEY` + s2c deploy)
- [x] `ai_source_html` lưu backup
- [x] Tag assignment sau job success

---

## 1. Hiện trạng (audit)

### Tiến độ tổng quan

| Layer | Hoàn thành | Ghi chú |
|-------|------------|---------|
| **nest-core BullMqModule** | **100%** | `libs/nest-core/src/modules/bullmq/` |
| **BE LandingAiModule** | **~90%** | Controller, service, processor, s2c client |
| **DB migration jobs** | **100%** | `lp_landing_ai_job`, `lp_landing_ai_job_event` |
| **FE wire API** | **100%** | `landing-ai.api.ts` + `page.tsx` poll job |
| **Converter preserveHtml** | **100%** | `preserveHtml: true` + unit test |
| **Docker s2c** | **100%** | `liora-monorepo/docker/docker-compose.yml` profile `s2c` :7010 |
| **E2E s2c thật** | **0%** | Cần keys + deploy `:7010` |

### FE (`ladipage-fe-v2`)

| Thành phần | Path | Trạng thái |
|------------|------|------------|
| Create modal | `components/landing-pages/pages/CreatePageModal.tsx` | ✅ Thu thập form đủ field |
| Fake generator | `app/(admin)/landing-pages/page.tsx` | ❌ `setInterval` + template picker |
| Progress UI | `page.tsx` (`activeJob` overlay) | ✅ UI có — data fake |
| API client | `lib/endpoints/landing-ai.api.ts` | ❌ Chưa có |
| Job polling hook | `features/landing-ai/hooks/` | ❌ Chưa có |
| HTML import converter | `features/landing-pages/import/html-to-landing-schema.ts` | ✅ Dùng cho tab Import |

### BE (`liora-monorepo/apps/ladipage-backend`)

| Thành phần | Path | Trạng thái |
|------------|------|------------|
| Module | `modules/landing-ai/` | ✅ 18 files |
| API | `POST/GET /landing-ai/jobs` | ✅ |
| Processor | `processors/landing-ai-generate.processor.ts` | ✅ |
| s2c client | `clients/screenshot-to-code.client.ts` | ✅ WS + HTTP screenshot |
| Prompt builder | `prompts/landing-prompt.builder.ts` | ✅ Dùng `params.prompt` |
| Converter | `converters/html-to-editor.converter.ts` | ⚠️ Thiếu `preserveHtml` |
| Storage | `services/landing-pages-storage.service.ts` | ⚠️ Chưa tags, chưa `ai_source_html` |
| Update processor | `processors/landing-ai-update.processor.ts` | 🔶 Stub — chưa register |

### Gap chính

```
FE handleGeneratePage (fake)     ≠  Nest POST /api/landing-ai/jobs
FE setInterval progress          ≠  GET /jobs/:id + /events
Converter html_code              ≠  preserveHtml → publish sai format
BE upsert page                   ≠  tag_ids từ CreatePageModal
```

---

## 2. Kiến trúc target

```
User → CreatePageModal (ai | clone | ppc)
  ↓
FE → POST /api/landing-ai/jobs  (ladipage-backend :7002)
  ↓
Nest → INSERT lp_landing_ai_job → BullMQ enqueue
  ↓
LandingAiGenerateProcessor
  ├── clone: POST s2c /api/screenshot → WS /generate-code (image)
  ├── ai|ppc: WS /generate-code (text)
  ├── HtmlToEditorConverter → editor_data (html_code)
  └── LandingPagesStorageService → Supabase landing_pages
  ↓
FE poll GET /jobs/:id + /events (2s)
  ↓
status=success → openLandingBuilder(pageId)
  ↓
User publish → renderLandingPageHtml → published_html
```

### Mapping tab ↔ s2c

| Landing tab | `type` | s2c | Prompt |
|-------------|--------|-----|--------|
| AI Generator | `ai` | TextTab / `text` | `LandingPromptBuilder.buildTextPrompt()` |
| Clone URL | `clone` | UrlTab / `image` | Screenshot + `buildCloneImagePrompt()` |
| PPC | `ppc` | TextTab / `text` | `buildTextPrompt()` + keyword/offer/cta |

---

## 3. Nguyên tắc triển khai

1. **Không đổi editor** — ship AI trước, Puck sau (Plan 2).
2. **API contract ổn định** — FE chỉ cần `jobId` + `pageId`; format editor do processor quyết định.
3. **Chuẩn bị migrate** — lưu `ai_source_html`, `generation_meta` ngay từ Plan 1.
4. **Mock first** — dev/test UI không cần s2c; staging bật s2c thật.

---

## 4. Phase 1A — Backend hardening (2–3 ngày)

### PR-1: Fix converter + metadata

**File:** `liora-monorepo/apps/ladipage-backend/src/modules/landing-ai/converters/html-to-editor.converter.ts`

Thêm vào block `html_code`:

```typescript
props: {
  code: html,
  height: 1200,
  preserveHtml: true,
  mode: 'preserve',
}
```

Thêm `pageSettings`:

```typescript
generationSource: 'ai' | 'clone' | 'ppc',
generationJobId: jobId,
```

**Acceptance:** `renderLandingPageHtml()` (FE) trả full HTML document gốc, không bọc iframe.

**Test:** Unit test converter output có `preserveHtml: true`.

---

### PR-2: Lưu raw HTML backup

**Migration Supabase:** `ladipage-fe-v2/supabase/migrations/YYYYMMDDHHMMSS_landing_ai_source_html.sql`

```sql
ALTER TABLE landing_pages
  ADD COLUMN IF NOT EXISTS ai_source_html TEXT,
  ADD COLUMN IF NOT EXISTS generation_meta JSONB DEFAULT '{}'::jsonb;
```

**Processor + Storage:** lưu `ai_source_html` và `generation_meta` khi upsert page.

---

### PR-3: Tag assignment sau job

**File:** `landing-pages-storage.service.ts`

Sau upsert `landing_pages`, insert `landing_page_tags` nếu `tagIds` có trong payload.

**Acceptance:** Page AI có đúng tags user chọn trong modal.

---

### PR-4: Error handling & resilience

| Việc | Chi tiết |
|------|----------|
| Validate clone URL | Chặn empty, `file://` |
| BullMQ retry | `attempts: 2`, `backoff: exponential` |
| Cancel job | `POST /jobs/:id/cancel` → remove Bull job + update DB |
| WS close | `ScreenshotToCodeClient`: resolve `latestCode` nếu WS đóng có code |
| Timeout | `S2C_GENERATE_TIMEOUT_MS=300000` (5 phút) |

---

## 5. Phase 1B — Infrastructure (1–2 ngày)

### PR-5: Docker compose s2c ✅

Service `screenshot-to-code` trong `liora-monorepo/docker/docker-compose.yml`:

- Profile: `s2c` (build nặng — không bật mặc định)
- Port host: **7010** (tránh conflict nest-admin :7001)
- Network alias: `screenshot-to-code`
- `liora-ladipage` container: `SCREENSHOT_TO_CODE_*` → `http://screenshot-to-code:7010`
- Example env: `screenshot-to-code/.env.example`

```bash
cd liora-monorepo/docker
docker compose --profile s2c up -d screenshot-to-code
curl http://localhost:7010/api/capabilities
```

### Env checklist

```env
# ladipage-backend
BULLMQ_ENABLED=true
BULLMQ_PREFIX=liora:ladipage
REDIS_URL=redis://localhost:6381
LANDING_AI_MOCK_GENERATE=false        # true = dev không cần s2c
SCREENSHOT_TO_CODE_HTTP_URL=http://localhost:7010
SCREENSHOT_TO_CODE_WS_URL=ws://localhost:7010
S2C_DEFAULT_STACK=html_css
S2C_GENERATE_TIMEOUT_MS=300000
GEMINI_API_KEY=...
SCREENSHOTONE_API_KEY=...              # bắt buộc cho Clone URL

# ladipage-fe-v2
NEXT_PUBLIC_API_URL=http://localhost:7002/api
```

### PR-6: Runbook dev

```bash
# Terminal 1 — infra
docker compose up redis screenshot-to-code

# Terminal 2 — BE
pnpm db:migration:run
pnpm dev:ladipage

# Terminal 3 — FE
pnpm dev:fe-v2
```

---

## 6. Phase 1C — Frontend wire (3–4 ngày)

Theo pattern `plans/AI-SEO-INTEGRATION.md`:

```
ladipage-backend/dto/*.dto.ts
        ↓
@liora/api-types (landing-ai.ts)          ← optional, có thể inline types trước
        ↓
src/lib/endpoints/landing-ai.api.ts
        ↓
src/features/landing-ai/hooks/useLandingAiJobPolling.ts
        ↓
app/(admin)/landing-pages/page.tsx
```

### PR-7: API client

**Tạo:** `src/lib/endpoints/landing-ai.api.ts`

```typescript
const PREFIX = '/landing-ai'

export const landingAiApi = {
  createJob(body) → POST `${PREFIX}/jobs`     // 202 { jobId, pageId, status }
  getJob(jobId)   → GET  `${PREFIX}/jobs/:id`
  getJobEvents(jobId) → GET `${PREFIX}/jobs/:id/events`
  cancelJob(jobId) → POST `${PREFIX}/jobs/:id/cancel`
}
```

Dùng `apiPost` / `apiGet` từ `lib/api-client.ts` (JWT Nest).

**Tạo:** `src/features/landing-ai/types.ts` — mirror `CreateLandingAiJobDto`.

---

### PR-8: Hook polling

**Tạo:** `src/features/landing-ai/hooks/useLandingAiJobPolling.ts`

Clone pattern `features/ai-seo/hooks/useJobPolling.ts`:

- Poll job mỗi 2s cho đến `success` | `failed` | `cancelled`
- Poll events → `statusText` từ message mới nhất
- Callback `onSuccess({ pageId, slug, result })`

---

### PR-9: Wire `handleGeneratePage`

**File:** `src/app/(admin)/landing-pages/page.tsx`

| `type` | Hành vi |
|--------|---------|
| `blank` | Giữ nguyên — local create Supabase |
| `import` | Giữ nguyên — local parse ZIP/HTML |
| `ai` \| `clone` \| `ppc` | **Mới** — API + poll |

**Xóa / deprecate** cho ai/clone/ppc:

- `getTemplateIdByIndustryAndStyle()`
- `customizeGeneratedSections()` trong fake path
- `setInterval` fake progress

**Payload gửi API:**

```typescript
await landingAiApi.createJob({
  type,           // 'ai' | 'clone' | 'ppc'
  name,
  tagIds,
  importMode: 'preserve',
  params: {
    businessName, industry, location, goal, style, prompt,  // ai
    url, cloneMode, keyword,                                   // clone
    source, campaignId, keyword, goal, offer, cta,            // ppc
  },
})
```

---

### PR-10: Progress UI

**File:** `page.tsx` — overlay `activeJob` (đã có UI)

Cập nhật:

- `activeJob.progress` ← `job.progress` từ API
- `activeJob.statusText` ← event message mới nhất
- Nút **Hủy** → `landingAiApi.cancelJob(jobId)`
- State lỗi: toast + cho phép đóng overlay

---

### PR-11: Post-success UX

Khi `status === 'success'`:

1. Refresh page list (fetch Supabase hoặc dùng `result.pageId`)
2. Thêm item vào `pages` state
3. `openLandingBuilder({ pageId, mode: 'same-tab' })`
4. Clear `activeJob`

---

## 7. Phase 1D — Test & QA (2 ngày)

### Test matrix

| Case | Mock | s2c thật |
|------|------|----------|
| AI — prompt đầy đủ | ✅ | ✅ |
| AI — chỉ businessName | ✅ | ✅ |
| Clone — visual_clone | — | ✅ |
| Clone — seo_landing_page + keyword | — | ✅ |
| PPC — keyword/offer/cta | ✅ | ✅ |
| Job timeout | — | ✅ |
| Cancel job | ✅ | ✅ |
| Publish → `/p/[slug]` | ✅ | ✅ |
| Tag assignment | ✅ | ✅ |

### Tests tự động (đã có / mở rộng)

| File | Mô tả |
|------|-------|
| `landing-prompt.builder.spec.ts` | Prompt AI/clone/ppc |
| `landing-ai-jobs.contract.spec.ts` | API contract |
| `bullmq-connection.factory.spec.ts` | Redis connection |

### Manual E2E checklist

1. Dev mock: tạo AI page → builder mở → publish OK
2. Staging s2c: tạo AI page thật → HTML khác mock
3. Clone URL với URL thật → screenshot + layout tương tự
4. Job fail (tắt s2c) → error message hiển thị

---

## 8. Phase 1E — Production readiness (2–3 ngày, optional)

### PR-12: Billing gate ✅

- [x] FE: `canCreateAiLandingPage()` — quota chỉ cho tab AI / Clone / PPC (blank/import thủ công không gate)
- [x] BE: `LandingPageQuotaService` — đếm pages từ Supabase (`website_pages` / `landing_pages`), reserve slot khi enqueue
- [x] `LandingAiService.createJob()` validate quota trước BullMQ enqueue
- [x] `BillingService.getUsage()` — `pages.used` thật qua `LANDING_PAGES_QUOTA` port

### PR-13: Observability ✅

- [x] Structured log JSON: `jobId`, `pageId`, `type`, `tenantId`, `organizationId`, `totalDurationMs`, `s2cDurationMs`, `screenshotDurationMs`
- [x] `LandingAiMetricsService` — success rate, p50/p95 latency (in-memory)
- [x] `GET /api/landing-ai/metrics`

### PR-14: Tách worker (production) ✅

```
apps/ladipage-ai-worker/
  BullMqModule.forWorker()
  LandingAiWorkerModule (processor only)
```

- [x] `BULLMQ_RUN_WORKERS=false` trên `liora-ladipage` (API chỉ enqueue)
- [x] `liora-ladipage-ai-worker` Docker service (`BULLMQ_RUN_WORKERS=true`)
- [x] Dev default: single process (cả API + worker khi không set env)

---

## 9. Timeline & thứ tự PR

| Phase | Effort | PRs |
|-------|--------|-----|
| 1A Backend | 2–3 ngày | PR-1 → PR-4 |
| 1B Infra | 1–2 ngày | PR-5, PR-6 (song song 1A) |
| 1C Frontend | 3–4 ngày | PR-7 → PR-11 |
| 1D QA | 2 ngày | — |
| 1E Prod | 2–3 ngày | PR-12 → PR-14 |
| **MVP** | **~8–10 ngày** | |
| **Production** | **~12–14 ngày** | |

### Thứ tự PR đề xuất

```
PR-1  converter + preserveHtml
PR-2  ai_source_html migration
PR-3  tag assignment
PR-5  docker s2c
PR-7  landing-ai.api.ts
PR-8  useLandingAiJobPolling
PR-9  wire handleGeneratePage
PR-10 progress UI + cancel
PR-4  error handling
PR-11 post-success UX
PR-12 billing (optional)
PR-14 worker split (prod)
```

---

## 10. Rủi ro & mitigation

| Rủi ro | Mitigation |
|--------|------------|
| s2c timeout (30s–5 phút) | UI progress + cancel; timeout 300s |
| ScreenshotOne quota / lỗi | Error message rõ; validate URL |
| Supabase admin client thiếu | Log warn; job result vẫn có `pageId` |
| HTML khó edit trong builder | Chấp nhận tạm — Plan 2 Puck |
| LLM cost | `NUM_VARIANTS=1`; billing gate sau |

---

## 11. File paths tham chiếu

| Mục đích | Path |
|----------|------|
| FE fake generator | `src/app/(admin)/landing-pages/page.tsx` |
| FE modal | `src/components/landing-pages/pages/CreatePageModal.tsx` |
| Publish HTML | `src/components/landing-pages/editor/core/editor-export-html.ts` |
| s2c backend | `screenshot-to-code/backend/routes/generate_code.py` |
| s2c screenshot | `screenshot-to-code/backend/routes/screenshot.py` |
| nest-core BullMQ | `liora-monorepo/libs/nest-core/src/modules/bullmq/` |
| landing-ai module | `liora-monorepo/apps/ladipage-backend/src/modules/landing-ai/` |
| Job migration | `liora-monorepo/libs/database/src/migrations/1756100000000-landing-ai-jobs.ts` |
| Docs kiến trúc | `liora-monorepo/docs/landing/structure.md` |

---

## 12. Liên kết

- [LANDING-PAGES-INTEGRATION.md](./LANDING-PAGES-INTEGRATION.md) — billing, permission
- [LANDING-PUCK-MIGRATION.md](./LANDING-PUCK-MIGRATION.md) — Plan 2 migrate Puck
- [AI-SEO-INTEGRATION.md](./AI-SEO-INTEGRATION.md) — pattern poll job Nest