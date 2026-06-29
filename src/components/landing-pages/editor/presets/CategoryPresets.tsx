"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { BlockType, DND_TYPES, PaletteDragItem } from "../types";

const iconSvg = (children: React.ReactNode) => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
    {children}
  </svg>
);

export const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM7 15h5M7 11h9" />),
  text: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14M12 5v14M8 19h8" />),
  image: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM7 15l3-3 3 3 2-2 2 2M8 9h.01" />),
  button: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14v8H5zM9 12h6" />),
  spacer: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 20h12M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" />),
  divider: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />),
  columns: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM12 5v14" />),
  feature_card: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14v14H5zM8 9h8M8 13h5" />),
  testimonial: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14v10H8l-3 3zM9 10h6M9 13h4" />),
  countdown: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />),
  video: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM10 9l5 3-5 3z" />),
  form_capture: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />),
  chat_widget: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14v10H9l-4 3zM9 11h.01M12 11h.01M15 11h.01" />),
  funnel_popup: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14v12H5zM8 10h8M8 14h5" />),
  tea_landing: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M12 20c-4-4-3-10 3-15 3 5 2 11-3 15zM5 13c4 0 6 2 7 5" />),
  smartwatch_landing: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8v10H8zM10 3h4M10 21h4" />),
  gallery: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z" />),
  box: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14v14H5z" />),
  icon: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M12 4l2.2 4.5 4.8.7-3.5 3.4.8 4.8L12 15.1l-4.3 2.3.8-4.8L5 9.2l4.8-.7z" />),
  product_card: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l-1 12H7zM9 7a3 3 0 016 0" />),
  collection_list: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 7h3M11 7h8M5 12h3M11 12h8M5 17h3M11 17h8" />),
  carousel: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M8 6h10v12H8zM4 8h2M4 16h2M20 8h0M20 16h0" />),
  tabs: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 7h6v4H4zM10 9h10v10H4v-8" />),
  frame: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM4 9h16" />),
  accordion: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M5 12h14M5 17h14" />),
  table: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v14" />),
  survey: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16H6zM9 9l1.5 1.5L14 7M9 15h6" />),
  menu: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />),
  html_code: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />),
  product_section: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM12 5v14M4 12h16" />),
  form_section: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16H6zM9 8h6M9 12h6" />),
  footer: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 16h16v4H4z" />),
  custom_section: iconSvg(<path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4zM9 9h6v6H9z" />),
};

export const PaletteItem: React.FC<{
  blockType: BlockType;
  onClickAdd: (bt: BlockType) => void;
}> = ({ blockType, onClickAdd }) => {
  const [{ isDragging }, drag] = useDrag<PaletteDragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPES.PALETTE_BLOCK,
    item: { type: DND_TYPES.PALETTE_BLOCK, blockType },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onClick={() => onClickAdd(blockType)}
      className={`group flex cursor-grab select-none items-center gap-2.5 rounded-lg border px-3 py-2.5 transition active:cursor-grabbing ${
        isDragging
          ? "border-gray-950 bg-gray-100 opacity-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-950 hover:bg-white"
      }`}
    >
      <span className="flex-shrink-0 text-gray-500 transition group-hover:text-gray-950">
        {BLOCK_ICONS[blockType]}
      </span>
      <span className="truncate text-xs font-semibold text-gray-700">
        {blockType.replace("_", " ").toUpperCase()}
      </span>
    </div>
  );
};

export interface PresetItem {
  id: string;
  label: string;
  sub: string;
  blockType: BlockType;
  props?: Record<string, unknown>;
  element: React.ReactNode;
}

const assets = {
  skincare: "/images/product/skincare_product.png",
  tea: "/images/product/green_tea_product.png",
  watch: "/images/product/smartwatch_product.png",
  support: "/images/landing/support-ai-section.png",
};

const cardPreview = (title: string, rows = 2) => (
  <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
    <div className="text-[11px] font-black leading-tight text-gray-950">{title}</div>
    <div className="mt-1.5 space-y-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`h-1.5 rounded-full bg-gray-200 ${index === rows - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  </div>
);

const buttonPreview = (label: string, tone: "dark" | "outline" | "light" = "dark") => {
  const className = {
    dark: "border-gray-950 bg-gray-950 text-white",
    outline: "border-gray-950 bg-white text-gray-950",
    light: "border-gray-200 bg-white text-gray-950",
  }[tone];

  return (
    <button className={`pointer-events-none w-full rounded-lg border px-3 py-2 text-[11px] font-black ${className}`}>
      {label}
    </button>
  );
};

const productThumb = (src: string, label: string, price: string) => (
  <div className="rounded-lg border border-gray-200 bg-white p-1.5">
    <img src={src} alt="" className="h-12 w-full rounded-md object-cover" />
    <div className="mt-1 truncate text-[8px] font-black text-gray-900">{label}</div>
    <div className="text-[8px] font-black text-gray-950">{price}</div>
  </div>
);

export const getCategoryPresets = (category: string): PresetItem[] => {
  const presets: Record<string, PresetItem[]> = {
    text: [
      {
        id: "text-heading-3",
        label: "Heading 3",
        sub: "heading h3 title tieu de",
        blockType: "text",
        props: { content: "Heading 3", fontSize: 28, color: "#111827", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 },
        element: <div className="text-[24px] font-black leading-none text-gray-950">Heading 3</div>,
      },
      {
        id: "text-heading-2",
        label: "Heading 2",
        sub: "heading h2 title tieu de",
        blockType: "text",
        props: { content: "Heading 2", fontSize: 36, color: "#111827", textAlign: "left", lineHeight: 1.15, paddingX: 24, paddingY: 8 },
        element: <div className="text-[32px] font-black leading-none text-gray-950">Heading 2</div>,
      },
      {
        id: "text-heading-1",
        label: "Heading 1",
        sub: "heading h1 title tieu de",
        blockType: "text",
        props: { content: "Heading 1", fontSize: 48, color: "#111827", textAlign: "left", lineHeight: 1.08, paddingX: 24, paddingY: 8 },
        element: <div className="text-[44px] font-black leading-none text-gray-950">Heading 1</div>,
      },
      {
        id: "text-title-blue",
        label: "Thêm tiêu đề 2",
        sub: "title blue tieu de mau xanh",
        blockType: "text",
        props: { content: "Thêm tiêu đề 2", fontSize: 32, color: "#1677ff", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 },
        element: <div className="text-[30px] font-black leading-tight text-[#1677ff]">Thêm tiêu đề 2</div>,
      },
      {
        id: "text-title-orange",
        label: "Thêm tiêu đề 3",
        sub: "title orange tieu de mau cam",
        blockType: "text",
        props: { content: "Thêm tiêu đề 3", fontSize: 30, color: "#ff7a30", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 },
        element: <div className="text-[27px] font-medium leading-tight text-[#ff7a30]">Thêm tiêu đề 3</div>,
      },
      {
        id: "text-title-red",
        label: "Thêm tiêu đề 4",
        sub: "title red tieu de mau do",
        blockType: "text",
        props: { content: "Thêm tiêu đề 4", fontSize: 24, color: "#ef1f1f", textAlign: "left", lineHeight: 1.2, paddingX: 24, paddingY: 8 },
        element: <div className="text-[22px] font-medium leading-tight text-[#ef1f1f]">Thêm tiêu đề 4</div>,
      },
      {
        id: "text-title-brown",
        label: "Thêm tiêu đề 5",
        sub: "title brown tieu de mau nau",
        blockType: "text",
        props: { content: "Thêm tiêu đề 5", fontSize: 18, color: "#b65a22", textAlign: "left", lineHeight: 1.25, paddingX: 24, paddingY: 8 },
        element: <div className="text-[17px] font-medium leading-tight text-[#b65a22]">Thêm tiêu đề 5</div>,
      },
      {
        id: "text-big-title",
        label: "Big Title",
        sub: "big title headline large",
        blockType: "text",
        props: { content: "Big Title", fontSize: 44, color: "#111827", textAlign: "left", lineHeight: 1.05, paddingX: 24, paddingY: 8 },
        element: <div className="text-[36px] font-black leading-none text-gray-950">Big Title</div>,
      },
      {
        id: "text-caps-title",
        label: "Caps Title",
        sub: "caps title uppercase",
        blockType: "text",
        props: { content: "CAPS TITLE", fontSize: 26, color: "#d35414", textAlign: "left", lineHeight: 1.1, paddingX: 24, paddingY: 8 },
        element: <div className="text-[24px] font-black uppercase tracking-wide text-[#d35414]">CAPS TITLE</div>,
      },
      {
        id: "text-hero-headline",
        label: "Headline bán hàng",
        sub: "h1 hero headline sales title van ban",
        blockType: "text",
        props: {
          content: "Da sáng mịn sau 14 ngày sử dụng",
          fontSize: 36,
          color: "#111827",
          textAlign: "left",
          lineHeight: 1.12,
          paddingX: 24,
          paddingY: 12,
        },
        element: <div className="text-[18px] font-black leading-[1.08] text-gray-950">Headline bán hàng 2 dòng</div>,
      },
      {
        id: "text-section-title",
        label: "Tiêu đề section",
        sub: "h2 section title van ban",
        blockType: "text",
        props: {
          content: "Vì sao khách hàng chọn sản phẩm này?",
          fontSize: 26,
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.2,
          paddingX: 24,
          paddingY: 12,
        },
        element: <div className="text-[15px] font-black leading-tight text-gray-950">Tiêu đề section rõ ràng</div>,
      },
      {
        id: "text-product-desc",
        label: "Mô tả 13px",
        sub: "paragraph body copy product 13px van ban",
        blockType: "text",
        props: {
          content: "Công thức dịu nhẹ, dễ dùng hằng ngày, phù hợp cho khách cần kết quả rõ nhưng vẫn an toàn cho da.",
          fontSize: 13,
          color: "#4b5563",
          textAlign: "left",
          lineHeight: 1.65,
          paddingX: 24,
          paddingY: 10,
        },
        element: <div className="text-[11px] leading-relaxed text-gray-600">Mô tả 13px, gọn, tập trung lợi ích.</div>,
      },
      {
        id: "text-proof",
        label: "Dòng bằng chứng",
        sub: "proof review trust evidence van ban",
        blockType: "text",
        props: {
          content: "4.8/5 từ 2.300 khách hàng đã mua trong 30 ngày gần nhất.",
          fontSize: 13,
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.5,
          paddingX: 20,
          paddingY: 8,
        },
        element: <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[10px] font-bold text-gray-800">4.8/5 từ 2.300 khách</div>,
      },
      {
        id: "text-price",
        label: "Dòng giá ưu đãi",
        sub: "price offer sale urgency van ban",
        blockType: "text",
        props: {
          content: "Chỉ 399.000đ hôm nay. Tặng kèm tư vấn routine miễn phí.",
          fontSize: 16,
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.4,
          paddingX: 24,
          paddingY: 10,
        },
        element: <div className="text-center text-[12px] font-black text-gray-950">399.000đ + quà tặng</div>,
      },
      {
        id: "text-note",
        label: "Ghi chú nhỏ",
        sub: "note policy microcopy van ban",
        blockType: "text",
        props: {
          content: "Miễn phí đổi trả trong 7 ngày nếu sản phẩm chưa phù hợp.",
          fontSize: 12,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 1.5,
          paddingX: 20,
          paddingY: 6,
        },
        element: <div className="text-center text-[10px] text-gray-500">Ghi chú nhỏ, chính sách</div>,
      },
      {
        id: "hero-clean-product",
        label: "Hero sản phẩm",
        sub: "hero banner product cta",
        blockType: "hero",
        props: {
          headline: "Bộ chăm sóc da tối giản cho người bận rộn",
          subheadline: "Làm sạch, cấp ẩm và phục hồi trong một routine dễ theo.",
          ctaText: "Mua ngay",
          ctaColor: "#111827",
          bgColor: "#f7f7f8",
          bgImage: assets.skincare,
          textAlign: "left",
          minHeight: 420,
          overlayOpacity: 0.15,
        },
        element: (
          <div className="grid h-20 grid-cols-[1.35fr_.65fr] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <div className="p-2">
              <div className="h-2 w-14 rounded bg-gray-950" />
              <div className="mt-2 h-1.5 w-20 rounded bg-gray-300" />
              <div className="mt-1 h-1.5 w-12 rounded bg-gray-200" />
            </div>
            <img src={assets.skincare} alt="" className="h-full w-full object-cover" />
          </div>
        ),
      },
    ],
    button: [
      {
        id: "button-blue",
        label: "Nút xanh dương",
        sub: "button blue cta",
        blockType: "button",
        props: { label: "Đăng ký ngay", style: "filled", color: "#2511d9", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#2511d9] px-3 py-2 text-[13px] font-black text-white">Đăng ký ngay</button>,
      },
      {
        id: "button-green",
        label: "Nút xanh lá",
        sub: "button green cta",
        blockType: "button",
        props: { label: "Mua ngay", style: "filled", color: "#65c900", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#65c900] px-3 py-2 text-[13px] font-black text-white">Mua ngay</button>,
      },
      {
        id: "button-red",
        label: "Nút đỏ sale",
        sub: "button red sale cta",
        blockType: "button",
        props: { label: "Nhận ưu đãi", style: "filled", color: "#ef1f1f", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#ef1f1f] px-3 py-2 text-[13px] font-black text-white">Nhận ưu đãi</button>,
      },
      {
        id: "button-orange",
        label: "Nút cam",
        sub: "button orange cta",
        blockType: "button",
        props: { label: "Đặt hàng", style: "filled", color: "#ff7a30", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#ff7a30] px-3 py-2 text-[13px] font-black text-white">Đặt hàng</button>,
      },
      {
        id: "button-yellow",
        label: "Nút vàng",
        sub: "button yellow cta",
        blockType: "button",
        props: { label: "Xem combo", style: "filled", color: "#ffd43b", textColor: "#111827", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#ffd43b] px-3 py-2 text-[13px] font-black text-gray-950">Xem combo</button>,
      },
      {
        id: "button-purple",
        label: "Nút tím",
        sub: "button purple cta",
        blockType: "button",
        props: { label: "Nhận tư vấn", style: "filled", color: "#8b35ff", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 8, align: "center", icon: "" },
        element: <button className="pointer-events-none w-full rounded-lg bg-[#8b35ff] px-3 py-2 text-[13px] font-black text-white">Nhận tư vấn</button>,
      },
      {
        id: "button-buy-dark",
        label: "Mua ngay đen",
        sub: "button buy now dark cta",
        blockType: "button",
        props: { label: "Mua ngay", style: "filled", color: "#111827", textColor: "#ffffff", size: "md", fullWidth: false, borderRadius: 10, align: "center", icon: "" },
        element: buttonPreview("Mua ngay"),
      },
      {
        id: "button-consult-outline",
        label: "Nhận tư vấn viền",
        sub: "button consult outline cta",
        blockType: "button",
        props: { label: "Nhận tư vấn", style: "outline", color: "#111827", textColor: "#111827", size: "md", fullWidth: false, borderRadius: 10, align: "center", icon: "" },
        element: buttonPreview("Nhận tư vấn", "outline"),
      },
      {
        id: "button-package",
        label: "Chọn bộ này",
        sub: "button package order conversion",
        blockType: "button",
        props: { label: "Chọn bộ này", style: "filled", color: "#111827", textColor: "#ffffff", size: "lg", fullWidth: false, borderRadius: 14, align: "center", icon: "" },
        element: buttonPreview("Chọn bộ này"),
      },
      {
        id: "button-zalo-light",
        label: "Chat Zalo trắng",
        sub: "button zalo chat contact",
        blockType: "button",
        props: { label: "Chat Zalo", style: "outline", color: "#d1d5db", textColor: "#111827", size: "md", fullWidth: false, borderRadius: 10, align: "center", icon: "" },
        element: buttonPreview("Chat Zalo", "light"),
      },
      {
        id: "button-phone-pill",
        label: "Gọi tư vấn pill",
        sub: "button phone call pill",
        blockType: "button",
        props: { label: "Gọi tư vấn", style: "filled", color: "#111827", textColor: "#ffffff", size: "sm", fullWidth: false, borderRadius: 9999, align: "center", icon: "" },
        element: <div className="mx-auto w-28">{buttonPreview("Gọi tư vấn")}</div>,
      },
    ],
    image: [
      {
        id: "image-clean-product",
        label: "Ảnh sản phẩm sạch",
        sub: "image product clean photo anh",
        blockType: "image",
        props: { src: assets.skincare, alt: "Sản phẩm chăm sóc da", caption: "", width: "full", borderRadius: 16, showCaption: false, objectFit: "cover" },
        element: <img src={assets.skincare} alt="" className="h-20 w-full rounded-lg object-cover" />,
      },
      {
        id: "image-caption",
        label: "Ảnh có caption",
        sub: "image caption product proof anh",
        blockType: "image",
        props: { src: assets.tea, alt: "Sản phẩm trà xanh", caption: "Ảnh thật sản phẩm khi giao đến khách", width: "full", borderRadius: 12, showCaption: true, objectFit: "cover" },
        element: (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img src={assets.tea} alt="" className="h-16 w-full object-cover" />
            <div className="px-2 py-1 text-[9px] text-gray-500">Caption sản phẩm</div>
          </div>
        ),
      },
      {
        id: "image-support",
        label: "Ảnh tư vấn",
        sub: "image support consultant service anh",
        blockType: "image",
        props: { src: assets.support, alt: "Đội ngũ tư vấn", caption: "", width: "large", borderRadius: 18, showCaption: false, objectFit: "cover" },
        element: <img src={assets.support} alt="" className="h-20 w-full rounded-xl object-cover" />,
      },
    ],
    gallery: [
      {
        id: "gallery-3",
        label: "Gallery 3 ảnh",
        sub: "gallery 3 images product",
        blockType: "gallery",
        props: { images: [assets.skincare, assets.tea, assets.watch], columns: 3, gap: 10, borderRadius: 12, aspectRatio: "1/1" },
        element: (
          <div className="grid grid-cols-3 gap-1.5">
            {[assets.skincare, assets.tea, assets.watch].map((src) => <img key={src} src={src} alt="" className="h-14 rounded-md object-cover" />)}
          </div>
        ),
      },
      {
        id: "gallery-2",
        label: "Gallery 2 ảnh lớn",
        sub: "gallery 2 images showcase",
        blockType: "gallery",
        props: { images: [assets.skincare, assets.support], columns: 2, gap: 14, borderRadius: 16, aspectRatio: "4/3" },
        element: (
          <div className="grid grid-cols-2 gap-1.5">
            {[assets.skincare, assets.support].map((src) => <img key={src} src={src} alt="" className="h-16 rounded-lg object-cover" />)}
          </div>
        ),
      },
      {
        id: "gallery-proof",
        label: "Gallery bằng chứng",
        sub: "gallery proof review before after",
        blockType: "gallery",
        props: { images: [assets.support, assets.skincare, assets.tea, assets.watch], columns: 4, gap: 8, borderRadius: 10, aspectRatio: "1/1" },
        element: (
          <div className="grid grid-cols-4 gap-1">
            {[assets.support, assets.skincare, assets.tea, assets.watch].map((src) => <img key={src} src={src} alt="" className="h-11 rounded object-cover" />)}
          </div>
        ),
      },
    ],
    box: [
      {
        id: "box-offer",
        label: "Box ưu đãi",
        sub: "box offer promotion sale",
        blockType: "box",
        props: { title: "Ưu đãi hôm nay", description: "Giảm 30% và tặng tư vấn routine miễn phí cho 100 đơn đầu tiên.", bgColor: "#f9fafb", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 16, paddingX: 24, paddingY: 22, shadow: "sm" },
        element: cardPreview("Box ưu đãi", 3),
      },
      {
        id: "box-guarantee",
        label: "Box cam kết",
        sub: "box guarantee trust policy",
        blockType: "box",
        props: { title: "Cam kết sản phẩm", description: "Đổi trả trong 7 ngày, hỗ trợ tư vấn trước và sau khi mua.", bgColor: "#ffffff", borderColor: "#111827", borderWidth: 1, borderRadius: 14, paddingX: 22, paddingY: 20, shadow: "none" },
        element: cardPreview("Box cam kết", 2),
      },
      {
        id: "box-pain",
        label: "Box nỗi đau",
        sub: "box pain point customer problem",
        blockType: "box",
        props: { title: "Bạn đã thử nhiều sản phẩm nhưng chưa hợp?", description: "Chúng tôi giúp bạn chọn đúng routine thay vì mua theo cảm tính.", bgColor: "#f3f4f6", borderColor: "#e5e7eb", borderWidth: 1, borderRadius: 12, paddingX: 24, paddingY: 20, shadow: "none" },
        element: cardPreview("Box nỗi đau", 2),
      },
      {
        id: "box-price",
        label: "Box giá",
        sub: "box price package pricing",
        blockType: "box",
        props: { title: "Bộ tiêu chuẩn", description: "399.000đ. Phù hợp cho người mới bắt đầu chăm sóc da.", bgColor: "#111827", borderColor: "#111827", borderWidth: 1, borderRadius: 18, paddingX: 26, paddingY: 24, shadow: "md" },
        element: (
          <div className="rounded-xl bg-gray-950 p-3 text-white">
            <div className="text-[10px] font-bold text-gray-300">Bộ tiêu chuẩn</div>
            <div className="mt-1 text-[17px] font-black">399.000đ</div>
          </div>
        ),
      },
    ],
    icon: [
      {
        id: "icon-plus",
        label: "Icon dấu cộng",
        sub: "icon plus feature",
        blockType: "icon",
        props: { icon: "+", size: 32, color: "#111827", bgColor: "#f3f4f6", borderRadius: 12, align: "center" },
        element: <div className="flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-black text-gray-950">+</div></div>,
      },
      {
        id: "icon-ok",
        label: "Icon OK",
        sub: "icon ok trust",
        blockType: "icon",
        props: { icon: "OK", size: 24, color: "#ffffff", bgColor: "#111827", borderRadius: 9999, align: "center" },
        element: <div className="flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-[11px] font-black text-white">OK</div></div>,
      },
      {
        id: "icon-number",
        label: "Icon số bước",
        sub: "icon number step",
        blockType: "icon",
        props: { icon: "01", size: 22, color: "#111827", bgColor: "#ffffff", borderRadius: 10, align: "left" },
        element: <div className="flex justify-start"><div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-[11px] font-black text-gray-950">01</div></div>,
      },
    ],
    divider: [
      {
        id: "divider-thin",
        label: "Line mảnh",
        sub: "divider thin line",
        blockType: "divider",
        props: { color: "#e5e7eb", thickness: 1, style: "solid", paddingX: 24, paddingY: 12 },
        element: <div className="py-2"><div className="h-px bg-gray-200" /></div>,
      },
      {
        id: "divider-bold",
        label: "Line đậm",
        sub: "divider bold section",
        blockType: "divider",
        props: { color: "#111827", thickness: 2, style: "solid", paddingX: 24, paddingY: 16 },
        element: <div className="py-2"><div className="h-0.5 bg-gray-950" /></div>,
      },
      {
        id: "spacer-mobile",
        label: "Khoảng cách mobile",
        sub: "spacer mobile space",
        blockType: "spacer",
        props: { height: 24, bgColor: "transparent" },
        element: <div className="flex h-10 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] font-bold text-gray-400">Spacer 24px</div>,
      },
      {
        id: "spacer-section",
        label: "Khoảng cách section",
        sub: "spacer section gap",
        blockType: "spacer",
        props: { height: 56, bgColor: "transparent" },
        element: <div className="flex h-14 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] font-bold text-gray-400">Spacer 56px</div>,
      },
    ],
    form: [
      {
        id: "form-phone",
        label: "Form số điện thoại",
        sub: "form phone lead consult",
        blockType: "form_capture",
        props: {
          title: "Nhận tư vấn miễn phí",
          subtitle: "Để lại số điện thoại, đội ngũ sẽ gọi lại trong vài phút.",
          fields: [{ id: "phone", label: "Số điện thoại", type: "phone", required: true }],
          submitLabel: "Gửi thông tin",
          submitColor: "#111827",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
        element: (
          <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2">
            <div className="text-[10px] font-black text-gray-950">Nhận tư vấn</div>
            <div className="h-7 rounded border border-gray-200 bg-gray-50" />
            <div className="h-7 rounded bg-gray-950" />
          </div>
        ),
      },
      {
        id: "form-order",
        label: "Form đặt hàng",
        sub: "form order name phone address",
        blockType: "form_capture",
        props: {
          title: "Thông tin đặt hàng",
          subtitle: "Điền thông tin để được xác nhận đơn nhanh hơn.",
          fields: [
            { id: "name", label: "Họ và tên", type: "text", required: true },
            { id: "phone", label: "Số điện thoại", type: "phone", required: true },
            { id: "address", label: "Địa chỉ nhận hàng", type: "text", required: true },
          ],
          submitLabel: "Đặt hàng ngay",
          submitColor: "#111827",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
        element: (
          <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
            {[1, 2, 3].map((item) => <div key={item} className="h-5 rounded border border-gray-200 bg-gray-50" />)}
            <div className="h-6 rounded bg-gray-950" />
          </div>
        ),
      },
      {
        id: "form-email",
        label: "Form email nhận mã",
        sub: "form email coupon code",
        blockType: "form_capture",
        props: {
          title: "Nhận mã giảm giá",
          subtitle: "Mã ưu đãi sẽ được gửi về email của bạn.",
          fields: [{ id: "email", label: "Email", type: "email", required: true }],
          submitLabel: "Nhận mã",
          submitColor: "#111827",
          bgColor: "#f9fafb",
          borderRadius: 14,
        },
        element: cardPreview("Form email nhận mã", 2),
      },
    ],
    product: [
      {
        id: "product-single",
        label: "Card 1 sản phẩm",
        sub: "product single card ecommerce",
        blockType: "product_card",
        props: { title: "Serum phục hồi da", description: "Kết cấu mỏng nhẹ, hỗ trợ cấp ẩm và làm dịu da sau 7 ngày.", price: "399.000đ", oldPrice: "520.000đ", image: assets.skincare, badge: "Bán chạy", ctaText: "Mua ngay", bgColor: "#ffffff", borderColor: "#e5e7eb", borderRadius: 16 },
        element: (
          <div className="flex gap-2 rounded-lg border border-gray-200 bg-white p-2">
            <img src={assets.skincare} alt="" className="h-14 w-14 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[10px] font-black text-gray-950">Serum phục hồi da</div>
              <div className="mt-1 text-[11px] font-black text-gray-950">399.000đ</div>
              <div className="mt-1 h-4 rounded bg-gray-950" />
            </div>
          </div>
        ),
      },
      {
        id: "product-grid-2",
        label: "Grid 2 sản phẩm",
        sub: "product grid 2 columns ecommerce",
        blockType: "product_card",
        props: {
          title: "",
          description: "",
          price: "",
          oldPrice: "",
          image: assets.skincare,
          badge: "",
          ctaText: "Chọn mua",
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
          borderRadius: 16,
          columns: 2,
          items: [
            { id: "p1", title: "Serum phục hồi", description: "Dịu nhẹ cho da nhạy cảm.", price: "399.000đ", oldPrice: "520.000đ", image: assets.skincare, badge: "Hot" },
            { id: "p2", title: "Trà xanh organic", description: "Vị thanh, dễ uống mỗi ngày.", price: "249.000đ", oldPrice: "320.000đ", image: assets.tea, badge: "Mới" },
          ],
        },
        element: (
          <div className="grid grid-cols-2 gap-1.5">
            {productThumb(assets.skincare, "Serum", "399k")}
            {productThumb(assets.tea, "Trà xanh", "249k")}
          </div>
        ),
      },
      {
        id: "product-grid-3",
        label: "Grid 3 sản phẩm",
        sub: "product grid 3 columns ecommerce",
        blockType: "product_card",
        props: {
          title: "",
          description: "",
          price: "",
          oldPrice: "",
          image: assets.skincare,
          badge: "",
          ctaText: "Chọn bộ",
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
          borderRadius: 14,
          columns: 3,
          items: [
            { id: "p1", title: "Bộ cơ bản", description: "Dùng thử 7 ngày.", price: "199.000đ", image: assets.skincare },
            { id: "p2", title: "Bộ tiêu chuẩn", description: "Dùng hằng ngày.", price: "399.000đ", image: assets.tea, badge: "Nên chọn" },
            { id: "p3", title: "Bộ premium", description: "Trọn routine.", price: "699.000đ", image: assets.watch },
          ],
        },
        element: (
          <div className="grid grid-cols-3 gap-1">
            {[assets.skincare, assets.tea, assets.watch].map((src) => <img key={src} src={src} alt="" className="h-14 rounded-md object-cover" />)}
          </div>
        ),
      },
    ],
    video: [
      {
        id: "video-demo",
        label: "Video demo sản phẩm",
        sub: "video product demo youtube",
        blockType: "video",
        props: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: assets.skincare, autoplay: false, muted: true, controls: true, aspectRatio: "16/9", borderRadius: 14 },
        element: (
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <img src={assets.skincare} alt="" className="h-20 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-gray-950">Play</div>
            </div>
          </div>
        ),
      },
    ],
    collection: [
      {
        id: "collection-benefits",
        label: "Lợi ích 3 cột",
        sub: "collection benefits feature grid",
        blockType: "collection_list",
        props: {
          columns: 3,
          layout: "grid",
          bgColor: "transparent",
          items: [
            { id: "b1", title: "Dễ dùng", desc: "Routine rõ từng bước, không rối.", icon: "01" },
            { id: "b2", title: "Tiết kiệm", desc: "Một bộ đủ cho nhu cầu chính.", icon: "02" },
            { id: "b3", title: "Có tư vấn", desc: "Được hướng dẫn trước khi mua.", icon: "03" },
          ],
        },
        element: (
          <div className="grid grid-cols-3 gap-1">
            {["01", "02", "03"].map((item) => <div key={item} className="rounded border border-gray-200 bg-white p-2 text-center text-[10px] font-black">{item}</div>)}
          </div>
        ),
      },
      {
        id: "collection-process",
        label: "Quy trình 4 bước",
        sub: "collection process how it works list",
        blockType: "collection_list",
        props: {
          columns: 1,
          layout: "list",
          bgColor: "#ffffff",
          items: [
            { id: "s1", title: "Chọn nhu cầu", desc: "Bạn chọn tình trạng hoặc mục tiêu chính.", icon: "1" },
            { id: "s2", title: "Nhận tư vấn", desc: "Đội ngũ xác nhận sản phẩm phù hợp.", icon: "2" },
            { id: "s3", title: "Đặt hàng", desc: "Hoàn tất thông tin và chọn cách thanh toán.", icon: "3" },
            { id: "s4", title: "Theo dõi kết quả", desc: "Nhận hướng dẫn dùng đúng cách.", icon: "4" },
          ],
        },
        element: (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-6 rounded border border-gray-200 bg-white px-2 text-[9px] font-bold leading-6">Bước {item}</div>)}
          </div>
        ),
      },
      {
        id: "collection-proof",
        label: "Bằng chứng tin cậy",
        sub: "collection proof trust evidence",
        blockType: "collection_list",
        props: {
          columns: 2,
          layout: "grid",
          bgColor: "transparent",
          items: [
            { id: "p1", title: "2.300 đơn", desc: "Đã giao trong 30 ngày.", icon: "2K" },
            { id: "p2", title: "4.8/5", desc: "Điểm đánh giá trung bình.", icon: "4.8" },
            { id: "p3", title: "7 ngày", desc: "Đổi trả khi chưa phù hợp.", icon: "7D" },
            { id: "p4", title: "15 phút", desc: "Thời gian phản hồi tư vấn.", icon: "15" },
          ],
        },
        element: (
          <div className="grid grid-cols-2 gap-1.5">
            {["2.3K", "4.8", "7D", "15p"].map((item) => <div key={item} className="rounded-lg bg-gray-100 p-2 text-center text-[11px] font-black text-gray-950">{item}</div>)}
          </div>
        ),
      },
    ],
    carousel: [
      {
        id: "carousel-product",
        label: "Slider sản phẩm",
        sub: "carousel slider product images",
        blockType: "carousel",
        props: { images: [assets.skincare, assets.tea, assets.watch], autoplay: true, interval: 3500, showIndicators: true, showArrows: true, height: 320 },
        element: (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <img src={assets.skincare} alt="" className="h-20 w-full object-cover" />
            <div className="flex justify-center gap-1 py-1.5">
              {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 w-1.5 rounded-full ${item === 1 ? "bg-gray-950" : "bg-gray-300"}`} />)}
            </div>
          </div>
        ),
      },
      {
        id: "carousel-review",
        label: "Slider review",
        sub: "carousel testimonial review proof",
        blockType: "carousel",
        props: { images: [assets.support, assets.skincare, assets.tea], autoplay: true, interval: 4000, showIndicators: true, showArrows: false, height: 280 },
        element: cardPreview("Slider review khách hàng", 3),
      },
    ],
    tabs: [
      {
        id: "tabs-info",
        label: "Tabs thông tin",
        sub: "tabs product info specs review",
        blockType: "tabs",
        props: {
          activeTabId: "desc",
          style: "pills",
          accentColor: "#111827",
          tabs: [
            { id: "desc", label: "Mô tả", content: "Sản phẩm được thiết kế cho người cần giải pháp đơn giản, dễ dùng và có hướng dẫn rõ." },
            { id: "use", label: "Cách dùng", content: "Dùng mỗi ngày theo hướng dẫn trong bộ sản phẩm." },
            { id: "ship", label: "Giao hàng", content: "Giao nhanh toàn quốc, hỗ trợ kiểm tra trước khi nhận." },
          ],
        },
        element: (
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {["Mô tả", "Cách dùng", "Ship"].map((label, index) => <div key={label} className={`rounded px-2 py-1 text-[9px] font-bold ${index === 0 ? "bg-gray-950 text-white" : "text-gray-500"}`}>{label}</div>)}
          </div>
        ),
      },
    ],
    frame: [
      {
        id: "frame-browser",
        label: "Frame website",
        sub: "frame browser mockup iframe",
        blockType: "frame",
        props: { url: "https://example.com", height: 420, title: "Website preview", browserMockup: true },
        element: (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex h-4 items-center gap-1 bg-gray-100 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            </div>
            <div className="flex h-12 items-center justify-center text-[10px] font-bold text-gray-500">Browser frame</div>
          </div>
        ),
      },
    ],
    accordion: [
      {
        id: "accordion-faq",
        label: "FAQ bán hàng",
        sub: "accordion faq objection sales",
        blockType: "accordion",
        props: {
          allowMultiple: false,
          accentColor: "#111827",
          items: [
            { id: "q1", question: "Sản phẩm có hợp với da nhạy cảm không?", answer: "Có. Công thức dịu nhẹ, nhưng bạn nên test vùng nhỏ trước khi dùng toàn mặt." },
            { id: "q2", question: "Bao lâu thì thấy kết quả?", answer: "Thông thường khách cảm nhận da ẩm và dịu hơn sau 7 đến 14 ngày." },
            { id: "q3", question: "Có được đổi trả không?", answer: "Có. Bạn được hỗ trợ đổi trả trong 7 ngày theo chính sách của shop." },
          ],
        },
        element: (
          <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-1">
            {["Hợp da nhạy cảm?", "Bao lâu có kết quả?", "Có đổi trả không?"].map((question) => <div key={question} className="rounded bg-gray-50 px-2 py-1.5 text-[9px] font-bold text-gray-700">{question}</div>)}
          </div>
        ),
      },
      {
        id: "accordion-policy",
        label: "FAQ chính sách",
        sub: "accordion policy shipping payment",
        blockType: "accordion",
        props: {
          allowMultiple: true,
          accentColor: "#111827",
          items: [
            { id: "q1", question: "Có thanh toán khi nhận hàng không?", answer: "Có. Bạn có thể chọn COD khi nhân viên xác nhận đơn." },
            { id: "q2", question: "Phí vận chuyển thế nào?", answer: "Miễn phí giao hàng cho đơn từ 399.000đ." },
            { id: "q3", question: "Tôi cần tư vấn trước khi mua?", answer: "Bạn có thể để lại số điện thoại để đội ngũ gọi lại." },
          ],
        },
        element: cardPreview("FAQ chính sách", 3),
      },
    ],
    table: [
      {
        id: "table-pricing",
        label: "Bảng giá 3 gói",
        sub: "table pricing package compare",
        blockType: "table",
        props: {
          headers: ["Gói", "Phù hợp", "Giá"],
          rows: [
            ["Cơ bản", "Dùng thử", "199.000đ"],
            ["Tiêu chuẩn", "Dùng hằng ngày", "399.000đ"],
            ["Premium", "Trọn routine", "699.000đ"],
          ],
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
        },
        element: (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white text-[8px]">
            <div className="grid grid-cols-3 bg-gray-950 p-1 font-bold text-white"><span>Gói</span><span>Phù hợp</span><span>Giá</span></div>
            {["199k", "399k", "699k"].map((price) => <div key={price} className="grid grid-cols-3 border-t border-gray-100 p-1 text-gray-600"><span>Bộ</span><span>Da</span><span>{price}</span></div>)}
          </div>
        ),
      },
      {
        id: "table-specs",
        label: "Bảng thông số",
        sub: "table specs details product",
        blockType: "table",
        props: {
          headers: ["Thông tin", "Chi tiết"],
          rows: [
            ["Dung tích", "50ml"],
            ["Phù hợp", "Da khô, da nhạy cảm"],
            ["Cam kết", "Không paraben"],
          ],
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
        },
        element: cardPreview("Bảng thông số sản phẩm", 3),
      },
    ],
    survey: [
      {
        id: "survey-need",
        label: "Khảo sát nhu cầu",
        sub: "survey quiz need customer",
        blockType: "survey",
        props: {
          question: "Bạn đang cần cải thiện điều gì nhất?",
          options: ["Da khô", "Da xỉn màu", "Mụn nhẹ", "Chưa rõ cần tư vấn"],
          accentColor: "#111827",
          submitLabel: "Xem gợi ý",
        },
        element: (
          <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
            <div className="text-[10px] font-black text-gray-950">Bạn cần gì?</div>
            {["Da khô", "Da xỉn màu"].map((option) => <div key={option} className="rounded border border-gray-200 px-2 py-1 text-[9px] text-gray-600">{option}</div>)}
          </div>
        ),
      },
      {
        id: "survey-budget",
        label: "Khảo sát ngân sách",
        sub: "survey budget choice",
        blockType: "survey",
        props: {
          question: "Bạn muốn bắt đầu với ngân sách nào?",
          options: ["Dưới 300.000đ", "300.000đ đến 500.000đ", "Trên 500.000đ"],
          accentColor: "#111827",
          submitLabel: "Nhận gợi ý",
        },
        element: cardPreview("Survey ngân sách", 2),
      },
    ],
    menu: [
      {
        id: "menu-product",
        label: "Menu landing",
        sub: "menu header nav product",
        blockType: "menu",
        props: {
          logoText: "LadiSkin",
          logoUrl: "#",
          items: [
            { label: "Sản phẩm", url: "#product" },
            { label: "Lợi ích", url: "#benefits" },
            { label: "Đánh giá", url: "#reviews" },
            { label: "Mua ngay", url: "#order" },
          ],
          bgColor: "#ffffff",
          textColor: "#111827",
        },
        element: (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-[9px] font-black text-gray-950">
            <span>LadiSkin</span>
            <span>Sản phẩm</span>
            <span>Mua ngay</span>
          </div>
        ),
      },
      {
        id: "menu-dark",
        label: "Menu nền đen",
        sub: "menu dark header nav",
        blockType: "menu",
        props: {
          logoText: "Offer",
          logoUrl: "#",
          items: [
            { label: "Ưu đãi", url: "#offer" },
            { label: "FAQ", url: "#faq" },
            { label: "Liên hệ", url: "#contact" },
          ],
          bgColor: "#111827",
          textColor: "#ffffff",
        },
        element: (
          <div className="flex items-center justify-between rounded-lg bg-gray-950 px-3 py-2 text-[9px] font-black text-white">
            <span>Offer</span>
            <span>FAQ</span>
            <span>Liên hệ</span>
          </div>
        ),
      },
    ],
    widget: [
      {
        id: "widget-countdown-offer",
        label: "Countdown ưu đãi",
        sub: "countdown timer offer urgency sale",
        blockType: "countdown",
        props: {
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          title: "Ưu đãi kết thúc sau",
          expiredText: "Ưu đãi đã kết thúc",
          bgColor: "#111827",
          accentColor: "#ffffff",
        },
        element: (
          <div className="rounded-lg bg-gray-950 p-3 text-center text-white">
            <div className="text-[9px] font-bold text-gray-300">Ưu đãi kết thúc sau</div>
            <div className="mt-2 grid grid-cols-4 gap-1 text-[12px] font-black">
              {["03", "12", "45", "09"].map((item) => <span key={item} className="rounded bg-white px-1.5 py-1 text-gray-950">{item}</span>)}
            </div>
          </div>
        ),
      },
      {
        id: "widget-chat-consult",
        label: "Chat tư vấn",
        sub: "chat widget consult zalo support",
        blockType: "chat_widget",
        props: {
          title: "Cần tư vấn nhanh?",
          greeting: "Chọn tình trạng của bạn, đội ngũ sẽ gợi ý bộ phù hợp.",
          agentName: "Tư vấn viên",
          replyTime: "Phản hồi trong vài phút",
          primaryChannel: "Chat ngay",
          secondaryChannel: "Zalo",
          buttonLabel: "Bắt đầu tư vấn",
          accentColor: "#111827",
          bgColor: "#ffffff",
          position: "right",
          showSurvey: true,
        },
        element: (
          <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <div className="rounded-lg bg-gray-950 p-2 text-[10px] font-black text-white">Cần tư vấn nhanh?</div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <div className="rounded border border-gray-200 py-1 text-center text-[9px] font-bold">Chat</div>
              <div className="rounded border border-gray-200 py-1 text-center text-[9px] font-bold">Zalo</div>
            </div>
          </div>
        ),
      },
      {
        id: "widget-exit-popup",
        label: "Popup giữ khách",
        sub: "popup funnel exit intent coupon lead",
        blockType: "funnel_popup",
        props: {
          title: "Khoan rời trang đã",
          description: "Nhận mã giảm giá và tư vấn chọn bộ phù hợp trước khi mua.",
          ctaText: "Nhận mã ngay",
          ctaUrl: "#lead-form",
          trigger: "exit_intent",
          triggerValue: 60,
          frequency: "session",
          accentColor: "#111827",
          bgColor: "#ffffff",
          imageUrl: assets.skincare,
          showBackdrop: true,
        },
        element: (
          <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <div className="flex gap-2">
              <img src={assets.skincare} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="text-[10px] font-black text-gray-950">Popup giữ khách</div>
                <div className="mt-1 h-1.5 rounded bg-gray-200" />
                <div className="mt-1 h-1.5 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-2 h-6 rounded bg-gray-950" />
          </div>
        ),
      },
    ],
    html: [
      {
        id: "html-trust-strip",
        label: "HTML trust strip",
        sub: "html trust strip custom",
        blockType: "html_code",
        props: {
          height: 90,
          code: "<div style='font-family:Arial,sans-serif;padding:18px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;color:#111827;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;font-size:13px'><strong>2.300+ đơn</strong><strong>4.8/5 đánh giá</strong><strong>Đổi trả 7 ngày</strong></div>",
        },
        element: cardPreview("HTML trust strip", 2),
      },
      {
        id: "html-sale-bar",
        label: "HTML sale bar",
        sub: "html sale promotion bar",
        blockType: "html_code",
        props: {
          height: 64,
          code: "<div style='font-family:Arial,sans-serif;padding:14px 18px;border-radius:999px;background:#111827;color:white;text-align:center;font-size:13px;font-weight:800'>Ưu đãi hôm nay: giảm 30% cho 100 đơn đầu tiên</div>",
        },
        element: <div className="rounded-full bg-gray-950 px-3 py-2 text-center text-[10px] font-black text-white">Sale bar HTML</div>,
      },
    ],
  };

  return presets[category] ?? [];
};
