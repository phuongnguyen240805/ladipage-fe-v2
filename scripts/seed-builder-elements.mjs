import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Local env file is optional for CI.
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL. Add https://your-project-ref.supabase.co to .env.local");
}

if (!serviceKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const assets = {
  skincare: "/images/product/skincare_product.png",
  tea: "/images/product/green_tea_product.png",
  watch: "/images/product/smartwatch_product.png",
  support: "/images/landing/support-ai-section.png",
};

const make = (category, sortOrder, item) => ({
  id: item.id,
  category,
  sort_order: sortOrder,
  label: item.label,
  search_text: item.searchText || item.label.toLowerCase(),
  block_type: item.blockType,
  props: item.props || {},
  preview: item.preview || {},
  is_active: true,
});

const seed = [
  ...[
    ["text-heading-3", "Heading 3", "text", { content: "Heading 3", fontSize: 28, color: "#111827", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 }, { kind: "text", size: 24, weight: 900 }],
    ["text-heading-2", "Heading 2", "text", { content: "Heading 2", fontSize: 36, color: "#111827", textAlign: "left", lineHeight: 1.15, paddingX: 24, paddingY: 8 }, { kind: "text", size: 32, weight: 900 }],
    ["text-heading-1", "Heading 1", "text", { content: "Heading 1", fontSize: 48, color: "#111827", textAlign: "left", lineHeight: 1.08, paddingX: 24, paddingY: 8 }, { kind: "text", size: 44, weight: 900 }],
    ["text-title-blue", "Thêm tiêu đề 2", "text", { content: "Thêm tiêu đề 2", fontSize: 32, color: "#1677ff", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 }, { kind: "text", color: "#1677ff" }],
    ["text-title-orange", "Thêm tiêu đề 3", "text", { content: "Thêm tiêu đề 3", fontSize: 30, color: "#ff7a30", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 }, { kind: "text", color: "#ff7a30" }],
    ["text-title-red", "Thêm tiêu đề 4", "text", { content: "Thêm tiêu đề 4", fontSize: 24, color: "#ef1f1f", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 }, { kind: "text", color: "#ef1f1f" }],
    ["text-title-brown", "Thêm tiêu đề 5", "text", { content: "Thêm tiêu đề 5", fontSize: 18, color: "#b65a22", textAlign: "left", lineHeight: 1.25, paddingX: 24, paddingY: 8 }, { kind: "text", color: "#b65a22" }],
    ["text-big-title", "Big Title", "text", { content: "Big Title", fontSize: 44, color: "#111827", textAlign: "left", lineHeight: 1.05, paddingX: 24, paddingY: 8 }, { kind: "text", size: 36, weight: 900 }],
    ["text-caps-title", "Caps Title", "text", { content: "CAPS TITLE", fontSize: 26, color: "#d35414", textAlign: "left", lineHeight: 1.1, paddingX: 24, paddingY: 8 }, { kind: "text", transform: "uppercase" }],
    ["text-hero-headline", "Headline bán hàng", "text", { content: "Da sáng mịn sau 14 ngày sử dụng", fontSize: 36, color: "#111827", textAlign: "left", lineHeight: 1.12, paddingX: 24, paddingY: 12 }, { kind: "text", weight: 900 }],
    ["text-section-title", "Tiêu đề section", "text", { content: "Vì sao khách hàng chọn sản phẩm này?", fontSize: 26, color: "#111827", textAlign: "center", lineHeight: 1.2, paddingX: 24, paddingY: 12 }, { kind: "text", align: "center" }],
    ["text-product-desc", "Mô tả 13px", "text", { content: "Công thức dịu nhẹ, dễ dùng hằng ngày, phù hợp cho khách cần kết quả rõ nhưng vẫn an toàn cho da.", fontSize: 13, color: "#4b5563", textAlign: "left", lineHeight: 1.65, paddingX: 24, paddingY: 10 }, { kind: "paragraph" }],
    ["text-proof", "Dòng bằng chứng", "text", { content: "4.8/5 từ 2.300 khách hàng đã mua trong 30 ngày gần nhất.", fontSize: 13, color: "#111827", textAlign: "center", lineHeight: 1.5, paddingX: 20, paddingY: 8 }, { kind: "pill" }],
    ["text-price", "Dòng giá ưu đãi", "text", { content: "Chỉ 399.000đ hôm nay. Tặng kèm tư vấn routine miễn phí.", fontSize: 16, color: "#111827", textAlign: "center", lineHeight: 1.4, paddingX: 24, paddingY: 10 }, { kind: "price" }],
    ["text-note", "Ghi chú nhỏ", "text", { content: "Miễn phí đổi trả trong 7 ngày nếu sản phẩm chưa phù hợp.", fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.5, paddingX: 20, paddingY: 6 }, { kind: "note" }],
  ].map(([id, label, blockType, props, preview], index) => make("text", index, { id, label, blockType, props, preview, searchText: `${label} van ban title headline` })),

  ...[
    ["button-blue", "Nút xanh dương", "#2511d9", "#ffffff", "Đăng ký ngay"],
    ["button-green", "Nút xanh lá", "#65c900", "#ffffff", "Mua ngay"],
    ["button-red", "Nút đỏ sale", "#ef1f1f", "#ffffff", "Nhận ưu đãi"],
    ["button-orange", "Nút cam", "#ff7a30", "#ffffff", "Đặt hàng"],
    ["button-yellow", "Nút vàng", "#ffd43b", "#111827", "Xem combo"],
    ["button-purple", "Nút tím", "#8b35ff", "#ffffff", "Nhận tư vấn"],
    ["button-buy-dark", "Mua ngay đen", "#111827", "#ffffff", "Mua ngay"],
    ["button-consult-outline", "Nhận tư vấn viền", "#111827", "#111827", "Nhận tư vấn", "outline"],
    ["button-package", "Chọn bộ này", "#111827", "#ffffff", "Chọn bộ này"],
    ["button-zalo-light", "Chat Zalo trắng", "#d1d5db", "#111827", "Chat Zalo", "outline"],
    ["button-pill", "Gọi tư vấn pill", "#111827", "#ffffff", "Gọi tư vấn", "filled", 999],
  ].map(([id, label, color, textColor, text, style = "filled", borderRadius = 10], index) =>
    make("button", index, {
      id,
      label,
      blockType: "button",
      searchText: `${label} button cta`,
      props: { label: text, style, color, textColor, size: "md", fullWidth: true, borderRadius, align: "center", icon: "" },
      preview: { kind: "button", color, textColor, style },
    }),
  ),

  ...[
    ["image-skincare", "Ảnh mỹ phẩm", assets.skincare],
    ["image-tea", "Ảnh trà thảo mộc", assets.tea],
    ["image-watch", "Ảnh đồng hồ", assets.watch],
    ["image-support", "Ảnh tư vấn", assets.support],
  ].map(([id, label, src], index) =>
    make("image", index, {
      id,
      label,
      blockType: "image",
      searchText: `${label} image anh product`,
      props: { src, alt: label, aspectRatio: "16/9", objectFit: "cover", borderRadius: 12 },
      preview: { kind: "image", src },
    }),
  ),

  ...[
    ["box-offer", "Box ưu đãi", "Ưu đãi hôm nay", "Nhận combo kèm tư vấn miễn phí.", "#fff7ed"],
    ["box-guarantee", "Box cam kết", "Cam kết sản phẩm", "Đổi trả trong 7 ngày nếu chưa phù hợp.", "#f8fafc"],
    ["box-pain", "Box nỗi đau", "Bạn đang gặp vấn đề?", "Da khô, xỉn màu hoặc chưa biết chọn routine.", "#fef2f2"],
    ["box-proof", "Box bằng chứng", "2.300+ đơn hàng", "Khách đã mua trong 30 ngày gần nhất.", "#f0fdf4"],
  ].map(([id, label, title, description, bgColor], index) =>
    make("box", index, {
      id,
      label,
      blockType: "box",
      searchText: `${label} box card`,
      props: { title, description, bgColor, borderColor: "#e5e7eb", radius: 16, padding: 24 },
      preview: { kind: "card", bgColor },
    }),
  ),

  ...[
    ["icon-plus", "Icon dấu cộng", "+", "rounded"],
    ["icon-ok", "Icon OK", "OK", "circle"],
    ["icon-number", "Icon số thứ tự", "01", "square"],
    ["divider-thin", "Đường kẻ mảnh", "divider", "thin"],
    ["divider-bold", "Đường kẻ đậm", "divider", "bold"],
    ["spacer-24", "Spacer 24px", "spacer", 24],
    ["spacer-56", "Spacer 56px", "spacer", 56],
  ].map(([id, label, value, variant], index) =>
    make(id.startsWith("divider") ? "divider" : id.startsWith("spacer") ? "spacer" : "icon", index, {
      id,
      label,
      blockType: id.startsWith("divider") ? "divider" : id.startsWith("spacer") ? "spacer" : "icon",
      searchText: `${label} element`,
      props: id.startsWith("spacer") ? { height: variant } : { value, variant, color: "#111827" },
      preview: { kind: id.split("-")[0], value, variant },
    }),
  ),

  ...[
    ["form-lead", "Form tư vấn", "Nhận tư vấn miễn phí", ["Họ tên", "Số điện thoại", "Nhu cầu"]],
    ["form-email", "Form email nhận mã", "Nhận mã ưu đãi", ["Email", "Số điện thoại"]],
    ["form-order", "Form đặt hàng", "Thông tin đặt hàng", ["Họ tên", "Số điện thoại", "Địa chỉ", "Sản phẩm"]],
  ].map(([id, label, title, fields], index) =>
    make("form", index, {
      id,
      label,
      blockType: "form_capture",
      searchText: `${label} form lead capture`,
      props: { title, fields, submitLabel: "Gửi thông tin", accentColor: "#111827", bgColor: "#ffffff" },
      preview: { kind: "form", fields },
    }),
  ),

  ...[
    ["product-card-skincare", "Card mỹ phẩm", assets.skincare, "Serum phục hồi", "399.000đ"],
    ["product-card-tea", "Card trà", assets.tea, "Trà thảo mộc", "199.000đ"],
    ["product-card-watch", "Card đồng hồ", assets.watch, "Smartwatch Pro", "1.990.000đ"],
  ].map(([id, label, image, title, price], index) =>
    make("product", index, {
      id,
      label,
      blockType: "product_card",
      searchText: `${label} product card`,
      props: { image, title, price, ctaText: "Mua ngay", accentColor: "#111827" },
      preview: { kind: "product", image, price },
    }),
  ),

  ...[
    ["collection-benefits", "Lợi ích 3 cột", "collection_list", { columns: 3, layout: "grid", items: ["Dễ dùng", "Tiết kiệm", "Có tư vấn"] }],
    ["collection-process", "Quy trình 4 bước", "collection_list", { columns: 1, layout: "list", items: ["Chọn nhu cầu", "Nhận tư vấn", "Đặt hàng", "Theo dõi kết quả"] }],
    ["collection-proof", "Bằng chứng tin cậy", "collection_list", { columns: 2, layout: "grid", items: ["2.300 đơn", "4.8/5", "7 ngày", "15 phút"] }],
    ["carousel-product", "Slider sản phẩm", "carousel", { images: [assets.skincare, assets.tea, assets.watch], autoplay: true, interval: 3500, showIndicators: true, showArrows: true, height: 320 }],
    ["carousel-review", "Slider review", "carousel", { images: [assets.support, assets.skincare, assets.tea], autoplay: true, interval: 4000, showIndicators: true, showArrows: false, height: 280 }],
    ["tabs-info", "Tabs thông tin", "tabs", { activeTabId: "desc", style: "pills", accentColor: "#111827", tabs: ["Mô tả", "Cách dùng", "Giao hàng"] }],
    ["frame-browser", "Frame website", "frame", { url: "https://example.com", height: 420, title: "Website preview", browserMockup: true }],
    ["accordion-faq", "FAQ bán hàng", "accordion", { allowMultiple: false, accentColor: "#111827", items: ["Sản phẩm có hợp với da nhạy cảm không?", "Bao lâu thì thấy kết quả?", "Có được đổi trả không?"] }],
    ["accordion-policy", "FAQ chính sách", "accordion", { allowMultiple: true, accentColor: "#111827", items: ["Có thanh toán khi nhận hàng không?", "Phí vận chuyển thế nào?", "Tôi cần tư vấn trước khi mua?"] }],
    ["table-pricing", "Bảng giá 3 gói", "table", { headers: ["Gói", "Phù hợp", "Giá"], rows: [["Cơ bản", "Dùng thử", "199.000đ"], ["Tiêu chuẩn", "Dùng hằng ngày", "399.000đ"], ["Premium", "Trọn routine", "699.000đ"]] }],
    ["table-specs", "Bảng thông số", "table", { headers: ["Thông tin", "Chi tiết"], rows: [["Dung tích", "50ml"], ["Phù hợp", "Da khô, da nhạy cảm"], ["Cam kết", "Không paraben"]] }],
    ["survey-need", "Khảo sát nhu cầu", "survey", { question: "Bạn đang cần cải thiện điều gì nhất?", options: ["Da khô", "Da xỉn màu", "Mụn nhẹ", "Chưa rõ cần tư vấn"], submitLabel: "Xem gợi ý" }],
    ["survey-budget", "Khảo sát ngân sách", "survey", { question: "Bạn muốn bắt đầu với ngân sách nào?", options: ["Dưới 300.000đ", "300.000đ đến 500.000đ", "Trên 500.000đ"], submitLabel: "Nhận gợi ý" }],
    ["menu-product", "Menu landing", "menu", { logoText: "LadiSkin", items: ["Sản phẩm", "Lợi ích", "Đánh giá", "Mua ngay"], bgColor: "#ffffff", textColor: "#111827" }],
    ["menu-dark", "Menu nền đen", "menu", { logoText: "Offer", items: ["Ưu đãi", "FAQ", "Liên hệ"], bgColor: "#111827", textColor: "#ffffff" }],
    ["widget-countdown-offer", "Countdown ưu đãi", "countdown", { title: "Ưu đãi kết thúc sau", bgColor: "#111827", accentColor: "#ffffff" }],
    ["widget-chat-consult", "Chat tư vấn", "chat_widget", { title: "Cần tư vấn nhanh?", primaryChannel: "Chat ngay", secondaryChannel: "Zalo", accentColor: "#111827" }],
    ["widget-exit-popup", "Popup giữ khách", "funnel_popup", { title: "Khoan rời trang đã", ctaText: "Nhận mã ngay", imageUrl: assets.skincare, showBackdrop: true }],
    ["html-trust-strip", "HTML trust strip", "html_code", { height: 90, code: "<div>2.300+ đơn | 4.8/5 đánh giá | Đổi trả 7 ngày</div>" }],
    ["html-sale-bar", "HTML sale bar", "html_code", { height: 64, code: "<div>Ưu đãi hôm nay: giảm 30% cho 100 đơn đầu tiên</div>" }],
  ].map(([id, label, blockType, props], index) =>
    make(String(blockType).replace("_list", "").replace("_widget", "").replace("_code", ""), index, {
      id,
      label,
      blockType,
      searchText: `${label} ${blockType}`,
      props,
      preview: { kind: blockType },
    }),
  ),
];

const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/builder_element_presets?on_conflict=id`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(seed),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`Supabase seed failed ${response.status}: ${text}`);
}

console.log(`Seeded ${seed.length} builder element presets.`);
