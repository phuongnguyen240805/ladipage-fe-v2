# LadiPage FE v2

Nền tảng SaaS **LadiPage thế hệ mới** — xây dựng landing page kéo thả, tự động hóa funnel, thu thập leads, bán hàng và quản trị nhiều module marketing trong một dashboard thống nhất.

## Tính năng chính

| Module | Mô tả |
|--------|-------|
| **Landing Page Builder** | Editor kéo thả, autosave draft, publish ra trang public |
| **Template Library** | Thư viện template admin + preview công khai |
| **FunnelX** | Popup/trigger theo hành vi (scroll, exit intent, inactivity) |
| **CRM Mini** | Quản lý khách hàng, leads, phân segment |
| **Bán hàng** | Đơn hàng, sản phẩm, kho, giao hàng |
| **OfferKit** | Voucher, loyalty, referral, campaigns, checkout |
| **Automation** | Flow builder tích hợp Flowise |
| **AI SEO** | Wizard dự án SEO, tasks, tích hợp Google GSC/GBP |
| **Facebook Ads** | Quản lý tài khoản QC, BM, fanpage |
| **CloudPhone** | Điều khiển thiết bị, workflow automation |
| **E-Learning** | Portal học viên, giảng viên, phụ huynh, admin |
| **Kho ứng dụng** | Cài/gỡ module vào sidebar theo nhu cầu workspace |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS 4, TailAdmin shell, Base UI, Lucide icons
- **State & forms:** Zustand, TanStack Query/Form/Table, React Hook Form, Zod
- **Backend:** Supabase (Auth, PostgreSQL, Storage) + `ladipage-backend` REST API
- **Payments:** Stripe Embedded Checkout
- **Deploy:** OpenNext + Cloudflare Workers (Wrangler)
- **Test:** Vitest, Testing Library, smoke scripts

## Yêu cầu hệ thống

- Node.js 20+
- pnpm (khuyến nghị) hoặc npm
- Supabase project (cho landing pages, auth, storage)
- `ladipage-backend` chạy tại `http://localhost:7002` (hoặc bật MSW mock)

## Cài đặt

```bash
# Clone và cài dependencies
pnpm install

# Copy biến môi trường
cp .env.example .env
# Chỉnh sửa .env theo môi trường local

# Chạy dev server
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

### Seed dữ liệu (tuỳ chọn)

```bash
pnpm seed:builder-elements   # Seed builder elements
pnpm seed:templates        # Seed landing page templates
```

## Biến môi trường

Xem đầy đủ trong [`.env.example`](.env.example):

| Biến | Mô tả |
|------|-------|
| `NEXT_PUBLIC_API_URL` | Base URL backend (`http://localhost:7002/api`) |
| `NEXT_PUBLIC_API_MOCKING` | Bật MSW mock API khi BE chưa sẵn sàng |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_AUTH_MODE` | `legacy` hoặc `supabase` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_FB_GRAPH_VERSION` | Facebook Graph API version |

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy Next.js dev server |
| `pnpm dev:webpack` | Dev server dùng Webpack |
| `pnpm build` | Build production (Node/Vercel) |
| `pnpm build:cf` | Build cho Cloudflare Workers |
| `pnpm preview` | Preview Cloudflare build local |
| `pnpm start` | Chạy production server |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:api` | Smoke test API |
| `pnpm test:api:mock` | Smoke test API với MSW mock |
| `pnpm test:pages` | Smoke test pages |
| `pnpm test:login-session` | Smoke test login session |

## Kiến trúc

```
Dashboard (admin)          Builder (full-screen)       Public Runtime
       │                          │                          │
       ▼                          ▼                          ▼
  /landing-pages            /builder/[pageId]            /p/[slug]
  /ban-hang, /khach-hang    autosave + publish           published_html
  /offerkit, /ai-seo...     import HTML/ZIP              + Runtime SDK
       │                          │                          │
       └──────────────────────────┴──────────────────────────┘
                                  │
                          Supabase + API Routes
```

### Ranh giới Editor vs Public

- **Editor** (`/builder/[pageId]`): tải đầy đủ canvas, DnD, properties panel. Lưu `editor_data` / draft vào Supabase.
- **Public** (`/p/[slug]`): chỉ render `published_html` (SSR). Không tải code editor.
- **Runtime SDK**: JS nhẹ trên trang public — form submit, funnel popup, tracking events.

Luồng publish:

```
Tạo trang → Mở builder → Autosave draft → Publish → /p/[slug] live
```

## Cấu trúc thư mục

```
ladipage-fe-v2/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Dashboard có sidebar (~120 routes)
│   │   ├── (builder)/        # Landing page editor full-screen
│   │   ├── (full-width-pages)/  # Auth, error pages
│   │   ├── education/        # E-Learning portal
│   │   ├── p/[slug]/         # Public landing page
│   │   ├── templates/[slug]/ # Public template preview
│   │   └── api/              # REST API routes
│   ├── features/             # Module theo domain
│   │   ├── landing-builder/
│   │   ├── landing-pages/
│   │   ├── landing-templates/
│   │   ├── offerkit/
│   │   ├── ai-seo/
│   │   ├── facebook-ads/
│   │   ├── cloudphone/
│   │   ├── education/
│   │   ├── app-store/
│   │   └── auth/
│   ├── components/           # UI components theo module
│   ├── layout/               # AppHeader, AppSidebar
│   ├── lib/                  # Supabase, storage, Facebook API
│   └── packages/onlook-funnel/  # Funnel runtime SDK
├── packages/
│   └── @liora/api-types/     # Shared API types (monorepo package)
├── supabase/migrations/      # PostgreSQL migrations
├── scripts/                  # Seed & smoke test scripts
├── docs/                     # Tài liệu kỹ thuật
└── public/                   # Static assets
```

## Routes quan trọng

### Dashboard (yêu cầu đăng nhập)

| Route | Chức năng |
|-------|-----------|
| `/` | Tổng quan & onboarding wizard |
| `/landing-pages` | Quản lý landing pages, forms, domains, leads |
| `/builder/[pageId]` | Visual page editor |
| `/ban-hang` | Đơn hàng, sản phẩm, kho |
| `/khach-hang` | CRM — khách hàng, segment, tags |
| `/bao-cao` | Báo cáo sales, business, automation |
| `/automation` | Flow builder (Flowise) |
| `/offerkit/*` | Voucher, loyalty, campaigns, orders |
| `/ai-seo/*` | SEO automation, projects, tasks |
| `/facebook-ads/*` | Quản lý quảng cáo Facebook |
| `/cloudphone/*` | CloudPhone workflow & thiết bị |
| `/e-learning/*` | E-Learning admin dashboard |
| `/kho-ung-dung` | Kho ứng dụng — cài module |

### Public (không cần auth)

| Route | Chức năng |
|-------|-----------|
| `/p/[slug]` | Landing page đã publish |
| `/templates/[slug]` | Preview template |
| `/signin`, `/signup` | Đăng nhập / đăng ký |

### API chính

| Endpoint | Mô tả |
|----------|-------|
| `/api/builder/pages/[pageId]` | Load/save draft |
| `/api/builder/publish` | Publish trang |
| `/api/builder/upload` | Upload assets |
| `/api/builder/import-html` | Import HTML vào builder |
| `/api/landing-pages` | CRUD landing pages |
| `/api/public/landing-pages/sdk-config` | SDK config cho embed |
| `/api/ai-seo/*` | AI SEO projects, tasks, integrations |
| `/api/flowise/*` | Proxy tới Flowise |

## Database (Supabase)

Migrations nằm trong `supabase/migrations/`. Bảng chính:

- `landing_pages` — trang landing (draft + published)
- `landing_page_templates` — thư viện template
- `workspaces`, `workspace_members` — multi-tenant
- `forms`, `form_submissions` — thu leads
- `funnels`, `funnel_events` — funnel automation & tracking
- Bảng AI SEO — projects, tasks, seo_projects

Chi tiết schema: [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md)

## Deploy (Cloudflare Workers)

```bash
pnpm build:cf
pnpm preview          # Test local với Wrangler
```

Cấu hình Wrangler nằm trong `wrangler*.toml` (gitignored — tạo theo môi trường deploy).

## Tài liệu kỹ thuật

| File | Nội dung |
|------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Kiến trúc tổng thể |
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Đặc tả sản phẩm & MVP |
| [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md) | Database schema |
| [`docs/FUNNEL_RUNTIME.md`](docs/FUNNEL_RUNTIME.md) | Funnel & popup runtime |
| [`docs/OFFERKIT_INTEGRATION.md`](docs/OFFERKIT_INTEGRATION.md) | Tích hợp OfferKit |
| [`docs/CHAT_RUNTIME.md`](docs/CHAT_RUNTIME.md) | LadiChat widget runtime |
| [`docs/PUCK_COMPONENTS.md`](docs/PUCK_COMPONENTS.md) | Puck editor components |
| [`docs/TASKS.md`](docs/TASKS.md) | Checklist triển khai MVP |

## Phát triển

### Path aliases

```ts
@/*              → src/*
@onlook/funnel   → src/packages/onlook-funnel
```

### Chạy test

```bash
pnpm test                    # Unit tests (Vitest)
pnpm test:api:mock           # API smoke test (không cần backend)
pnpm test:pages              # Page smoke test (cần .env)
```

### Legacy route redirect

Route cũ `/landing-pages/editor/[pageId]` tự động redirect sang `/builder/[pageId]`.

### Mock API

Khi backend chưa sẵn sàng, đặt `NEXT_PUBLIC_API_MOCKING=true` để FE chạy độc lập với MSW.

## License

Private — không phân phối công khai.