# Commerce UI mock (M0)

UI preview for Medusa-backed “Cửa hàng online” before Nest BFF.

## Xem trước

1. Chạy app: `pnpm dev` (từ `ladipage-fe-v2`).
2. Mở **Bán hàng** → sidebar **Cửa hàng online**:
   - Sản phẩm online
   - Đơn online
   - Cài đặt cửa hàng
3. Thanh **Mock role** (Owner / Admin / Editor / Viewer) để thử RBAC.
4. **Gắn SP vào landing (UI only):**
   - **Landing Pages** → nút **Gắn SP** trên từng row (hoặc menu ⋯)
   - Chọn mục đích (Lead / Bán / Hybrid / Nội dung) + chọn SP online + CTA
   - Badge **Bán hàng · N SP** hiện trên list; filter “Mọi mục đích / Đã gắn SP…”
   - Cần role có `commerce:page:bind` (Owner/Editor). Viewer → màn từ chối quyền.
   - Lưu localStorage key `ladipage:landing-commerce-profiles-v1` (mock, chưa editor block / BE).

## Mock data

- Medusa org: `My Organization` (`org_01MOCK_MY_ORGANIZATION`) — fields theo org sample (legal name, billing, VAT, members Alice/Bob/Carol, plan Pro).
- Sales channel: `sc_01MOCK_LADIPAGE_CHANNEL` gắn LadiPage org.
- Seed: 3 products, 2 orders (có landing attribution).

## Test

```bash
npx vitest run src/features/commerce
```
