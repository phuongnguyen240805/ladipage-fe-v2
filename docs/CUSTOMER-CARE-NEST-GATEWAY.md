# Customer Care qua Nest Gateway

## Luồng duy nhất của frontend

```text
LadiPage Frontend
  -> REST + Socket.IO /customer-care
  -> NestJS LadiPage Backend
  -> LibreDesk (conversation/message source of truth)
  -> Zalo connector (QR, session, Zalo I/O)
```

Frontend không gọi trực tiếp LibreDesk hoặc Zalo connector, không chứa API key, connector token hay webhook secret.

## Cấu hình frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:7002/api
```

Người dùng phải đăng nhập LadiPage. API client tự dùng phiên JWT hiện có và Nest áp dụng tenant + RBAC.

## Dữ liệu cục bộ và chống mất tin

Frontend dùng IndexedDB riêng theo namespace `tenantId:userId`:

- cache danh sách hội thoại;
- cache tối đa 300 tin gần nhất mỗi hội thoại;
- lưu bản nháp;
- lưu outbox khi mất mạng;
- lưu sequence đồng bộ;
- lưu sự kiện realtime đang chờ phụ thuộc.

LibreDesk/PostgreSQL vẫn là nguồn dữ liệu gốc. IndexedDB chỉ là cache/offline queue, không phải bản lưu duy nhất.

Luồng gửi:

```text
Tạo clientMessageId
-> ghi optimistic message + outbox vào IndexedDB
-> POST Nest với Idempotency-Key
-> Nest server outbox/retry
-> LibreDesk gửi qua Zalo connector
-> Socket cập nhật sent/delivered/failed
-> xóa client outbox sau khi server xác nhận
```

## Realtime và bù sự kiện

Socket namespace: `/customer-care`.

Các event chính:

- `conversation.created`
- `conversation.updated`
- `conversation.read.updated`
- `message.created`
- `message.updated`
- `message.delivery.updated`
- `message.recalled`
- `typing.started`
- `typing.stopped`
- `channel.status.changed`

Mỗi event có sequence tăng liên tục theo tenant. Khi socket ngắt, frontend gọi:

```http
GET /api/customer-care/sync?afterSequence=<lastSequence>&limit=500
```

Nếu server đã dọn phần event quá cũ, `resetRequired=true` làm frontend xóa cursor, invalidate cache và tải snapshot mới qua Nest.

## Chức năng màn hình hội thoại

- tìm, lọc, ghim, tắt thông báo, lưu trữ;
- trạng thái mở/chờ xử lý/đã xử lý/chưa đọc;
- mức ưu tiên;
- phân công agent/team;
- nhãn hội thoại;
- gửi text, reply, retry, forward;
- reaction và recall cục bộ theo capability;
- typing realtime;
- bản nháp và trả lời nhanh;
- sidebar hồ sơ, ghi chú, hội thoại liên quan và đơn hàng;
- avatar, trạng thái gửi, offline banner;
- tải tin cũ theo cursor mà không nhảy scroll.

Nút ảnh/file/sticker/native recall/native reaction chỉ được bật khi endpoint `/customer-care/capabilities` xác nhận provider hỗ trợ. Không hiển thị chức năng giả.

## Phần chưa bật

Không tải lịch sử Zalo trước thời điểm kết nối. Initial thread sync và lazy history import được để ngoài phạm vi hiện tại, nhưng API/cursor/mapping đã chuẩn bị để bổ sung sau.
