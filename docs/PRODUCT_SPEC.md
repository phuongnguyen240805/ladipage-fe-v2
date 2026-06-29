# Tài liệu đặc tả sản phẩm (docs/PRODUCT_SPEC.md)

## 1. Tầm nhìn sản phẩm
Xây dựng một hệ thống SaaS "LadiPage thế hệ mới" kết hợp:
- **Landing Page Builder**: Tạo nhanh trang bán hàng kéo thả.
- **Funnel Automation (FunnelX)**: Tự động hóa tiếp thị, popup theo hành vi khách hàng.
- **CRM Mini**: Thu thập và quản lý danh sách leads/submissions.
- **Checkout & Promotions (OfferKit)**: Quản lý mã giảm giá, coupons, loyalty, và cổng thanh toán.
- **LadiChat**: Tích hợp widget chat trực tuyến và quản lý tin nhắn khách hàng.

---

## 2. Mục tiêu MVP
- Người dùng đăng nhập vào dashboard -> Tạo landing page kéo thả.
- Gắn form thu leads, popup trigger theo phần trăm cuộn trang hoặc exit intent.
- Gắn mã giảm giá/checkout qua OfferKit.
- Xuất bản (Publish) trang ra ngoài.
- Khách mua hàng/đăng ký thông tin -> Lưu leads và sự kiện tracking.

---

## 3. Các Module chính

### A. Page Builder
- Giao diện kéo thả trực quan.
- Tự động lưu bản nháp (draft_data) và hỗ trợ xuất bản (published_data).
- Quản lý phông chữ, màu sắc thương hiệu toàn trang.

### B. Form & Lead Collection
- Cho phép kéo thả form tùy biến trường nhập.
- API tiếp nhận form submit, kiểm tra dữ liệu bằng `zod`.
- Đồng bộ dữ liệu lead về CRM của workspace.

### C. Funnel & Popup (FunnelX)
- Cài đặt popup kích hoạt theo hành vi khách hàng:
  - Scroll quá 50% trang.
  - Di chuột chuẩn bị thoát trang (exit intent).
  - Khách không hoạt động (inactivity) quá 30 giây.

### D. Bán hàng & Checkout (OfferKit)
- Nhúng các widget mã giảm giá, voucher.
- Tạo quy trình thanh toán với ưu đãi linh hoạt (coupon/ loyalty/ referral).

### E. Live Chat Widget (LadiChat)
- Widget chat nổi ở góc màn hình public.
- Kết nối cổng Chat AI tư vấn tự động hoặc điều hướng về nhân viên hỗ trợ trong dashboard.

### F. Tracking & Analytics
- Đo lường chi tiết sự kiện click, điền form, page view.
- Tích hợp PostHog/GrowthBook làm nền tảng A/B Testing và thống kê.
