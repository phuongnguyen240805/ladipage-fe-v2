# Tích hợp cổng ưu đãi & Thanh toán OfferKit (docs/OFFERKIT_INTEGRATION.md)

Tài liệu này đặc tả quy trình tích hợp giữa hệ thống Landing Page và cổng xử lý ưu đãi, mã giảm giá, coupons và thanh toán của OfferKit.

---

## 1. Các tính năng tích hợp chính

- **Mã giảm giá (Coupon/Voucher Codes)**:
  - Khách điền mã giảm giá vào form/checkout block trên landing page.
  - Client-side gửi mã giảm giá lên API Route Next.js để validate với OfferKit SDK.
  - Trả về số tiền được khấu trừ và hiển thị giá mới cho khách.
- **Quy trình thanh toán (Checkout with Promos)**:
  - Khi submit checkout, hệ thống tạo hóa đơn (invoice) kết hợp các khuyến mãi đã kích hoạt từ OfferKit.
  - Hỗ trợ thanh toán nhanh và ghi nhận đơn hàng thành công.
- **Hệ thống Loyalty & Referral**:
  - Tích hợp ghi nhận điểm thưởng mua hàng.
  - Tạo link chia sẻ (referral link) cho khách hàng để nhận hoa hồng/coupon ưu đãi tự động.

---

## 2. Ranh giới Bảo mật API Key

- **Nguyên tắc bảo mật**:
  - Không bao giờ đặt OfferKit Secret/API keys trong mã nguồn React chạy ngoài Client.
  - Mọi thao tác kiểm tra mã giảm giá, áp dụng loyalty points đều phải đi qua Next.js Server-side routes tại `/api/checkout/apply-promo`.
  - Phía Client chỉ nhận được kết quả cuối cùng đã qua xác thực (số tiền giảm, mã hợp lệ/không hợp lệ).
