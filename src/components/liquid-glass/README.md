# Liquid Glass trong giao diện ứng dụng

Hệ thống chỉ thay chất liệu và phản hồi tương tác của UI hiện có. Không thêm menu, mục điều hướng hay nội dung sản phẩm. Header vẫn cao 52px; các mục điều hướng thêm trong bản thử trước đã bỏ.

## Điểm chỉnh tập trung

- `liquid-glass.css`: màu, độ trong, viền, bóng, bo góc và độ rõ của giọt nước; token light/dark ở đầu file.
  `--liquid-app-background` đặt một gradient chung cố định theo viewport cho content/header/sidebar; `--liquid-chrome-veil` chỉnh lớp kính phủ của header/sidebar. Không đặt gradient riêng ở từng vùng để tránh đứt màu khi scroll hoặc đổi kích thước.
- `liquid-motion.ts`: thời gian ripple, lực lò xo, damping, độ kéo giãn theo tốc độ, độ trễ đuôi và ngưỡng dừng chuyển động. Bước tích phân nhỏ giữ chuyển động ổn định khi tốc độ màn hình thay đổi.
- `liquid-cursor.ts`: giọt đầu chuột 12px kéo giãn theo tốc độ và trở lại hình tròn khi dừng. Vệt là màng SVG liên tục với đường cong quadratic, mép phản sáng và chiều rộng giảm theo tuổi; co lại thành hạt nhỏ rồi tan trong 700ms. Chỉnh trong `LIQUID_CURSOR`; pool tối đa 32 hạt, SVG chỉ chiếm vùng vệt thực tế, không filter toàn viewport. Gom pointermove theo frame và dừng khi vệt tan hết. Chỉ bật với chuột/fine pointer; tắt khi touch, kéo thả, rời cửa sổ, scroll, reduced motion hoặc vào nội dung authored.
- `liquid-runtime.ts`: đọc control khi có tương tác, dùng một listener set cho cả document, kể cả popup trong portal. CSS nhận diện các nút và surface cũ bằng semantic selector; runtime không tự thêm thuộc tính hoặc phần tử con vào HTML do React quản lý, để giữ SSR ổn định khi boundary Suspense hydrate muộn.
- `LiquidTrack.tsx` / `liquid-rail.css`: nền giọt nước kết nối của nhóm tab hiện có.
- `home-glass.css`: tinh chỉnh bố cục/chất liệu riêng của trang chủ.
- `GlassSelect.tsx`: adapter cho 113 select ở 54 file; vẫn giữ option, value, disabled, name, required, native ref, event onChange và form reset. Dùng Base UI sẵn có để dropdown và từng option có thể nhận kính cả trên mobile. Multi-select/listbox có size > 1 giữ chế độ native.

Component mới nên khai báo hook rõ ràng thay vì thêm CSS riêng:

```tsx
<button data-liquid-control="button">...</button>
<div data-liquid-surface="popover" data-liquid-group="filters">...</div>
<div role="option" data-liquid-control="item">...</div>
<span data-liquid-chip="true">...</span>
```

Surface có ba cấp: `panel` chỉ dùng chất liệu nhẹ, `chrome` dùng blur cho header/sidebar, `popover`/`dialog` dùng blur rõ hơn để phân lớp. Màu nút hành động, cảnh báo và trạng thái được giữ. Chữ và icon không bị SVG filter.

`data-liquid-exclude` bảo vệ cây nội dung do người dùng thiết kế. Canvas và preview template đã có hook này. Provider cũng tắt ở `/p/*` và `/extension-preview/*`. Không dùng `LiquidInteractions` lồng trong app: provider gốc đã quản lý tương tác; component đó chỉ dành cho scope độc lập.

## Hiệu năng và khả năng tiếp cận

Giọt chính chạy theo lực lò xo, kéo giãn theo vận tốc và giữ quán tính khi đảo hướng; giọt đuôi nhỏ hơn nhập lại khi dừng. Overlay đo tối đa hai nút lân cận trong cùng nhóm, giữ giọt nền để cầu nối SVG nhập vào chúng. Xét khoảng cách giữa các mép thay vì tọa độ góc, nên nút rộng cạnh nút nhỏ vẫn chuyển tiếp. Khoảng trống nhỏ có thời gian chờ 120ms, nhóm xa nhau đổi ngay. Không có vòng RAF khi đứng yên; chỉ một overlay toàn app, không snapshot toàn trang hoặc WebGL trên mỗi nút. Ripple đặt theo vị trí click/touch; Enter/Space dùng tâm control. Ripple nằm trong lớp trang trí riêng trên body, clip theo kích thước và bo góc của control; hủy khi scroll/resize. Cleanup hủy frame, animation và listener.

Có fallback khi không hỗ trợ backdrop-filter; reduced motion tắt chuyển động, reduced transparency dùng nền đặc. Disabled control không tạo ripple; focus outline giữ rõ. Popup dùng hành vi bàn phím/focus của Base UI.

## Xác minh

- TypeScript toàn repo: `rtk proxy pnpm exec tsc --noEmit`.
- 23 test cho motion/touch/cleanup/portal, select, water cursor và SSR/hydration khi Suspense bị trì hoãn: `rtk proxy pnpm exec vitest run src/components/liquid-glass`. Kiểm tra quán tính khi đảo hướng, kéo giãn có giới hạn, dừng RAF và ổn định ở 30/120 Hz. Thêm 3 test skeleton, gồm kiểm tra SSR/hydration, tại `src/components/ui/skeleton`.
- Test select gồm controlled value, FormData, reset, bàn phím, disabled, option động, required/ref và react-hook-form đăng ký/blur/submit.
- Preview dữ liệu mẫu xác minh desktop 1440px, tablet 768px, mobile 390px, header 52px, không tràn ngang; light/dark và account dropdown.
- Preview không thay đổi xác thực. Chưa kiểm tra trên thiết bị iOS/Safari thật và chưa chạy end-to-end mọi màn hình có API/đăng nhập.

Ảnh xem trước nằm ở `docs/previews/home-liquid-glass/`. Thư mục cache preview trong node_modules chỉ dùng cục bộ, không phải route hay tính năng mới trong app.
