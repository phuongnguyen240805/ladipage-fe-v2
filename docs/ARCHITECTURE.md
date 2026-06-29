# Kiến trúc hệ thống (docs/ARCHITECTURE.md)

Tài liệu này mô tả sơ đồ tổ chức, cấu trúc module và ranh giới kiến trúc của hệ thống Next-Gen LadiPage.

---

## 1. Bản đồ Kiến trúc (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                   GIAO DIỆN DASHBOARD                   │
│  - Next.js App Router (TailAdmin shell)                 │
│  - Trang quản trị: Pages, Leads, Analytics, Popups      │
│  - Workspace Manager (Supabase DB & Auth)               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            VISUAL PAGE EDITOR (PUCK ENGINE)             │
│  - Puck Editor Route (/dashboard/pages/[pageId]/editor) │
│  - Drag & Drop Canvas & Properties Inspector            │
│  - Cấu hình draft_data -> Lưu Supabase                  │
└────────────────────────────┬────────────────────────────┘
                             │ (Publish Action)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   PUBLIC RENDERING                      │
│  - Route: /p/[slug]                                     │
│  - Render HTML tĩnh siêu tốc bằng published_data        │
│  - Nhúng Runtime Client SDK (nhẹ, tối ưu SEO)           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              RUNTIME CLIENT SDK (LIGHTWEIGHT)           │
│  - JavaScript Vanilla/Tối giản nhúng ngoài Landing Page │
│  - Ghi nhận sự kiện (click, scroll, exit-intent)        │
│  - Xử lý gửi Form Leads, hiện Popup, Chat Widget        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Ranh giới giữa Editor & Public Runtime (Separation of Concerns)

- **Editor Mode**:
  - Tải đầy đủ bộ Puck Editor, DndProviders, các bảng cài đặt, thanh bên Layers, Chat AI hỗ trợ thiết kế.
  - Sử dụng TailwindCSS đầy đủ và các script kiểm tra.
- **Public Runtime Mode**:
  - Không tải bất kỳ code nào liên quan đến Editor hoặc DndProvider.
  - Chỉ tải HTML tĩnh đã render sẵn phía máy chủ (SSR/ISR) và một file Javascript SDK siêu nhỏ (dưới 15KB) để lắng nghe sự kiện.
  - Form submit gửi trực tiếp lên `/api/public/forms/submit` được xác thực nghiêm ngặt bằng Zod.

---

## 3. Bản đồ Tích hợp Dịch vụ thứ ba

- **Supabase**:
  - **Auth**: Quản lý đăng nhập, mời thành viên vào workspace.
  - **Database**: Lưu trữ trạng thái thiết kế, leads, funnel logs.
  - **Storage**: Lưu trữ ảnh, assets tải lên từ Asset Manager.
- **OfferKit**:
  - Trực tiếp xử lý logic checkout, tích điểm loyalty, phát hành coupon giảm giá và referral link.
  - Tương tác thông qua API route bảo mật của Next.js (Server-side) để tránh lộ khóa API.
