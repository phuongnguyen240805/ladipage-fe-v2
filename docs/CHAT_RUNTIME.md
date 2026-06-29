# Tích hợp Chat trực tuyến (docs/CHAT_RUNTIME.md)

Tài liệu này đặc tả cách hoạt động của live chat widget (LadiChat) trên public page và hệ thống quản lý tin nhắn (Inbox) trong Dashboard.

---

## 1. Chat Widget nổi ở Public Page

- **Vị trí hiển thị**: Góc dưới bên phải (hoặc bên trái) màn hình thiết bị của khách.
- **Trạng thái**:
  - **Dạng rút gọn (Collapsed)**: Hiển thị icon bong bóng chat kèm chấm xanh trực tuyến.
  - **Dạng mở rộng (Expanded)**: Hộp thoại trò chuyện chứa thông tin tư vấn viên, lời chào mặc định và lịch sử chat hiện tại.
- **Tính năng phụ trợ**:
  - Gắn câu hỏi khảo sát nhanh trước khi bắt đầu chat.
  - Tích hợp chatbot AI tự động phản hồi theo kịch bản có sẵn.

---

## 2. Đồng bộ tin nhắn & Live chat Dashboard

- **Giao diện quản lý tin nhắn (Inbox)**:
  - Nằm trong dashboard quản trị. Hiển thị danh sách các hội thoại đang diễn ra của khách hàng.
  - Cho phép nhân viên hỗ trợ gõ câu trả lời, gửi tệp đính kèm và gắn nhãn phân loại khách hàng (leads).
- **Cơ chế kết nối**:
  - Sử dụng WebSocket hoặc cơ chế Realtime của Supabase để đẩy tin nhắn hai chiều tức thời (lưới trễ dưới 200ms).
  - Lưu trữ lịch sử tin nhắn trong Supabase PostgreSQL để làm tư liệu chăm sóc khách hàng.
