# Phễu tự động hóa & Popup Runtime (docs/FUNNEL_RUNTIME.md)

Tài liệu này đặc tả cơ chế hoạt động của Runtime Client SDK khi chạy trên các trang public `/p/[slug]` để xử lý phễu tự động hóa (FunnelX).

---

## 1. Cơ chế kích hoạt sự kiện (Event Triggers)

Runtime SDK lắng nghe và phát hiện các sự kiện hành vi sau của khách hàng trên trang:

1. **page_view**: Kích hoạt ngay lập tức khi trang vừa tải xong.
2. **time_on_page**: Kích hoạt khi khách ở lại trên trang đạt ngưỡng thời gian cài đặt (ví dụ: sau 10 giây).
3. **scroll_progress**: Kích hoạt khi khách cuộn trang quá một phần trăm nhất định (ví dụ: đã đọc hết 50% trang).
4. **exit_intent**: Lắng nghe chuyển động chuột (mouse leave top viewport) của khách trên máy tính để phát hiện lúc chuẩn bị tắt/thoát trang.
5. **click_element**: Phát hiện sự kiện nhấn vào một liên kết hoặc nút CTA cụ thể.
6. **form_submit**: Kích hoạt ngay sau khi form đăng ký được gửi đi thành công.

---

## 2. Các hành động xử lý (Actions Handler)

Khi một trigger thỏa mãn điều kiện, SDK sẽ thực hiện hành động đã cấu hình:

- **show_popup (Hiện Popup)**:
  - Tải và render overlay popup khuyến mãi hoặc form đăng ký nhanh đè lên màn hình.
  - Làm mờ nền phía dưới (showBackdrop) và hiển thị nút X để khách đóng popup.
- **redirect_url (Chuyển hướng)**:
  - Tự động chuyển hướng khách sang một trang ưu đãi đặc biệt hoặc trang thanh toán (checkout).
- **set_cookie (Ghi nhận cookie)**:
  - Ghi nhớ trạng thái để tránh hiển thị lại popup liên tục, tùy theo tần suất thiết lập (`once`, `session`, `always`).
- **track_event (Đo lường)**:
  - Đồng bộ sự kiện về backend để ghi log vào bảng `funnel_events`.
