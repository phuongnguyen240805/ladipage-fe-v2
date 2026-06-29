# Danh mục phần tử thiết kế (docs/PUCK_COMPONENTS.md)

Tài liệu này quy định các phần tử (blocks) được kéo thả trong Visual Page Editor và các tham số tương ứng.

---

## 1. Các phần tử Bố cục & Kết cấu (Layout)

- **Section (Khối lớn)**:
  - Khung bao bọc ngoài cùng.
  - Các thuộc tính: background color, background image, padding top/bottom.
- **Columns (Chia cột)**:
  - Grid phân bổ nội dung theo chiều dọc.
  - Các thuộc tính: number of columns (2-4), gap width.

---

## 2. Các phần tử Nội dung Cơ bản (Basic Content)

- **Hero Banner**:
  - Banner giới thiệu trên cùng của Landing Page.
  - Các thuộc tính: headline, subheadline, ctaText, ctaUrl, bgImage, overlayOpacity.
- **Text (Văn bản)**:
  - Hiển thị tiêu đề hoặc đoạn văn xuôi.
  - Các thuộc tính: content (string), fontSize, lineHeight, textAlign, color.
- **Image (Hình ảnh)**:
  - Các thuộc tính: src, alt, caption, objectFit (cover/contain), borderRadius.
- **Button (Nút CTA)**:
  - Nút kêu gọi hành động.
  - Các thuộc tính: label, url, style (filled/outline), size, color, textColor, borderRadius.

---

## 3. Các phần tử Nâng cao & Tương tác (Advanced & Interactive)

- **Product Card / Grid (Sản phẩm)**:
  - Khối trưng bày 1 sản phẩm đơn lẻ hoặc lưới 2-4 sản phẩm trên cùng một hàng ngang.
  - Các thuộc tính:
    - `title`, `description`, `price`, `oldPrice`, `image`, `badge`, `ctaText` (dùng cho 1 sản phẩm).
    - `items` (mảng sản phẩm dùng cho lưới nhiều sản phẩm).
    - `columns` (số cột hiển thị từ 1 đến 4).
- **Gallery**: Lưới ảnh trưng bày chất lượng cao (2-3 cột).
- **Carousel (Slider)**: Slider ảnh chuyển động tự động, có nút điều hướng.
- **Tabs**: Điều hướng tab chuyển đổi thông số/mô tả sản phẩm nhanh chóng.
- **Accordion (FAQ)**: Câu hỏi thường gặp có dạng đóng/mở (collapse).
- **Table**: Bảng so sánh tính năng hoặc bảng giá dịch vụ.
- **Survey**: Các câu hỏi khảo sát ngắn lấy phản hồi từ khách hàng.
- **Menu**: Thanh menu điều hướng header với logo và các link liên kết.
- **HtmlCode**: Khung nhúng mã HTML tùy chỉnh (để người dùng nhúng widget bên thứ ba).
