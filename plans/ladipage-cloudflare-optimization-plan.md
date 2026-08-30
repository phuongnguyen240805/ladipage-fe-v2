# PLAN TRIỂN KHAI TỐI ƯU `ladipage-fe-v2` CHO CLOUDFLARE FREE

> Mục tiêu: giảm tải source, giảm payload/template, tách media và landing-template assets sang Cloudflare R2/CDN, giữ nguyên tối đa cấu trúc ứng dụng hiện tại và không chỉnh sửa các phần không liên quan.

---

## 1. Mục tiêu tổng thể

### Mục tiêu kỹ thuật

- Giữ nguyên kiến trúc chính: `src/app/`, `src/components/`, `src/features/`, routing, UI/UX và business logic hiện tại.
- Không chuyển dự án sang monorepo mới.
- Không refactor các module không liên quan.
- Tách khỏi source các asset nặng: ảnh, video, sprite, font, landing template assets, `editor_data` lớn.
- Đưa asset nặng sang Cloudflare R2 + custom CDN domain.
- Giảm kích thước API danh sách template.
- Không inline toàn bộ CSS/JS của template vào `editor_data`.
- Lazy-load dependency nặng và dọn dependency thừa.
- Giảm nguy cơ vượt giới hạn Cloudflare Free.
- Giữ local development đơn giản và có fallback local.

---

## 2. Baseline từ dữ liệu đã phân tích

| Thành phần | Kích thước xấp xỉ |
|---|---:|
| Source sau giải nén | ~109 MB |
| `public/` | ~69 MB |
| `src/` | ~16 MB |
| `.cf-dry/` | ~16 MB |
| `agent-tools/` | ~3.6 MB |
| `terminals/` | ~0.7 MB |
| Static files trong `public/` | ~641 files |
| Worker raw | ~6.64 MB |
| Worker gzip | ~0.81 MB |

### Các điểm nặng chính

1. `src/components/landing-pages/templates/bedimcode-seed-data.generated.json` khoảng 1.93 MB.
2. Một số template lớn: Delivery ~721 KB; Islands Travel ~235 KB; Travel ~210 KB; Watches ~207 KB; Halloween ~200 KB; Christmas ~189 KB.
3. HTML/CSS/JS template đang bị inline vào `editor_data`.
4. API danh sách template có nguy cơ trả luôn `editor_data` thay vì metadata-only.
5. `public/` có khoảng 116 nhóm file duplicate, tổng khoảng 12 MB.
6. `public/education/images` có nhiều ảnh trùng với `public/images`.
7. Một số sprite dạng `*-1`, `*-2`, `*-3` có nội dung giống nhau.
8. `.cf-dry`, `agent-tools`, `terminals` không nên nằm trong artifact deploy/repository production.
9. `.npmrc` có `store-dir=D:/pnpm-store-win`, không phù hợp môi trường Linux/Cloudflare build.
10. `public/templates/bedimcode` chứa source assets như SCSS không cần cho runtime.

---

## 3. Kiến trúc mục tiêu

```text
                    CLOUDFLARE
+------------------------------------------+
| Worker / OpenNext                        |
| - Next.js app                            |
| - Auth                                   |
| - Routing                                |
| - API nhẹ                                |
| - Landing routing                        |
|                                          |
| Static Assets                            |
| - Next JS chunks                         |
| - App CSS                                |
| - favicon / icon / UI asset nhỏ          |
+---------------------+--------------------+
                      |
                      v
+------------------------------------------+
| Cloudflare R2                            |
| cdn.domain.com                           |
|                                          |
| - images/                                |
| - videos/                                |
| - sprites/                               |
| - fonts/                                 |
| - templates/bedimcode/...                |
+------------------------------------------+
```

### Cấu trúc source đề xuất

```text
ladipage-fe-v2/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   └── lib/
│       └── cdn/
│           ├── config.ts
│           ├── asset-url.ts
│           └── template-url.ts
├── public/
│   ├── favicon.ico
│   ├── icons/
│   ├── logo/
│   └── ui/
├── scripts/
│   ├── optimize-assets.ts
│   ├── upload-assets-r2.ts
│   └── build-template-metadata.ts
├── package.json
└── wrangler.jsonc
```

---

## 4. Nguyên tắc triển khai

- Không refactor module không liên quan.
- Không thay layout UI nếu không bắt buộc.
- Không thay responsive hiện tại.
- Không sửa CSKH, education, auth nếu không liên quan trực tiếp.
- Không đổi route nếu không bắt buộc.
- Mỗi phase phải build/test độc lập.
- Mỗi phase phải có rollback.
- Không xóa asset local trước khi CDN đã được xác minh.
- Không nâng version vendor library trong cùng đợt migration CDN.
- Không chuyển React/Next/core dependency sang CDN script.
- Mọi URL CDN phải đi qua helper/config chung, không hardcode rải rác.

---

# PHASE 0 - BASELINE & BACKUP

## Mục tiêu

Có baseline chính xác trước khi sửa để đo before/after và rollback.

## Checklist

### Git

- [ ] Tạo branch `optimize/cloudflare-r2-cdn`.
- [ ] Commit trạng thái hiện tại.
- [ ] Tạo tag `before-cf-optimization` nếu cần.

### Đo baseline

- [ ] Build production hiện tại.
- [ ] Ghi thời gian build.
- [ ] Ghi kích thước `.open-next` / `.cf-dry`.
- [ ] Ghi raw/gzip Worker size.
- [ ] Ghi kích thước `public/`.
- [ ] Ghi số file trong `public/`.
- [ ] Ghi payload `/api/templates/list`.
- [ ] Ghi thời gian mở trang landing template.
- [ ] Ghi thời gian load template detail/editor.

## Acceptance Criteria

- [ ] Có commit/tag rollback.
- [ ] Có số liệu baseline rõ ràng.
- [ ] Có log build trước tối ưu.

---

# PHASE 1 - CLEANUP SOURCE & BUILD CONFIG

## Mục tiêu

Loại local/build artifacts và cấu hình phụ thuộc Windows trước khi tối ưu runtime.

## Thay đổi

### `.gitignore`

```gitignore
.cf-dry/
.open-next/
agent-tools/
terminals/
build-output.txt
*.log
```

### `.npmrc`

Bỏ:

```ini
store-dir=D:/pnpm-store-win
```

Giữ các cấu hình cross-platform thực sự cần, ví dụ:

```ini
node-linker=hoisted
```

## Checklist

- [ ] `.cf-dry` không còn tracked.
- [ ] `.open-next` bị ignore.
- [ ] `agent-tools` local-only.
- [ ] `terminals` local-only.
- [ ] Không còn Windows absolute path trong project config.
- [ ] Kiểm tra `allowBuilds` và `msw` config.
- [ ] `pnpm install --frozen-lockfile` chạy thành công.
- [ ] Build Windows thành công.
- [ ] Build Linux/CI/Cloudflare thành công.

## Acceptance Criteria

- [ ] Repo/source sạch hơn.
- [ ] Không phụ thuộc `D:/...`.
- [ ] Không thay runtime/UI.

---

# PHASE 2 - MEDIA AUDIT & DEDUPLICATION

## Mục tiêu

Giảm khoảng 12 MB duplicate đã phát hiện trước khi upload R2.

## Checklist

- [ ] Hash toàn bộ `public/`.
- [ ] Lập danh sách duplicate theo SHA/hash.
- [ ] Phân loại image/sprite/font/video/template duplicate.
- [ ] Ưu tiên `public/education/images`.
- [ ] Ưu tiên `public/images`.
- [ ] Ưu tiên `public/sprites`.
- [ ] Map URL cũ -> URL canonical.
- [ ] Update source reference trước khi xóa file.
- [ ] Build và test UI.
- [ ] Chỉ xóa file khi hash giống và runtime purpose tương đương.

Ví dụ nếu các file dưới giống hệt nhau:

```text
14-D-1.png
14-D-2.png
14-D-3.png
```

thì chuẩn hóa về:

```text
sprites/14-D.png
```

## Acceptance Criteria

- [ ] Phần lớn ~12 MB duplicate được loại bỏ.
- [ ] Không có 404.
- [ ] Không vỡ landing/editor/education.

---

# PHASE 3 - THIẾT LẬP CLOUDFLARE R2/CDN

## Mục tiêu

Tạo kho asset production độc lập khỏi Worker.

## Đề xuất

Bucket:

```text
ladipage-assets
```

Cấu trúc:

```text
ladipage-assets/
├── images/
├── videos/
├── sprites/
├── fonts/
└── templates/
    └── bedimcode/
```

Custom domain:

```text
cdn.domain.com
```

ENV:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.domain.com
LANDING_ASSET_BASE_URL=https://cdn.domain.com
```

## Cache policy

Asset immutable/versioned:

```text
Cache-Control: public, max-age=31536000, immutable
```

Template metadata/editor JSON giai đoạn đầu:

```text
Cache-Control: public, max-age=300
```

hoặc version theo path:

```text
templates/v1/...
templates/v2/...
```

## Checklist

- [ ] Tạo R2 bucket.
- [ ] Cấu hình custom domain.
- [ ] HTTPS hoạt động.
- [ ] Test public GET.
- [ ] Cấu hình CORS cho production/staging/localhost cần thiết.
- [ ] Kiểm tra MIME/Content-Type.
- [ ] Kiểm tra cache header.

## Acceptance Criteria

- [ ] CDN load asset ổn định.
- [ ] Production không phụ thuộc `r2.dev`.
- [ ] Có cache.
- [ ] Có phương án fallback local.

---

# PHASE 4 - CDN ABSTRACTION LAYER

## Mục tiêu

Không hardcode CDN URL ở hàng trăm component.

## File mới

```text
src/lib/cdn/config.ts
src/lib/cdn/asset-url.ts
src/lib/cdn/template-url.ts
```

Ví dụ helper:

```ts
export function assetUrl(path: string) {
  if (!path) return path;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const base =
    process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/$/, "") || "";

  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return `${base}/${path.replace(/^\/+/, "")}`;
}
```

## Checklist

- [ ] Relative URL -> CDN URL ở production.
- [ ] Absolute URL giữ nguyên.
- [ ] `data:` giữ nguyên trong quá trình migration.
- [ ] ENV trống -> fallback local.
- [ ] Không hardcode domain ở component.

## Acceptance Criteria

- [ ] Đổi CDN domain chỉ bằng ENV.
- [ ] Local dev vẫn chạy.
- [ ] Không phải sửa kiến trúc component lớn.

---

# PHASE 5 - DI CHUYỂN MEDIA NẶNG LÊN R2

## Move trước

```text
public/templates/bedimcode/*
public/images/landing/*
public/images/banner/*
public/images/carousel/*
public/images/product/*
public/images/grid-image/*
public/sprites/*
public/videos/*
```

## Giữ local

```text
favicon
app icon
logo nhỏ
manifest
robots.txt
UI asset rất nhỏ
```

## Quy trình bắt buộc

```text
copy -> upload -> verify CDN -> update reference -> build -> test -> remove local
```

Không làm:

```text
delete local -> upload sau
```

## Checklist

- [ ] Upload ảnh.
- [ ] Upload video.
- [ ] Upload sprite.
- [ ] Upload font.
- [ ] Verify MIME type.
- [ ] Verify CDN URL.
- [ ] Verify cache header.
- [ ] Update source reference.
- [ ] Check browser console.
- [ ] Check Network 404/CORS.

## Acceptance Criteria

- [ ] `public/` giảm rõ rệt.
- [ ] Không mất media.
- [ ] Không CORS/mixed-content error.
- [ ] Không layout shift bất thường.

---

# PHASE 6 - TÁCH TEMPLATE METADATA VÀ EDITOR DATA

## Mục tiêu

Không tải toàn bộ HTML/CSS/JS của tất cả template khi chỉ mở gallery.

## Hiện trạng cần loại bỏ

```text
GET /api/templates/list
    -> select("*")
    -> metadata + editor_data
```

## Mục tiêu

```text
GET /api/templates/list
    -> metadata only
```

Response ví dụ:

```json
{
  "id": "travel",
  "name": "Travel",
  "thumbnail_url": "https://cdn.domain.com/...",
  "preview_url": "https://cdn.domain.com/...",
  "editor_data_url": "https://cdn.domain.com/templates/bedimcode/travel/editor-data.json"
}
```

Khi user chọn template:

```text
click template
    -> fetch editor_data_url
    -> load editor
```

## Checklist API

- [ ] Sửa `src/app/api/templates/list/route.ts`.
- [ ] `/list` không `select("*")`.
- [ ] Không trả `editor_data`.
- [ ] Chỉ trả field cần thiết.
- [ ] Có `editor_data_url`.
- [ ] Có `thumbnail_url`.
- [ ] Có `preview_url` nếu cần.

## Checklist frontend

- [ ] Gallery chỉ load metadata.
- [ ] Chỉ fetch editor data khi user chọn.
- [ ] Có loading state.
- [ ] Có error fallback.
- [ ] Cache editor data đã fetch trong session nếu phù hợp.

## Acceptance Criteria

- [ ] Payload `/api/templates/list` giảm mạnh.
- [ ] Không tải full 12 template cùng lúc.
- [ ] Editor vẫn hoạt động như cũ.

---

# PHASE 7 - TÁCH CSS/JS KHỎI `editor_data`

## Mục tiêu

Loại bỏ cơ chế inline CSS/JS làm JSON phình lớn.

## Hiện tại

```text
inlineStylesheets()
inlineScripts()
```

khiến:

```html
<link href="styles.css">
```

thành full `<style>...</style>`, và JS local thành full `<script>...</script>`.

## Mục tiêu

```html
<link rel="stylesheet"
      href="https://cdn.domain.com/templates/bedimcode/travel/assets/css/styles.css">
```

```html
<script src="https://cdn.domain.com/templates/bedimcode/travel/assets/js/main.js"></script>
```

## Checklist

- [ ] Sửa `build-bedimcode-editor-data.ts`.
- [ ] Không inline stylesheet local.
- [ ] Không inline JS local.
- [ ] Rewrite relative asset path sang CDN.
- [ ] Giữ nguyên HTML structure.
- [ ] Test CSS.
- [ ] Test JS interaction.
- [ ] Test image/font path.
- [ ] Test editor load/save.

## Acceptance Criteria

- [ ] `bedimcode-seed-data.generated.json` giảm mạnh hoặc không còn chứa full runtime code.
- [ ] Template visual/interaction giống bản cũ.
- [ ] Editor không regression.

---

# PHASE 8 - LOẠI SOURCE ASSET KHÔNG CẦN RUNTIME

## Loại khỏi runtime

```text
*.scss
*.map
README*
source/
docs/
examples/
```

## Giữ runtime

```text
*.html
*.css
*.js
*.png
*.jpg
*.jpeg
*.webp
*.svg
*.gif
*.mp4
*.woff
*.woff2
```

## Checklist

- [ ] Sửa `fetch-bedimcode-templates.ts`.
- [ ] Không copy/download SCSS.
- [ ] Không copy source map nếu production không cần.
- [ ] Không copy README/docs/examples.
- [ ] Build/test toàn bộ template.

## Acceptance Criteria

- [ ] Template runtime nhẹ hơn.
- [ ] Không mất file cần cho browser.

---

# PHASE 9 - CDN HÓA VENDOR LIBRARY CỦA TEMPLATE

## Có thể đưa ra CDN

- Swiper
- GSAP
- ScrollReveal
- Rellax
- Boxicons
- RemixIcon

## Không chuyển sang CDN script

- React
- ReactDOM
- Next.js
- Zustand
- Zod
- Supabase client
- TanStack
- React DnD
- app core dependencies

## Nguyên tắc

Pin đúng version template hiện dùng. Không nâng version trong cùng migration.

Ví dụ đang dùng Swiper 6.6.2 thì vẫn dùng Swiper 6.6.2 trên CDN.

## Checklist

- [ ] Inventory vendor library.
- [ ] Inventory version.
- [ ] Pin version.
- [ ] Replace local vendor path.
- [ ] Test interaction từng template.
- [ ] Không remove vendor local trước khi xác minh.

## Acceptance Criteria

- [ ] Không duplicate vendor JS giữa các template.
- [ ] Không phá CSS/API compatibility.

---

# PHASE 10 - MEDIA UPLOAD DIRECT TO R2

## Mục tiêu

Không upload file lớn xuyên qua Next Worker và không fallback Base64.

## Kiến trúc

```text
Browser
   -> request presigned URL
Next API
   -> R2 signed PUT URL
Browser
   -> upload trực tiếp R2
R2
   -> trả CDN URL
```

## Cần loại bỏ ở production

```text
data:image/...;base64,...
```

Base64 làm dữ liệu tăng khoảng 33% và làm HTML/editor JSON phình lớn.

## Checklist

- [ ] API tạo signed upload URL.
- [ ] Browser upload trực tiếp R2.
- [ ] Validate MIME.
- [ ] Validate file size.
- [ ] Generate unique object key.
- [ ] Return CDN URL.
- [ ] Bỏ base64 fallback trong production.
- [ ] Có retry/error state.
- [ ] Test image upload.
- [ ] Test video upload.

## Acceptance Criteria

- [ ] File lớn không đi qua Worker body.
- [ ] Media URL là CDN URL.
- [ ] Không còn base64 fallback production.

---

# PHASE 11 - DEPENDENCY OPTIMIZATION

## `jszip`

Đổi static import sang lazy import khi user thực sự import ZIP:

```ts
const { default: JSZip } = await import("jszip");
```

- [ ] JSZip không vào initial bundle route không cần.
- [ ] ZIP import vẫn hoạt động.

## `tsparticles`

Đánh giá:

```text
loadFull -> @tsparticles/slim
```

hoặc CSS animation nếu đủ.

- [ ] So sánh feature cần dùng.
- [ ] Test animation sau thay đổi.

## `pixi.js`

- [ ] Lazy-load module dùng Pixi.
- [ ] Không import Pixi ở root/layout.

## FullCalendar

- [ ] Lazy-load calendar route/component.

## `socket.io-client`

- [ ] Chỉ load khi mở module CSKH/realtime.

## Package nghi ngờ không dùng - phải xác minh trước khi remove

```text
@fullcalendar/list
@react-jvectormap/core
@react-jvectormap/world
@stripe/react-stripe-js
@stripe/stripe-js
qrcode.react
swiper
```

Checklist remove:

- [ ] Search static import.
- [ ] Search dynamic import.
- [ ] Search `require`.
- [ ] Remove từng nhóm nhỏ.
- [ ] Build/test sau mỗi nhóm.

## Acceptance Criteria

- [ ] Không remove dependency đang dùng gián tiếp.
- [ ] Route chính nhẹ hơn.
- [ ] Build thành công.

---

# PHASE 12 - IMAGE OPTIMIZATION

## Quy tắc

Photo:

```text
WebP / AVIF
```

Icon/logo:

```text
SVG
```

Giữ PNG khi thực sự cần transparency/pixel fidelity.

## Checklist

- [ ] Inventory file > 500 KB.
- [ ] Inventory file > 1 MB.
- [ ] Convert JPEG/PNG phù hợp sang WebP/AVIF.
- [ ] Không upscale.
- [ ] Giữ chất lượng visual chấp nhận được.
- [ ] Có width/height để giảm CLS.
- [ ] Lazy-load ảnh below-the-fold.
- [ ] Xem xét responsive variants 320/640/960/1280/1920 nếu cần.

## Acceptance Criteria

- [ ] Image transfer giảm.
- [ ] LCP cải thiện.
- [ ] Không vỡ transparency/layout.

---

# PHASE 13 - VIDEO OPTIMIZATION

## Checklist

- [ ] Chuyển video lớn sang R2.
- [ ] Không preload toàn bộ video.
- [ ] Dùng `preload="metadata"` hoặc `preload="none"`.
- [ ] Có poster image.
- [ ] Lazy-load video.
- [ ] Không autoplay video lớn nếu không cần.

## Optional

Nếu video trở thành tính năng lớn cần adaptive streaming, đánh giá Cloudflare Stream ở phase sau.

## Acceptance Criteria

- [ ] Không còn video lớn trong deployment chính.
- [ ] Page load không tải video chưa cần.

---

# PHASE 14 - BUILD & ROUTE OPTIMIZATION

## Mục tiêu

Giảm code chạy tại Worker và initial client load.

## Checklist

- [ ] Phân loại route: static/dynamic/SSR/API/admin/landing/CSKH/education.
- [ ] Liệt kê route SSR hiện tại.
- [ ] Xác định route có thể static.
- [ ] Không SSR khi không cần.
- [ ] Không import dependency nặng tại root layout.
- [ ] Không import full template dataset global/server startup.
- [ ] Không fetch DB nếu page không cần.
- [ ] Kiểm tra route CPU cao.

## Acceptance Criteria

- [ ] Initial request CPU giảm hoặc không tăng.
- [ ] Route phụ không làm nặng root bundle.
- [ ] Không thay business behavior.

---

# PHASE 15 - CLOUDFLARE DEPLOYMENT VALIDATION

## Build checklist

- [ ] `pnpm install --frozen-lockfile`.
- [ ] `pnpm build`.
- [ ] OpenNext build.
- [ ] Wrangler dry run.
- [ ] Đo raw Worker.
- [ ] Đo gzip Worker.
- [ ] Đếm static assets.
- [ ] Kiểm tra file static lớn nhất.

## Runtime smoke tests

- [ ] Home.
- [ ] Login.
- [ ] Dashboard.
- [ ] Landing list.
- [ ] Template preview.
- [ ] Landing editor.
- [ ] Landing publish.
- [ ] Image upload.
- [ ] Video load.
- [ ] CSKH.
- [ ] Education.
- [ ] API route quan trọng.

## Browser checks

- [ ] No 404.
- [ ] No 500.
- [ ] No CORS.
- [ ] No hydration error.
- [ ] No CSP error.
- [ ] No mixed-content.
- [ ] No missing font/image/script.

## Acceptance Criteria

- [ ] Deploy thành công.
- [ ] Worker gzip trong giới hạn plan.
- [ ] Flow chính không CPU timeout.
- [ ] Media thực sự load từ CDN/R2.
- [ ] Không regression chức năng.

---

# PHASE 16 - PERFORMANCE QA

## Bảng before/after

| Metric | Baseline | Sau tối ưu |
|---|---:|---:|
| Repo/source size | | |
| `public/` size | | |
| Worker gzip | | |
| Template list payload | | |
| Landing first load | | |
| Template detail load | | |
| Image transfer | | |
| JS transfer | | |
| Build time | | |

## Checklist

- [ ] LCP.
- [ ] CLS.
- [ ] INP.
- [ ] JS transfer.
- [ ] Image transfer.
- [ ] Request count.
- [ ] Template list không tải editor data.
- [ ] Template load on demand.
- [ ] CDN CSS/JS có cache hit.

---

# PHASE 17 - ROLLBACK STRATEGY

## CDN rollback

Nếu helper hỗ trợ fallback:

```env
NEXT_PUBLIC_CDN_BASE_URL=
```

-> quay về local asset trong giai đoạn chuyển đổi.

## Template rollback

Giữ bản cũ trong tag/branch cho tới khi staging và production smoke test pass.

## Checklist

- [ ] Có Git tag.
- [ ] Có branch migration.
- [ ] Có asset mapping cũ -> mới.
- [ ] Có ENV rollback.
- [ ] Không xóa local asset trước khi production pass.
- [ ] Có DB rollback nếu schema template thay đổi.

---

# 5. Thứ tự ưu tiên triển khai

## P0 - Làm ngay

- [ ] Baseline.
- [ ] `.gitignore`.
- [ ] `.npmrc`.
- [ ] Bỏ build/local artifacts.
- [ ] Duplicate scan.
- [ ] Tạo R2 bucket.
- [ ] Tạo CDN abstraction layer.

## P1 - Hiệu quả lớn / rủi ro thấp

- [ ] Move ảnh/video/sprite lớn sang R2.
- [ ] Dedupe media.
- [ ] Cấu hình `LANDING_ASSET_BASE_URL`.
- [ ] `/api/templates/list` metadata-only.
- [ ] Lazy-load editor data.

## P2 - Tối ưu landing template

- [ ] Tách `editor-data.json` từng template.
- [ ] Không inline CSS.
- [ ] Không inline JS.
- [ ] Bỏ SCSS/source khỏi runtime.
- [ ] CDN hóa vendor library template.

## P3 - Runtime optimization

- [ ] Direct upload R2.
- [ ] Bỏ base64 fallback.
- [ ] JSZip lazy-load.
- [ ] tsParticles slim nếu phù hợp.
- [ ] Pixi lazy-load.
- [ ] FullCalendar lazy-load.
- [ ] Socket.IO lazy-load.

## P4 - Tối ưu sâu

- [ ] Image transformation.
- [ ] Route audit.
- [ ] SSR reduction.
- [ ] Bundle analyzer.
- [ ] Cloudflare CPU tuning.
- [ ] Cache policy nâng cao.

---

# 6. Checklist tổng hợp cuối dự án

## Repository

- [ ] `.cf-dry` removed from Git.
- [ ] `.open-next` ignored.
- [ ] local tools ignored.
- [ ] logs ignored.
- [ ] Windows pnpm store path removed.

## Media

- [ ] Duplicate removed.
- [ ] Images optimized.
- [ ] Videos moved.
- [ ] Sprites deduplicated.
- [ ] Fonts audited.
- [ ] CDN URLs verified.

## Cloudflare

- [ ] R2 created.
- [ ] Custom domain configured.
- [ ] Cache policy configured.
- [ ] CORS configured.
- [ ] Production ENV configured.

## Landing templates

- [ ] Metadata separated.
- [ ] Editor data lazy-loaded.
- [ ] CSS externalized.
- [ ] JS externalized.
- [ ] SCSS removed from runtime.
- [ ] Template media on R2.
- [ ] Vendor libraries deduplicated.

## Application

- [ ] UI unchanged.
- [ ] Routes unchanged where possible.
- [ ] Customer-care unaffected.
- [ ] Education unaffected.
- [ ] Responsive unaffected.
- [ ] Editor unaffected.

## Dependencies

- [ ] JSZip lazy.
- [ ] Pixi lazy.
- [ ] FullCalendar lazy.
- [ ] Socket.IO lazy.
- [ ] tsParticles reviewed.
- [ ] Unused packages removed safely.

## Deployment

- [ ] Production build passes.
- [ ] OpenNext build passes.
- [ ] Wrangler dry run passes.
- [ ] Worker gzip measured.
- [ ] Asset count measured.
- [ ] API smoke tests pass.
- [ ] CDN smoke tests pass.

---

# 7. Definition of Done

Dự án được xem là hoàn thành tối ưu Cloudflare khi:

1. Source không còn chứa phần lớn media/template runtime nặng.
2. `public/` chỉ giữ UI/system asset cần thiết.
3. Landing template list không trả `editor_data`.
4. Editor data chỉ tải khi người dùng chọn template.
5. CSS/JS template không còn bị inline toàn bộ.
6. Image/video/sprite/font lớn nằm trên Cloudflare R2/CDN.
7. Không còn base64 fallback cho media production.
8. Không còn local Windows path trong build config.
9. Worker bundle nằm trong giới hạn Cloudflare plan đang sử dụng.
10. Login/dashboard/landing/editor/publish/upload/CSKH/education đều hoạt động.
11. Không thay đổi UI/layout ngoài phạm vi tối ưu.
12. Có rollback rõ ràng.
13. Có báo cáo before/after.

---

# 8. Files/khu vực ưu tiên sửa

Theo dữ liệu phân tích hiện tại:

```text
.npmrc

src/components/landing-pages/templates/
└── bedimcode-seed-data.generated.json

src/app/api/templates/list/route.ts

src/features/landing-publish/services/
└── public-landing-html.server.ts

src/features/landing-pages/import/
├── asset-rewriter.ts
└── zip-importer.ts

build-bedimcode-editor-data.ts
fetch-bedimcode-templates.ts

public/templates/bedimcode/
public/images/
public/sprites/
public/education/images/
```

Bổ sung mới:

```text
src/lib/cdn/
scripts/
```

---

# 9. Kết luận

Không cần thay đổi lớn cấu trúc dự án.

```text
GIỮ
├── src/app
├── src/components
├── src/features
├── routes
├── UI
└── business logic

TÁCH
├── media
├── landing template assets
├── editor data lớn
├── vendor template JS
└── video/font/sprite
       ↓
Cloudflare R2/CDN
```

Phần refactor tập trung vào:

```text
template loader
asset URL resolver
template API
media upload
build/template scripts
```

Mục tiêu cuối cùng là giảm tải Cloudflare mà không làm vỡ layout, không ảnh hưởng CSKH/education và không tự ý thay đổi các module không liên quan.
