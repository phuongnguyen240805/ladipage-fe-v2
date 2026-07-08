# Plan 2 — Migrate Landing Editor sang Puck

> **Ngày:** 2026-07-07  
> **Phạm vi:** Thay VisualEditor custom bằng `@measured/puck` — kéo thả React components, publish qua `<Render>`  
> **Điều kiện:** [LANDING-AI-S2C-SHIP.md](./LANDING-AI-S2C-SHIP.md) ổn định (job success ≥ 95%, 2 tuần staging)  
> **Phụ thuộc:** Plan 1 đã lưu `ai_source_html` + `generation_meta`

---

## 0. Mục tiêu & phạm vi

### Mục tiêu

- Thay **VisualEditor** (custom block tree + `react-dnd`) bằng **Puck Editor**
- Draft lưu `puck_data` JSONB; publish dùng `<Render>` (một code path)
- AI output convert sang **Puck blocks editable** (không kẹt trong 1 blob `html_code`)
- Dual-run an toàn: feature flag rollback về legacy editor

### In scope

- Puck config ~30 components (map từ `BlockType` hiện tại)
- DB `puck_data` + migrator `editor_data` → `puck_data`
- Template seed migration (26 templates)
- `htmlToPuckData()` cho AI pipeline
- Public renderer `/p/[slug]` hỗ trợ Puck
- Feature flag `EDITOR_ENGINE`

### Out of scope

- Rewrite s2c / BullMQ pipeline (giữ nguyên Plan 1)
- Absolute positioning (Onlook frame x/y) — chuyển sang flow layout
- AI Copilot update mode (phase optional cuối)

### Definition of Done

- [ ] Puck editor tại `/builder/[id]` cho pages mới (`editor_engine=puck`)
- [ ] 26 templates có `puck_data`
- [ ] Pages cũ migrate hoặc dual-read
- [ ] AI job → `puck_data` (converter L2)
- [ ] Publish qua Puck `<Render>`; public page render đúng
- [ ] `EDITOR_ENGINE=legacy` rollback được
- [ ] VisualEditor deprecated; docs `structure.md` cập nhật

---

## 1. Hiện trạng editor (audit)

### Visual Editor hiện tại

| Thành phần | Path | Ghi chú |
|------------|------|---------|
| Editor chính | `editor/VisualEditor.tsx` | ~1300 dòng |
| Block types | `editor/types.ts` | ~30 `BlockType` |
| Canvas + DnD | `editor/Canvas.tsx` + `react-dnd` | Absolute layout (Onlook) |
| Inspector | `editor/InspectorPanel.tsx` | Custom field schema |
| Block registry | `editor/core/block-registry.ts` | Gần giống Puck config |
| Export HTML | `editor/core/editor-export-html.ts` | **Duplicate** render logic |
| Templates | `templates/template-seed-data.ts` | `editor_data` JSONB |
| Public page | `app/p/[slug]/page.tsx` | Serve `published_html` raw |

### Data model hiện tại

```typescript
// landing_pages.editor_data
{
  pageId: string
  pageName: string
  sections: EditorBlock[]    // type, props, frame, children
  pageSettings: { seoTitle, bgColor, primaryColor, ... }
  schemaVersion: 2
}
```

### Puck target

```typescript
// landing_pages.puck_data — format @measured/puck
{
  content: Array<{ type: string, props: Record<string, unknown> }>
  root: { props: { seoTitle, bgColor, ... } }
  zones?: Record<string, ContentArray>   // slots
}
```

### Gap chính

```
editor_data (absolute frame)     ≠  puck_data (flow + slots)
renderBlockHtml (string)         ≠  Puck render() (React) — 2 code paths
html_code blob (Plan 1 AI)      ≠  editable Puck blocks
docs structure.md puck_data       ≠  chưa có cột trong DB
```

---

## 2. Kiến trúc target

```
┌─────────────────────────────────────────────────────────────┐
│  Draft: landing_pages.puck_data JSONB                       │
│  Legacy: landing_pages.editor_data (deprecate sau cutover)  │
│  Cache: landing_pages.published_html (ISR optional)           │
│  Backup: landing_pages.ai_source_html (từ Plan 1)         │
└─────────────────────────────────────────────────────────────┘
         ↑                              ↑
  Puck Editor (/builder/[id])    AI Processor htmlToPuckData()
         ↓
  Puck <Render> SSR → published_html hoặc render runtime /p/[slug]
```

### Feature flag

```env
NEXT_PUBLIC_EDITOR_ENGINE=auto   # auto | puck | legacy
```

```typescript
function resolveEditorEngine(page): 'puck' | 'legacy' {
  if (env === 'puck') return 'puck'
  if (env === 'legacy') return 'legacy'
  return page.puck_data ? 'puck' : 'legacy'
}
```

---

## 3. Nguyên tắc migrate

1. **Không big-bang** — dual-run 2–4 tuần trước khi deprecate VisualEditor.
2. **Giữ `editor_data`** tạm — không xóa cho đến khi migrate xong 100% pages.
3. **AI pipeline không đổi** — chỉ thay converter cuối (`htmlToPuckData`).
4. **Ưu tiên flow layout** — bỏ absolute positioning; communicate với stakeholder sớm (Phase 2A).
5. **`ai_source_html`** — dùng làm nguồn convert Puck chất lượng cao hơn `html_code.props.code`.

---

## 4. Phase 2A — Spike & go/no-go (3–5 ngày)

### PR-P0: Puck POC

**Route mới (không đụng builder cũ):** `/builder-puck/[id]`

```bash
pnpm add @measured/puck
```

**Cấu trúc thư mục:**

```
src/features/landing-puck/
  config/
    landing-puck-config.ts
    components/
      Hero.tsx
      Text.tsx
      Button.tsx
      FormCapture.tsx
      RawHtml.tsx          # bridge tạm
  pages/
    PuckEditorPage.tsx
  types/
    landing-puck-data.ts
```

**POC scope:** 5 components + root fields (`seoTitle`, `bgColor`, `primaryColor`).

### Quyết định go/no-go

| Câu hỏi | Go nếu |
|---------|--------|
| Bỏ absolute layout được chấp nhận? | Stakeholder OK section flow |
| Preview = Publish? | `<Render>` khớp editor preview |
| Bundle size | < ~200KB gzip thêm (lazy route) |
| DevEx | Team thích config-driven hơn maintain Canvas |

**No-go:** Spike fail → giữ VisualEditor, chỉ cải thiện `htmlToBlocks` converter trong editor cũ.

---

## 5. Phase 2B — Puck config đầy đủ (2 tuần)

### Mapping BlockType → Puck Component

| BlockType hiện tại | Puck component | Priority |
|--------------------|----------------|----------|
| `hero` | `Hero` | P0 |
| `text` | `Text` | P0 |
| `image` | `Image` | P0 |
| `button` | `Button` | P0 |
| `form_capture` | `FormCapture` | P0 |
| `columns` | `Columns` (slots) | P0 |
| `html_code` | `RawHtml` | P0 |
| `feature_card` | `FeatureCard` | P1 |
| `testimonial` | `Testimonial` | P1 |
| `gallery` | `Gallery` | P1 |
| `carousel` | `Carousel` | P1 |
| `tabs` | `Tabs` | P1 |
| `accordion` | `Accordion` | P1 |
| `divider` | `Divider` | P1 |
| `spacer` | `Spacer` | P1 |
| `countdown` | `Countdown` | P2 |
| `video` | `Video` | P2 |
| `menu` | `Menu` | P2 |
| `product_card` | `ProductCard` | P2 |
| `collection_list` | `CollectionList` | P2 |
| `tea_landing` | `TeaLanding` (composite) | P2 |
| `smartwatch_landing` | `SmartwatchLanding` | P2 |
| `funnel_popup` | `FunnelPopup` + hydrate | P2 |
| `chat_widget` | `ChatWidget` | P2 |
| `survey` | `Survey` | P2 |
| `table` | `Table` | P2 |

### PR-P1: `landing-puck-config.ts`

Mỗi component theo pattern Puck:

```typescript
Hero: {
  fields: {
    headline: { type: 'textarea' },
    subheadline: { type: 'textarea' },
    ctaText: { type: 'text' },
    ctaUrl: { type: 'text' },
    bgImage: { type: 'text' },
  },
  defaultProps: { headline: 'Tiêu đề', ... },
  render: ({ headline, subheadline, ctaText, ctaUrl }) => (
    <section>...</section>
  ),
}
```

**Slots** cho `Columns`, `Tabs`:

```typescript
Columns: {
  fields: { columns: { type: 'number', min: 1, max: 4 } },
  render: ({ columns, puck: { renderDropZone } }) => ( ... ),
}
```

### Sprint breakdown

| Sprint | Components | Effort |
|--------|------------|--------|
| P0 | Hero, Text, Image, Button, FormCapture, Columns, RawHtml | 1 tuần |
| P1 | Feature, Testimonial, Gallery, Carousel, Tabs, Accordion, Divider, Spacer | 1 tuần |
| P2 | Widgets, composites, funnel, chat | 1 tuần (optional parallel) |

---

## 6. Phase 2C — Database & dual-read (1 tuần)

### PR-P2: Migration Supabase

**File:** `supabase/migrations/YYYYMMDDHHMMSS_landing_puck_data.sql`

```sql
ALTER TABLE landing_pages
  ADD COLUMN IF NOT EXISTS puck_data JSONB,
  ADD COLUMN IF NOT EXISTS editor_engine VARCHAR(20) DEFAULT 'legacy';
  -- 'legacy' | 'puck'

ALTER TABLE landing_page_templates
  ADD COLUMN IF NOT EXISTS puck_data JSONB;

ALTER TABLE landing_page_versions
  ADD COLUMN IF NOT EXISTS puck_data JSONB;
```

### PR-P3: Feature flag + resolver

**Env:**

```env
NEXT_PUBLIC_EDITOR_ENGINE=auto   # auto | puck | legacy
LANDING_AI_OUTPUT_FORMAT=puck    # BE: legacy | puck (sau cutover)
```

**File:** `src/features/landing-puck/resolve-editor-engine.ts`

---

## 7. Phase 2D — Data migrator (1–2 tuần)

### PR-P4: `editor_data` → `puck_data`

**Tạo:** `src/features/landing-puck/migrators/editor-to-puck.migrator.ts`

Logic:

```
walk editor_data.sections[]
  → map BlockType + props → Puck content item
  → nested children → zones / slots
  → frame x/y/w/h → BỎ (flow layout) hoặc lưu props.style tạm
  → pageSettings → root.props
```

**Lưu ý:** Absolute positioning **không port 1:1**. Cần document breaking change cho pages đã thiết kế pixel-perfect.

### PR-P5: Template seed migration

**Script:** `scripts/migrate-templates-to-puck.ts`

- Input: `template-seed-data.ts` (26 templates)
- Output: upsert `landing_page_templates.puck_data`
- Verify: preview Puck ≈ `TemplateUiPreview` hiện tại

### PR-P6: Page migration batch

**Script:** `scripts/migrate-pages-to-puck.ts`

- Batch `landing_pages` where `editor_engine='legacy'`
- Idempotent; log failures to file
- Pages AI (`generation_meta.generationSource`) → ưu tiên convert từ `ai_source_html`

---

## 8. Phase 2E — HTML → Puck (AI path) (1 tuần)

### PR-P7: `htmlToPuckData()` — 3 levels

**Tạo:** `liora-monorepo/.../converters/html-to-puck.converter.ts`

| Level | Input | Output | Dùng khi |
|-------|-------|--------|----------|
| **L1 Raw** | Full HTML | 1 component `RawHtml` | Fallback nhanh |
| **L2 Parse** | DOM sections | Hero + Text + Button + Form blocks | **Default** |
| **L3 LLM** | HTML + Puck schema | Puck Data JSON | Quality cao (optional, tốn token) |

**L2 reuse:** port logic từ `features/landing-pages/import/html-to-landing-schema.ts` → map sang Puck `Data`.

### PR-P8: Update AI processor

**File:** `landing-ai-generate.processor.ts`

```typescript
if (process.env.LANDING_AI_OUTPUT_FORMAT === 'puck') {
  const puckData = HtmlToPuckConverter.fromHtml(html, meta)
  await storage.upsert({ puckData, editorEngine: 'puck', ... })
} else {
  // Plan 1 legacy path
  await storage.upsert({ editorData, ... })
}
```

Rollback: đổi env, không sửa s2c client.

---

## 9. Phase 2F — Publish & Public renderer (1 tuần)

### PR-P9: Puck publish flow

Thay `renderLandingPageHtml()`:

```typescript
import { Render } from '@measured/puck'
import { renderToString } from 'react-dom/server'

const body = renderToString(
  <Render config={landingPuckConfig} data={puckData} />
)
const html = wrapHtmlDocument(body, puckData.root.props)
await publishLandingPage(pageId, html)
```

**Hoặc** (preferred long-term): bỏ `published_html`, SSR trực tiếp từ `puck_data` tại `/p/[slug]`.

### PR-P10: Public route

**File:** `app/p/[slug]/page.tsx`

```typescript
if (page.editor_engine === 'puck' && page.puck_data) {
  return <PuckPublicRenderer data={page.puck_data} />
}
// legacy fallback
return <RawHtmlPage html={page.published_html} />
```

---

## 10. Phase 2G — Editor cutover (1 tuần)

### PR-P11: Builder route switch

**File:** `app/builder/[id]/page.tsx` (hoặc `LandingEditorPageClient`)

```typescript
const engine = resolveEditorEngine(page)
if (engine === 'puck') return <PuckEditorPage pageId={id} />
return <LandingEditorPageClient pageId={id} />
```

### PR-P12: Deprecate legacy (sau 2–4 tuần dual-run)

**Archive / xóa:**

| File | Lý do |
|------|-------|
| `editor/VisualEditor.tsx` | Thay bởi Puck |
| `editor/Canvas.tsx` | Puck built-in |
| `editor/InspectorPanel.tsx` (phần duplicate) | Puck sidebar |
| `editor/core/editor-export-html.ts` | Puck `<Render>` |
| `react-dnd` dependency | Nếu không dùng elsewhere |

**Giữ tạm:**

- `editor-migration.ts` — đọc pages legacy
- `editor-to-puck.migrator.ts`
- `editor_data` column — backup 90 ngày

---

## 11. Phase 2H — AI Copilot (optional, +1–2 tuần)

### PR-P13: `landing-ai-update` processor

- Register worker `landing-ai-update`
- `generationType: 'update'` qua s2c
- Input: current `puck_data` serialized + user prompt
- Output: patched `puck_data`

### PR-P14: AI panel trong Puck

- Port `ai-command-registry` → mutate Puck data via `dispatch`
- Sidebar chat trong `PuckEditorPage`

---

## 12. Timeline & thứ tự PR

| Phase | Effort | PRs | Dependency |
|-------|--------|-----|------------|
| 2A Spike | 3–5 ngày | PR-P0 | Plan 1 stable |
| 2B Puck config | 2 tuần | PR-P1 | 2A go |
| 2C DB + flag | 1 tuần | PR-P2, PR-P3 | 2B P0 |
| 2D Migrator | 1–2 tuần | PR-P4 → PR-P6 | 2C |
| 2E AI → Puck | 1 tuần | PR-P7, PR-P8 | 2B P0 |
| 2F Publish | 1 tuần | PR-P9, PR-P10 | 2B |
| 2G Cutover | 1 tuần | PR-P11, PR-P12 | 2D + 2F |
| 2H Copilot | 1–2 tuần | PR-P13, PR-P14 | 2G |
| **Tổng** | **~8–12 tuần** | | |

### Thứ tự PR đề xuất

```
PR-P0   POC /builder-puck/[id]
PR-P1   puck config P0 components
PR-P2   DB migration puck_data
PR-P3   feature flag
PR-P1   puck config P1/P2 components
PR-P4   editor→puck migrator
PR-P5   template seed script
PR-P7   htmlToPuckData L1/L2
PR-P8   AI processor puck output
PR-P9   publish via Render
PR-P10  public route dual
PR-P6   batch page migration
PR-P11  builder route switch
PR-P12  deprecate VisualEditor
PR-P13  AI update processor (optional)
PR-P14  AI copilot panel (optional)
```

---

## 13. Rủi ro & mitigation

| Rủi ro | Mitigation |
|--------|------------|
| Mất absolute layout | POC 2A + communicate; lưu `editor_data` backup |
| Migrate pages hỏng | Dual-run; script idempotent; rollback flag |
| AI HTML convert kém | L3 LLM optional; giữ `RawHtml` fallback |
| Bundle size Puck | Lazy load `/builder` route |
| Widget hydrate (funnel, chat) | Client components trong Puck render |
| Template preview lệch | Visual diff 26 templates trước cutover |

---

## 14. So sánh trước / sau

| Tiêu chí | Visual Editor (hiện tại) | Puck (sau migrate) |
|----------|--------------------------|-------------------|
| Data | `editor_data` JSONB | `puck_data` JSONB |
| Layout | Absolute (Onlook) | Flow + slots |
| Editor maintain | ~10 core files, duplicate render | Config-driven |
| Publish | `renderLandingPageHtml()` string | `<Render>` React |
| AI output | `html_code` blob | Editable blocks |
| Public `/p/[slug]` | `published_html` raw | Puck SSR hoặc cache |
| Docs alignment | Lệch `structure.md` | Khớp kiến trúc docs |

---

## 15. File paths tham chiếu

| Mục đích | Path |
|----------|------|
| Visual Editor | `src/components/landing-pages/editor/VisualEditor.tsx` |
| Block types | `src/components/landing-pages/editor/types.ts` |
| Block registry | `src/components/landing-pages/editor/core/block-registry.ts` |
| Export HTML | `src/components/landing-pages/editor/core/editor-export-html.ts` |
| Template seed | `src/components/landing-pages/templates/template-seed-data.ts` |
| HTML import (reuse L2) | `src/features/landing-pages/import/html-to-landing-schema.ts` |
| Public page | `src/app/p/[slug]/page.tsx` |
| Puck docs nội bộ | `docs/PUCK_COMPONENTS.md` |
| AI processor | `liora-monorepo/.../landing-ai/processors/landing-ai-generate.processor.ts` |
| Docs kiến trúc | `liora-monorepo/docs/landing/structure.md` |

---

## 16. Liên kết

- [LANDING-AI-S2C-SHIP.md](./LANDING-AI-S2C-SHIP.md) — Plan 1 ship AI trước
- [LANDING-PAGES-INTEGRATION.md](./LANDING-PAGES-INTEGRATION.md) — billing, permission
- [docs/PUCK_COMPONENTS.md](../docs/PUCK_COMPONENTS.md) — spec components (viết cho Puck, chưa implement)