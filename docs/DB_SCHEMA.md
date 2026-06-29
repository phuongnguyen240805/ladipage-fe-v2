# Thiết kế Cơ sở dữ liệu (docs/DB_SCHEMA.md)

Hệ thống Next-Gen LadiPage sử dụng cơ sở dữ liệu Supabase PostgreSQL. Dưới đây là lược đồ thực thể cơ bản cho MVP.

---

## 1. Bảng `workspaces` (Không gian làm việc)
Quản lý các workspace của người dùng (mỗi shop/công ty là một workspace).
- `id` (uuid, Primary Key)
- `name` (text) - Tên workspace.
- `owner_id` (uuid, Foreign Key -> auth.users) - Chủ sở hữu.
- `created_at` (timestamp)

## 2. Bảng `workspace_members` (Thành viên workspace)
- `workspace_id` (uuid, Foreign Key -> workspaces.id)
- `user_id` (uuid, Foreign Key -> auth.users)
- `role` (text) - admin, editor, viewer.
- `created_at` (timestamp)

## 3. Bảng `pages` (Landing Pages)
- `id` (uuid, Primary Key)
- `workspace_id` (uuid, Foreign Key -> workspaces.id)
- `slug` (text, Unique) - Đường dẫn public (ví dụ: `khuyen-mai-tra-xanh`).
- `name` (text) - Tên trang trong dashboard.
- `draft_data` (jsonb) - Bản nháp thiết kế lưu Puck blocks.
- `published_data` (jsonb) - Bản đã xuất bản của trang.
- `bgColor` (text), `primaryColor` (text), `fontFamily` (text) - Cài đặt chung của trang.
- `custom_domain` (text, Nullable) - Tên miền riêng được cấu hình.
- `pixel_id` (text, Nullable) - Facebook/Meta Pixel ID.
- `status` (text) - DRAFT, PUBLISHED, ARCHIVED.
- `updated_at` (timestamp)
- `created_at` (timestamp)

## 4. Bảng `forms` (Biểu mẫu)
Lưu trữ cấu hình biểu mẫu thu leads.
- `id` (uuid, Primary Key)
- `page_id` (uuid, Foreign Key -> pages.id)
- `name` (text)
- `fields` (jsonb) - Định nghĩa các trường (id, label, type, required).
- `submit_color` (text)
- `created_at` (timestamp)

## 5. Bảng `form_submissions` (Danh sách Leads nhận được)
- `id` (uuid, Primary Key)
- `form_id` (uuid, Foreign Key -> forms.id)
- `page_id` (uuid, Foreign Key -> pages.id)
- `data` (jsonb) - Dữ liệu động điền bởi khách hàng (họ tên, sđt, email...).
- `status` (text) - NEW, CONTACTED, CONVERTED, SPAM.
- `created_at` (timestamp)

## 6. Bảng `funnels` (Phễu tự động hóa & Popups)
- `id` (uuid, Primary Key)
- `page_id` (uuid, Foreign Key -> pages.id)
- `name` (text)
- `trigger_type` (text) - immediate, scroll, exit_intent, inactivity.
- `trigger_value` (integer) - Ngưỡng kích hoạt (ví dụ: 50% scroll).
- `action_type` (text) - show_popup, redirect_url.
- `action_data` (jsonb) - Nội dung popup hoặc URL redirect.
- `is_active` (boolean)

## 7. Bảng `funnel_events` (Nhật ký hành vi - Tracking)
- `id` (bigint, Primary Key)
- `page_id` (uuid, Foreign Key -> pages.id)
- `session_id` (text) - Nhận diện lượt truy cập.
- `event_type` (text) - page_view, scroll_threshold, exit_intent_trigger, click_cta, form_submit.
- `metadata` (jsonb) - Dữ liệu chi tiết đính kèm (browser, IP, device, element_id).
- `created_at` (timestamp)
