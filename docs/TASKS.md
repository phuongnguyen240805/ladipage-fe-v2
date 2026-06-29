# Kế hoạch triển khai & Checklist Nhiệm vụ (docs/TASKS.md)

Dưới đây là danh sách các đầu việc cần triển khai cho MVP theo phương pháp spec-driven, chia nhỏ để dễ dàng lập trình và kiểm soát chất lượng.

---

## Danh sách Task MVP

- [x] **Task 0: Thiết kế specs & Cấu trúc tài liệu tham chiếu**
  - Tạo `AGENTS.md` và thư mục tài liệu `docs/` để định hình kiến trúc.

- [x] **Task 1: Tạo Database Schema & Supabase Migrations**
  - Tạo các bảng PostgreSQL cho `workspaces`, `pages`, `forms`, `form_submissions`, `funnels`, và `funnel_events`.
  - Sinh file TypeScript Types từ Supabase DB.
  - *Lưu ý: Không tạo giao diện UI trong tác vụ này.*

- [ ] **Task 2: Thiết lập Puck Editor và route chỉnh sửa**
  - Cấu hình Puck blocks cơ bản: Section, Hero, Text, Image, Button, Form.
  - Tạo route editor `/dashboard/pages/[pageId]/editor` nằm trong khung dashboard của TailAdmin.

- [ ] **Task 3: Phát triển API Autosave Draft & Publish Page**
  - Viết API lưu trữ bản nháp `draft_data` tự động qua `onChange` của editor.
  - Viết API xuất bản trang (`publish`), sao chép dữ liệu từ `draft_data` sang `published_data`.
  - Viết schema xác thực dữ liệu đầu vào bằng `zod`.

- [ ] **Task 4: Xây dựng Public Page Renderer**
  - Tạo route hiển thị công khai `/p/[slug]`.
  - Đọc `published_data` từ database, sử dụng thư viện Puck Render siêu nhẹ để trả về HTML tĩnh tĩnh tại máy chủ (SSR).

- [ ] **Task 5: Xử lý Form Submission API**
  - Tạo block Form và phát triển API `/api/public/forms/submit`.
  - Khi biểu mẫu được gửi thành công: lưu thông tin vào bảng `form_submissions` và bắn một sự kiện `event_type=form_submit` về hệ thống tracking.

- [ ] **Task 6: Viết Funnel Runtime SDK**
  - Viết file JavaScript runtime-sdk/funnel.ts nhẹ để chạy ở client.
  - Hỗ trợ các trigger: `page_view`, `time_on_page`, `scroll_progress`, và `exit_intent`.
  - Triển khai hành động: hiển thị popup đè màn hình và ghi nhận tracking events.
