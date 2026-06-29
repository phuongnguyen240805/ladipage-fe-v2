"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  GalleryProps, BoxProps, IconProps, ProductCardProps, CollectionListProps,
  CarouselProps, TabsProps, FrameProps, AccordionProps, TableProps,
  SurveyProps, MenuProps, HtmlCodeProps, ElementFrame
} from "../types";
import { useCart, parsePriceNum } from "../../cart/CartContext";
import {
  measureDocumentContentHeight,
  useAutoFitHtmlHeight,
  withHtmlResizeMessenger,
} from "@/features/landing-builder/html/auto-fit-html-height";

type HtmlCodePropsWithViewport = HtmlCodeProps & {
  editorViewportHeight?: number | string;
};

type HtmlIframeElement = HTMLIFrameElement & {
  __heightObserver?: ResizeObserver;
};

// ── Gallery Block ─────────────────────────────────────────────
export const GalleryBlock: React.FC<{ props: GalleryProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { images, columns, gap, borderRadius, aspectRatio } = props;
  const aspectClass = aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : "aspect-auto";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 2 ? 120 : 160}px), 1fr))`,
          gap: `${gap}px`
        }}
      >
        {images.map((img, i) => (
          <div key={i} className={`overflow-hidden bg-gray-900 border border-gray-800 ${aspectClass}`} style={{ borderRadius }}>
            <img src={img} alt={`Gallery item ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          GALLERY
        </div>
      )}
    </div>
  );
};

// ── Box Block ─────────────────────────────────────────────────
export const BoxBlock: React.FC<{ props: BoxProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { bgColor, bgImage, borderColor, borderWidth, borderRadius, paddingX, paddingY, shadow, title, description } = props;
  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "shadow-none";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className={`w-full transition-all ${shadowClass}`}
        style={{
          backgroundColor: bgColor,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: bgImage ? "cover" : undefined,
          backgroundPosition: bgImage ? "center" : undefined,
          borderColor: borderColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth > 0 ? "solid" : "none",
          borderRadius: `${borderRadius}px`,
          padding: `${paddingY}px ${paddingX}px`
        }}
      >
        {title && <h4 className="text-sm font-bold text-gray-800 mb-1">{title}</h4>}
        {description && <p className="text-xs text-gray-500 leading-relaxed">{description}</p>}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          BOX / CONTAINER
        </div>
      )}
    </div>
  );
};

// ── Icon Block ────────────────────────────────────────────────
export const IconBlock: React.FC<{ props: IconProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { icon, size, color, bgColor, borderRadius, align } = props;
  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div
      onClick={onSelect}
      className={`w-full flex cursor-pointer p-4 ${alignClass}`}
    >
      <div
        className={`relative transition-all ${
          isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
        }`}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <div
          className="flex items-center justify-center transition-transform hover:scale-110"
          style={{
            width: `${size * 1.5}px`,
            height: `${size * 1.5}px`,
            backgroundColor: bgColor,
            color: color,
            borderRadius: `${borderRadius}px`,
            fontSize: `${size}px`
          }}
        >
          {icon}
        </div>
        {isSelected && (
          <div className="absolute -top-7 left-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none whitespace-nowrap">
            ICON
          </div>
        )}
      </div>
    </div>
  );
};

// ── Product Card Block ────────────────────────────────────────
export const ProductCardBlock: React.FC<{ props: ProductCardProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { title, description, price, oldPrice, image, badge, ctaText, bgColor, borderColor, borderRadius, items, columns = 1 } = props;

  // Cart integration — gracefully falls back if used outside CartProvider
  let addToCart: ((p: import("../../cart/CartContext").CartProduct) => void) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cart = useCart();
    addToCart = cart.addToCart;
  } catch {
    addToCart = null;
  }

  // Per-item "added" flash state: id → boolean
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = useCallback(
    (e: React.MouseEvent, id: string, itemTitle: string, itemPrice: string, itemOldPrice?: string, itemImage?: string, itemBadge?: string) => {
      e.stopPropagation();
      if (!addToCart) return;
      addToCart({
        id,
        title: itemTitle,
        price: itemPrice,
        priceNum: parsePriceNum(itemPrice),
        oldPrice: itemOldPrice,
        image: itemImage,
        badge: itemBadge,
      });
      setAddedIds((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setAddedIds((prev) => ({ ...prev, [id]: false })), 1500);
    },
    [addToCart]
  );

  // Helper to render a single product card layout
  const renderProductItem = (
    itemId: string,
    itemTitle: string,
    itemDesc: string,
    itemPrice: string,
    itemOldPrice?: string,
    itemImage?: string,
    itemBadge?: string
  ) => {
    const isAdded = addedIds[itemId];
    return (
      <div
        className="overflow-hidden border border-gray-200 shadow-md flex flex-col h-full bg-white rounded-xl hover:shadow-lg transition-shadow duration-200"
        style={{ borderColor, borderRadius }}
      >
        <div className="relative aspect-square w-full bg-gray-50">
          <img src={itemImage || image} alt={itemTitle} className="w-full h-full object-cover" />
          {itemBadge && (
            <span className="absolute top-2.5 left-2.5 bg-slate-950 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              {itemBadge}
            </span>
          )}
        </div>
        <div className="p-3.5 flex flex-col flex-1">
          <div className="flex items-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx} className="text-yellow-400 text-[10px]">★</span>
            ))}
            <span className="text-[9px] text-gray-400 font-medium ml-1">(95 đánh giá)</span>
          </div>
          <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{itemTitle}</h3>
          {itemDesc && <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 mb-2 leading-normal">{itemDesc}</p>}
          <div className="flex items-baseline gap-1.5 mt-auto">
            <span className="text-xs font-black text-slate-950">{itemPrice}</span>
            {itemOldPrice && <span className="text-[9px] text-gray-400 line-through">{itemOldPrice}</span>}
          </div>
          <button
            onClick={(e) => handleAddToCart(e, itemId, itemTitle, itemPrice, itemOldPrice, itemImage, itemBadge)}
            className={`mt-2.5 min-h-10 w-full rounded-lg px-3 py-2 text-[11px] font-bold leading-tight text-white shadow-sm transition-all duration-200 ${
              isAdded
                ? "bg-emerald-500 scale-[0.98]"
                : "bg-slate-950 hover:bg-slate-800 active:scale-[0.96]"
            }`}
          >
            {isAdded ? "✓ Đã thêm vào giỏ" : (ctaText || "🛒 Thêm vào giỏ")}
          </button>
        </div>
      </div>
    );
  };

  const hasGridItems = Array.isArray(items) && items.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {hasGridItems ? (
        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 2 ? 170 : 220}px), 1fr))`,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full">
              {renderProductItem(item.id, item.title, item.description, item.price, item.oldPrice, item.image, item.badge)}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto">
          {renderProductItem("single", title, description, price, oldPrice, image, badge)}
        </div>
      )}

      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          {hasGridItems ? `PRODUCT GRID (${columns} CỘT)` : "PRODUCT CARD"}
        </div>
      )}
    </div>
  );
};

// ── Collection List Block ─────────────────────────────────────
export const CollectionListBlock: React.FC<{ props: CollectionListProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { items, columns, layout, bgColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-20 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={layout === "grid" ? "grid gap-6" : "flex flex-col gap-4"}
        style={
          layout === "grid"
            ? { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 3 ? 180 : 220}px), 1fr))` }
            : {}
        }
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col items-center text-center gap-3 rounded-2xl px-6 py-10 transition duration-150"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="text-xs font-black uppercase tracking-[0.2em] opacity-50"
              style={{ color: "inherit" }}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <p
              className="text-4xl font-black leading-none tracking-tight"
              style={{ color: "inherit" }}
            >
              {item.title}
            </p>
            <p
              className="text-sm leading-relaxed opacity-75 max-w-[180px]"
              style={{ color: "inherit" }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          STATS
        </div>
      )}
    </div>
  );
};


// ── Carousel Block ────────────────────────────────────────────
export const CarouselBlock: React.FC<{ props: CarouselProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { images, autoplay, interval, showIndicators, showArrows, height } = props;
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  const next = () => setActiveIndex((idx) => (idx === images.length - 1 ? 0 : idx + 1));

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900 border border-gray-800" style={{ height: `${height}px` }}>
        <img src={images[activeIndex]} alt="Carousel slide" className="w-full h-full object-cover transition-opacity duration-300" />
        
        {showArrows && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold z-10 transition"
            >
              ⟨
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold z-10 transition"
            >
              ⟩
            </button>
          </>
        )}

        {showIndicators && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${activeIndex === i ? "bg-white w-3" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          CAROUSEL
        </div>
      )}
    </div>
  );
};

// ── Tabs Block ────────────────────────────────────────────────
export const TabsBlock: React.FC<{ props: TabsProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { tabs, accentColor, style } = props;
  const [activeTabId, setActiveTabId] = useState(props.activeTabId || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTabId)?.content || "";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex gap-2 border-b border-slate-200 pb-2 select-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                  style === "underline"
                    ? isActive ? "border-b-2 text-slate-950" : "text-slate-500 hover:text-slate-900"
                    : isActive
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                }`}
                style={
                  isActive && style !== "underline"
                    ? { backgroundColor: accentColor }
                    : isActive && style === "underline"
                      ? { borderColor: accentColor, color: accentColor }
                      : {}
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="min-h-12 text-[13px] leading-relaxed text-slate-600">{activeContent}</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TABS
        </div>
      )}
    </div>
  );
};

// ── Frame Block ───────────────────────────────────────────────
export const FrameBlock: React.FC<{ props: FrameProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { url, height, title, browserMockup } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      {browserMockup ? (
        <div className="w-full overflow-hidden border border-white/10 bg-gray-950 rounded-xl shadow-lg" style={{ height: `${height}px` }}>
          <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-2 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="flex-1 bg-black/30 border border-white/5 rounded px-2.5 py-0.5 text-[9px] text-gray-500 font-mono truncate max-w-sm mx-auto text-center">
              {url || "https://example.com"}
            </div>
          </div>
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center text-xs text-gray-500 bg-gray-950 select-none">
            <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
            <span className="font-bold text-gray-400">{title || "Browser Frame Mockup"}</span>
            <span className="text-[10px] text-gray-600 mt-1">Nội dung từ {url || "liên kết bên ngoài"}</span>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center border border-dashed border-gray-700 bg-gray-900 text-gray-400 rounded-lg text-xs py-10">
          Iframe placeholder ({url})
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          FRAME
        </div>
      )}
    </div>
  );
};

// ── Accordion Block ───────────────────────────────────────────
export const AccordionBlock: React.FC<{ props: AccordionProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { items, accentColor, allowMultiple } = props;
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ [items[0]?.id]: true });

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      } else {
        return { [id]: !prev[id] };
      }
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="w-full space-y-2 select-none">
        {items.map((item) => {
          const isOpen = !!openIds[item.id];
          return (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={(e) => { e.stopPropagation(); toggle(item.id); }}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-bold text-slate-950 transition hover:bg-slate-50"
              >
                <span>{item.question}</span>
                <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? accentColor : undefined }}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 pb-3 pt-2 text-[13px] leading-relaxed text-slate-600">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          ACCORDION
        </div>
      )}
    </div>
  );
};

// ── Table Block ───────────────────────────────────────────────
export const TableBlock: React.FC<{ props: TableProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { headers, rows, bgColor, borderColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="overflow-x-auto w-full rounded-xl border" style={{ borderColor }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 font-bold text-slate-700" style={{ borderColor }}>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 border-r last:border-r-0" style={{ borderColor }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: bgColor }}>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b last:border-b-0" style={{ borderColor }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-r px-4 py-3 text-slate-600 last:border-r-0" style={{ borderColor }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TABLE
        </div>
      )}
    </div>
  );
};

// ── Survey Block ──────────────────────────────────────────────
export const SurveyBlock: React.FC<{ props: SurveyProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { question, options, accentColor, submitLabel } = props;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-14 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow select-none">
        <h4 className="mb-4 text-center text-[13px] font-bold leading-snug text-slate-950">{question}</h4>
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isChecked = selectedIdx === i;
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(i); }}
                className={`w-full flex items-center justify-between text-left text-xs font-semibold px-4 py-3.5 rounded-xl border transition-all ${
                  isChecked
                    ? "border-slate-950 bg-slate-100 text-slate-950"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={isChecked ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
              >
                <span>{opt}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-black ${
                    isChecked ? "text-white" : "border-gray-600"
                  }`}
                  style={isChecked ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  {isChecked && "✓"}
                </span>
              </button>
            );
          })}
        </div>
        <button
          className="w-full text-white font-bold text-xs py-3.5 rounded-xl mt-5 shadow-sm transition hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: accentColor || "#65a30d" }}
          onClick={(e) => { e.stopPropagation(); alert("Cảm ơn bạn đã tham gia khảo sát!"); }}
        >
          {submitLabel}
        </button>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          SURVEY
        </div>
      )}
    </div>
  );
};

// ── Menu Block ────────────────────────────────────────────────
export const MenuBlock: React.FC<{ props: MenuProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { logoText, items, bgColor, textColor } = props;

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return 'rgba(255, 255, 255, 0.8)';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const borderCol = hexToRgba(textColor || "#000000", 0.12);

  // Treats the last item as CTA button if there are multiple items
  const navLinks = items && items.length > 1 ? items.slice(0, -1) : (items || []);
  const ctaItem = items && items.length > 1 ? items[items.length - 1] : null;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="w-full flex items-center justify-between px-6 md:px-12 py-4.5 border-b transition-all duration-300"
        style={{
          backgroundColor: bgColor || "#ffffff",
          borderColor: borderCol,
          color: textColor,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-widest uppercase select-none">{logoText}</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-8">
            {navLinks.map((item, idx) => (
              <span
                key={idx}
                className="text-xs md:text-[13px] font-medium opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer select-none"
              >
                {item.label}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          {ctaItem && (
            <span
              className="inline-flex items-center justify-center px-4 py-2 text-[10px] md:text-xs font-semibold tracking-wider uppercase rounded border shadow-sm transition hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: textColor || "#000000",
                color: bgColor === "#ffffff" || bgColor === "#fff" ? "#ffffff" : bgColor,
                borderColor: borderCol,
              }}
            >
              {ctaItem.label}
            </span>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          NAVIGATION MENU
        </div>
      )}
    </div>
  );
};

function buildOutlineFromDoc(doc: Document, iframe: HTMLIFrameElement) {
  const selector = [
    "header",
    "nav",
    "main",
    "section",
    "article",
    "aside",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "a",
    "button",
    "img",
    "video",
    "form",
    "input",
    "textarea",
    "select",
    "li",
  ].join(",");

  const nodes = Array.from(doc.querySelectorAll(selector)) as HTMLElement[];
  let index = 1;

  return nodes
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = iframe.contentWindow?.getComputedStyle(el);

      if (!style) return false;
      if (style.display === "none") return false;
      if (style.visibility === "hidden") return false;
      if (rect.width < 3 || rect.height < 3) return false;

      return true;
    })
    .slice(0, 300)
    .map((el) => {
      if (!el.dataset.emId) {
        el.dataset.emId = `em-${index++}`;
      }

      const tag = el.tagName.toLowerCase();
      const text = String(el.innerText || el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      let label = tag.toUpperCase();

      if (tag === "img") {
        label = `IMG · ${el.getAttribute("alt") || el.getAttribute("src") || "Image"}`;
      } else if (tag === "a") {
        label = `A · ${text || el.getAttribute("href") || "Link"}`;
      } else if (tag === "button") {
        label = `BUTTON · ${text || "Button"}`;
      } else if (/^h[1-6]$/.test(tag)) {
        label = `${tag.toUpperCase()} · ${text}`;
      } else if (text) {
        label = `${tag.toUpperCase()} · ${text.slice(0, 60)}`;
      }

      return {
        id: el.dataset.emId,
        tag,
        label,
        text,
        href: tag === "a" ? el.getAttribute("href") || "" : "",
        src: tag === "img" || tag === "video" ? el.getAttribute("src") || "" : "",
        alt: tag === "img" ? el.getAttribute("alt") || "" : "",
      };
    });
}

// ── HTML Code Block ───────────────────────────────────────────
export const HtmlCodeBlock: React.FC<{
  blockId?: string;
  props: HtmlCodeProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (nextProps: Record<string, unknown>) => void;
  onUpdateSilent?: (nextProps: Record<string, unknown>) => void;
  onUpdateNodeFrame?: (id: string, frame: Partial<ElementFrame>) => void;
  blockFrame?: ElementFrame;
  parentId?: string;
  globalCss?: string;
}> = ({
  blockId = "html-code-block",
  props,
  isSelected,
  onSelect,
  onUpdate,
  onUpdateSilent,
  onUpdateNodeFrame,
  blockFrame,
  parentId,
  globalCss,
}) => {
  const { code, height } = props;
  const preserveHtml = props?.preserveHtml === true || props?.mode === "iframe";
  const propsWithViewport = props as HtmlCodePropsWithViewport;

  const editorViewportHeight =
    typeof propsWithViewport.editorViewportHeight === "number"
      ? propsWithViewport.editorViewportHeight
      : Number(propsWithViewport.editorViewportHeight || 900);

  const normalHeight =
    typeof height === "number"
      ? height
      : Number(height || 900);

  const initialHeight = preserveHtml
    ? Number(height || editorViewportHeight || 900)
    : normalHeight;

  const [frameHeight, setFrameHeight] = React.useState(
    Number.isFinite(initialHeight) ? initialHeight : 900,
  );

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isDraggingHtmlElementRef = React.useRef(false);
  const dragRafRef = React.useRef<number | null>(null);
  const latestPropsRef = React.useRef(props);
  const latestFrameHeightRef = React.useRef(frameHeight);
  const dragBoundDocumentsRef = React.useRef(new WeakSet<Document>());

  React.useEffect(() => {
    latestPropsRef.current = props;
  }, [props]);

  React.useEffect(() => {
    latestFrameHeightRef.current = frameHeight;
  }, [frameHeight]);

  const emitPropsUpdate = React.useCallback(
    (patch: Record<string, unknown>, silent = false) => {
      const nextProps = {
        ...latestPropsRef.current,
        ...patch,
      };

      latestPropsRef.current = nextProps;
      const updateFn = silent ? (onUpdateSilent || onUpdate) : onUpdate;
      updateFn?.(nextProps);
    },
    [onUpdate, onUpdateSilent],
  );

  const lastLoadedCodeRef = useRef<string>("");

  const isPreserved = preserveHtml || code.trim().toLowerCase().startsWith("<!doctype") || code.trim().toLowerCase().startsWith("<html");

  const iframeContent = React.useMemo(() => {
    if (isPreserved) {
      return withHtmlResizeMessenger(code, blockId);
    }

    return withHtmlResizeMessenger(`<!DOCTYPE html>
    <html>
      <head>
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100%;
          }
        </style>
        ${globalCss ? `<style>${globalCss}</style>` : ""}
      </head>
      <body style="margin:0;">
        ${code}
      </body>
    </html>`, blockId);
  }, [code, globalCss, isPreserved, blockId]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && lastLoadedCodeRef.current !== code) {
      lastLoadedCodeRef.current = code;
      iframe.srcdoc = iframeContent;
    }
  }, [code, iframeContent]);

  const measureHeight = React.useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!iframe || !doc) return;

    try {
      const measuredHeight = measureDocumentContentHeight(doc);
      if (!measuredHeight) return;

      const nextHeight = preserveHtml
        ? Math.min(Math.max(measuredHeight, 900), 100000)
        : Math.min(Math.max(measuredHeight, 240), 100000);

      setFrameHeight((current) => {
        if (Math.abs(current - nextHeight) >= 4) {
          emitPropsUpdate({ height: nextHeight }, true);

          if (onUpdateNodeFrame) {
            onUpdateNodeFrame(blockId, { height: nextHeight });
          }
          if (parentId && onUpdateNodeFrame) {
            onUpdateNodeFrame(parentId, { height: (blockFrame?.y ?? 0) + nextHeight + 80 });
          }

          return nextHeight;
        }

        return current;
      });
    } catch {
      // Giữ height hiện tại nếu browser không cho đo.
    }
  }, [emitPropsUpdate, preserveHtml, onUpdateNodeFrame, blockId, parentId, blockFrame?.y]);

  const applyAutoMeasuredHeight = React.useCallback((nextHeight: number, nextWidth?: number) => {
    if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;

    const pageWidth = blockFrame?.width ?? 1280;
    if (nextWidth !== undefined && nextWidth > pageWidth + 8) {
      console.warn(`[LandingBuilder:PreservedHTML] Content overflow detected: measured width is ${nextWidth}px, which exceeds page width of ${pageWidth}px.`);
    }

    setFrameHeight((current) => {
      if (Math.abs(current - nextHeight) >= 4) {
        emitPropsUpdate({ height: nextHeight }, true);
        onUpdateNodeFrame?.(blockId, { height: nextHeight });

        if (parentId) {
          onUpdateNodeFrame?.(parentId, { height: (blockFrame?.y ?? 0) + nextHeight + 80 });
        }

        return nextHeight;
      }

      return current;
    });
  }, [blockFrame?.y, blockFrame?.width, blockId, emitPropsUpdate, onUpdateNodeFrame, parentId]);

  const {
    bind: bindAutoFitHeight,
    scheduleMeasure: scheduleAutoFitHeight,
  } = useAutoFitHtmlHeight({
    iframeRef,
    enabled: true,
    minHeight: preserveHtml ? 900 : 240,
    onHeightChange: applyAutoMeasuredHeight,
  });

  const scanIframeDom = React.useCallback(() => {
    if (isDraggingHtmlElementRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;

    if (!doc || !win) return;

    const sectionSelector = [
      "header",
      "nav",
      "main",
      "section",
      "article",
      "aside",
      "footer",
      "[role='banner']",
      "[role='navigation']",
      "[role='main']",
      "[role='contentinfo']",
      "[id*='header' i]",
      "[id*='navbar' i]",
      "[id*='nav' i]",
      "[id*='hero' i]",
      "[id*='section' i]",
      "[id*='about' i]",
      "[id*='story' i]",
      "[id*='benefit' i]",
      "[id*='feature' i]",
      "[id*='service' i]",
      "[id*='work' i]",
      "[id*='gallery' i]",
      "[id*='pricing' i]",
      "[id*='rate' i]",
      "[id*='faq' i]",
      "[id*='contact' i]",
      "[id*='footer' i]",
      "[class*='header' i]",
      "[class*='navbar' i]",
      "[class*='nav' i]",
      "[class*='hero' i]",
      "[class*='section' i]",
      "[class*='about' i]",
      "[class*='story' i]",
      "[class*='benefit' i]",
      "[class*='feature' i]",
      "[class*='service' i]",
      "[class*='work' i]",
      "[class*='gallery' i]",
      "[class*='pricing' i]",
      "[class*='rate' i]",
      "[class*='faq' i]",
      "[class*='contact' i]",
      "[class*='footer' i]",
      "body > div",
      "body > main > div",
      "main > div",
    ].join(",");

    const elementSelector = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "button",
      "img",
      "video",
      "form",
      "input",
      "textarea",
      "select",
      "li",
    ].join(",");

    const isVisible = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const style = win.getComputedStyle(el);

      if (style.display === "none") return false;
      if (style.visibility === "hidden") return false;
      if (Number(style.opacity || 1) === 0) return false;
      if (rect.width < 4 || rect.height < 4) return false;

      return true;
    };

    const shortText = (value: string, max = 70) => {
      const text = String(value || "").replace(/\s+/g, " ").trim();
      return text.length > max ? `${text.slice(0, max)}...` : text;
    };

    const getKind = (el: HTMLElement) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id.toLowerCase();
      const cls = String(el.className || "").toLowerCase();
      const role = String(el.getAttribute("role") || "").toLowerCase();
      const combined = `${tag} ${id} ${cls} ${role}`;

      if (tag === "header" || role === "banner" || /header|navbar|nav-bar/.test(combined)) {
        return "HEADER";
      }

      if (tag === "nav" || role === "navigation" || /\bnav\b|navbar|menu/.test(combined)) {
        return "NAV";
      }

      if (/hero|banner|intro|masthead/.test(combined)) {
        return "HERO";
      }

      if (/feature|benefit|service|about|story|work|gallery|pricing|rate|faq|contact|cta/.test(combined)) {
        return "SECTION";
      }

      if (tag === "footer" || role === "contentinfo" || /footer/.test(combined)) {
        return "FOOTER";
      }

      if (tag === "main" || role === "main") {
        return "MAIN";
      }

      if (tag === "section" || tag === "article" || tag === "aside") {
        return "SECTION";
      }

      return "";
    };

    const makeInfo = (el: HTMLElement, forcedKind?: string) => {
      if (!el.dataset.emId) {
        el.dataset.emId = `em-${Math.random().toString(36).slice(2, 10)}`;
      }

      const tag = el.tagName.toLowerCase();
      const rect = el.getBoundingClientRect();
      const text = shortText(el.innerText || el.textContent || "", 90);
      const kind = forcedKind || getKind(el);

      let label = kind || tag.toUpperCase();

      if (kind) {
        if (text) label = `${kind} · ${text}`;
      } else if (tag === "img") {
        label = `IMG · ${el.getAttribute("alt") || el.getAttribute("src") || "Image"}`;
      } else if (tag === "a") {
        label = `A · ${text || el.getAttribute("href") || "Link"}`;
      } else if (tag === "button") {
        label = `BUTTON · ${text || "Button"}`;
      } else if (/^h[1-6]$/.test(tag)) {
        label = `${tag.toUpperCase()} · ${text}`;
      } else if (text) {
        label = `${tag.toUpperCase()} · ${text}`;
      }

      return {
        id: el.dataset.emId,
        tag,
        kind: kind || tag.toUpperCase(),
        label,
        text: String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim(),
        href: tag === "a" ? el.getAttribute("href") || "" : "",
        src: tag === "img" || tag === "video" ? el.getAttribute("src") || "" : "",
        alt: tag === "img" ? el.getAttribute("alt") || "" : "",
        x: Math.round(rect.left + win.scrollX),
        y: Math.round(rect.top + win.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    const sectionNodes = Array.from(
      doc.querySelectorAll(sectionSelector),
    ) as HTMLElement[];

    const elementNodes = Array.from(
      doc.querySelectorAll(elementSelector),
    ) as HTMLElement[];

    const picked = new Set<HTMLElement>();
    const outline: Array<Record<string, unknown>> = [];

    sectionNodes.forEach((el) => {
      if (!isVisible(el)) return;

      const rect = el.getBoundingClientRect();
      const kind = getKind(el);

      const looksLikeLargeSection =
        rect.width >= 320 &&
        rect.height >= 120 &&
        el.children.length > 0;

      if (!kind && !looksLikeLargeSection) return;

      if (picked.has(el)) return;
      picked.add(el);

      outline.push(makeInfo(el, kind || "SECTION"));
    });

    elementNodes.forEach((el) => {
      if (!isVisible(el)) return;
      if (picked.has(el)) return;

      const tag = el.tagName.toLowerCase();
      const text = String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();

      if (
        !text &&
        tag !== "img" &&
        tag !== "video" &&
        tag !== "input" &&
        tag !== "textarea"
      ) {
        return;
      }

      picked.add(el);
      outline.push(makeInfo(el));
    });

    outline.sort((a, b) => {
      const ay = Number(a.y || 0);
      const by = Number(b.y || 0);

      if (Math.abs(ay - by) > 20) return ay - by;

      const ax = Number(a.x || 0);
      const bx = Number(b.x || 0);

      return ax - bx;
    });

    emitPropsUpdate({
      htmlOutline: outline.slice(0, 350),
    }, true);
  }, [emitPropsUpdate]);

  const getIframeElementInfo = React.useCallback((el: HTMLElement) => {
    const tag = el.tagName.toLowerCase();
    const text = String(el.innerText || el.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    const rect = el.getBoundingClientRect();
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;

    const rgbToHex = (rgbStr: string): string => {
      if (!rgbStr) return "#000000";
      const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
      if (!match) return rgbStr;
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    let fontSize = 16;
    let fontWeight = "normal";
    let fontStyle = "normal";
    let textDecoration = "none";
    let textTransform = "none";
    let color = "#000000";
    let backgroundColor = "transparent";

    if (win) {
      const computed = win.getComputedStyle(el);
      fontSize = parseInt(computed.fontSize || "16", 10) || 16;
      fontWeight = computed.fontWeight;
      fontStyle = computed.fontStyle;
      textDecoration = computed.textDecoration;
      textTransform = computed.textTransform;
      color = rgbToHex(computed.color || "#000000");
      backgroundColor = rgbToHex(computed.backgroundColor || "transparent");

      if (computed.backgroundColor === "rgba(0, 0, 0, 0)" || computed.backgroundColor === "transparent") {
        backgroundColor = "transparent";
      }
    }

    return {
      id: el.dataset.emId || "",
      tag,
      label: `${tag.toUpperCase()} · ${text.slice(0, 80)}`,
      text,
      href: tag === "a" ? el.getAttribute("href") || "" : "",
      src:
        tag === "img" || tag === "video"
          ? el.getAttribute("src") || ""
          : "",
      alt: tag === "img" ? el.getAttribute("alt") || "" : "",
      x: Math.round(rect.left + (win?.scrollX ?? 0)),
      y: Math.round(rect.top + (win?.scrollY ?? 0)),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      textTransform,
      color,
      backgroundColor,
    };
  }, []);

  const selectIframeElement = React.useCallback((elementId: string, options?: { scroll?: boolean }) => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!doc || !iframe) return;

    const oldSelected = Array.from(
      doc.querySelectorAll("[data-em-selected='true']"),
    ) as HTMLElement[];

    oldSelected.forEach((node) => {
      node.removeAttribute("data-em-selected");
    });

    const oldOverlay = doc.getElementById("__easy_manager_html_selection_overlay");
    oldOverlay?.remove();

    const el = doc.querySelector(`[data-em-id="${elementId}"]`) as HTMLElement | null;
    if (!el) return;

    el.dataset.emSelected = "true";

    const rect = el.getBoundingClientRect();
    const win = iframe.contentWindow;

    const overlay = doc.createElement("div");
    overlay.id = "__easy_manager_html_selection_overlay";
    overlay.style.position = "absolute";
    overlay.style.left = `${rect.left + (win?.scrollX ?? 0)}px`;
    overlay.style.top = `${rect.top + (win?.scrollY ?? 0)}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.border = "2px solid #8b5cf6";
    overlay.style.outline = "3px solid rgba(139,92,246,.25)";
    overlay.style.boxShadow = "0 0 0 99999px rgba(139,92,246,.03)";
    overlay.style.borderRadius = "4px";
    overlay.style.zIndex = "2147483647";
    overlay.style.pointerEvents = "none";
    overlay.style.boxSizing = "border-box";

    doc.body.appendChild(overlay);

    if (options?.scroll !== false) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }

    window.setTimeout(() => {
      const nextRect = el.getBoundingClientRect();
      if (win) {
        overlay.style.left = `${nextRect.left + win.scrollX}px`;
        overlay.style.top = `${nextRect.top + win.scrollY}px`;
        overlay.style.width = `${nextRect.width}px`;
        overlay.style.height = `${nextRect.height}px`;
      }
    }, 450);

    const tag = el.tagName.toLowerCase();
    const text = String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();

    onSelect?.();

    emitPropsUpdate({
      selectedHtmlElement: {
        id: elementId,
        tag,
        label: `${tag.toUpperCase()} · ${text.slice(0, 80)}`,
        text,
        href: tag === "a" ? el.getAttribute("href") || "" : "",
        src: tag === "img" || tag === "video" ? el.getAttribute("src") || "" : "",
        alt: tag === "img" ? el.getAttribute("alt") || "" : "",
      },
    }, true);
  }, [onSelect, emitPropsUpdate]);

  const serializeIframeHtml = React.useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!doc) return code;

    const cloned = doc.documentElement.cloneNode(true) as HTMLElement;

    cloned.querySelector("#__easy_manager_html_selection_overlay")?.remove();

    const attrsToRemove = [
      "data-em-selected",
      "data-em-base-transform",
      "data-em-move-x",
      "data-em-move-y",
      "contenteditable",
      "spellcheck",
      "data-editor-selected",
      "data-editor-overlay",
      "data-editor-toolbar",
      "data-editor-popover",
      "data-temp-selection",
      "data-hovered",
      "data-resize-handle"
    ];

    attrsToRemove.forEach((attr) => {
      cloned.querySelectorAll(`[${attr}]`).forEach((el) => {
        el.removeAttribute(attr);
      });
      if (cloned.hasAttribute(attr)) {
        cloned.removeAttribute(attr);
      }
    });

    cloned.querySelectorAll("[data-em-id]").forEach((el) => {
      el.removeAttribute("data-em-id");
    });

    const classesToRemove = [
      "selected",
      "editor-selected",
      "editor-hover",
      "editor-outline",
      "resizing",
      "dragging"
    ];

    classesToRemove.forEach((className) => {
      cloned.querySelectorAll(`.${className}`).forEach((el) => {
        el.classList.remove(className);
      });
      if (cloned.classList.contains(className)) {
        cloned.classList.remove(className);
      }
    });

    cloned.querySelectorAll("*").forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        if (htmlEl.style.outline) htmlEl.style.outline = "";
        if (htmlEl.style.outlineOffset) htmlEl.style.outlineOffset = "";
        if (htmlEl.style.boxShadow) htmlEl.style.boxShadow = "";
      }
    });

    return "<!DOCTYPE html>\n" + cloned.outerHTML;
  }, [code]);

  const enableIframeElementDrag = React.useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;

    if (!iframe || !doc || !win) return;

    if (dragBoundDocumentsRef.current.has(doc)) return;
    dragBoundDocumentsRef.current.add(doc);

    let dragState: {
      el: HTMLElement;
      elementId: string;
      startX: number;
      startY: number;
      baseMoveX: number;
      baseMoveY: number;
      baseTransform: string;
      started: boolean;
      nextX: number;
      nextY: number;
      oldTransition: string;
      oldWillChange: string;
      oldZIndex: string;
      oldPosition: string;
    } | null = null;

    const updateOverlay = (el: HTMLElement) => {
      const overlay = doc.getElementById("__easy_manager_html_selection_overlay");
      if (!overlay) return;

      const rect = el.getBoundingClientRect();

      overlay.style.left = `${rect.left + win.scrollX}px`;
      overlay.style.top = `${rect.top + win.scrollY}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };

    const applyDragFrame = () => {
      dragRafRef.current = null;

      if (!dragState) return;

      dragState.el.style.transform =
        `${dragState.baseTransform} translate3d(${dragState.nextX}px, ${dragState.nextY}px, 0)`.trim();

      updateOverlay(dragState.el);
    };

    const scheduleDragFrame = () => {
      if (dragRafRef.current !== null) return;

      dragRafRef.current = win.requestAnimationFrame(applyDragFrame);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const directTag = target.tagName.toLowerCase();

      if (
        directTag === "input" ||
        directTag === "textarea" ||
        directTag === "select"
      ) {
        return;
      }

      const el = target.closest("[data-em-id]") as HTMLElement | null;
      if (!el) return;

      const elementId = el.dataset.emId;
      if (!elementId) return;

      event.preventDefault();
      event.stopPropagation();

      selectIframeElement(elementId, { scroll: false });

      const computed = win.getComputedStyle(el);
      const currentPosition = computed.position || "";

      if (currentPosition === "static" || !currentPosition) {
        el.style.position = "relative";
      }

      if (!el.dataset.emBaseTransform) {
        el.dataset.emBaseTransform = el.style.transform || "";
      }

      const baseMoveX = Number(el.dataset.emMoveX || 0);
      const baseMoveY = Number(el.dataset.emMoveY || 0);

      dragState = {
        el,
        elementId,
        startX: event.clientX,
        startY: event.clientY,
        baseMoveX,
        baseMoveY,
        baseTransform: el.dataset.emBaseTransform || "",
        started: false,
        nextX: baseMoveX,
        nextY: baseMoveY,
        oldTransition: el.style.transition,
        oldWillChange: el.style.willChange,
        oldZIndex: el.style.zIndex,
        oldPosition: el.style.position,
      };

      doc.body.style.userSelect = "none";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState) return;

      const rawDx = event.clientX - dragState.startX;
      const rawDy = event.clientY - dragState.startY;

      /**
       * Chưa vượt ngưỡng 4px thì coi như click chọn,
       * không kích hoạt kéo để tránh rung/nhảy khi click.
       */
      if (!dragState.started) {
        const distance = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

        if (distance < 4) return;

        dragState.started = true;
        isDraggingHtmlElementRef.current = true;

        dragState.el.style.transition = "none";
        dragState.el.style.willChange = "transform";
        dragState.el.style.zIndex = "2147483000";
        dragState.el.style.cursor = "grabbing";

        doc.body.style.cursor = "grabbing";
      }

      event.preventDefault();
      event.stopPropagation();

      const dx = Math.round(rawDx);
      const dy = Math.round(rawDy);

      const nextX = dragState.baseMoveX + dx;
      const nextY = dragState.baseMoveY + dy;

      dragState.nextX = nextX;
      dragState.nextY = nextY;

      dragState.el.dataset.emMoveX = String(nextX);
      dragState.el.dataset.emMoveY = String(nextY);

      scheduleDragFrame();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!dragState) return;

      event.preventDefault();
      event.stopPropagation();

      const wasDragging = dragState.started;
      const currentEl = dragState.el;

      if (dragRafRef.current !== null) {
        win.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }

      if (wasDragging) {
        currentEl.style.transform =
          `${dragState.baseTransform} translate3d(${dragState.nextX}px, ${dragState.nextY}px, 0)`.trim();

        updateOverlay(currentEl);

        const info = getIframeElementInfo(currentEl);
        const nextHtml = serializeIframeHtml();

        emitPropsUpdate({
          code: nextHtml,
          selectedHtmlElement: info,
        });

        window.setTimeout(() => {
          isDraggingHtmlElementRef.current = false;
          scanIframeDom();
        }, 250);
      } else {
        isDraggingHtmlElementRef.current = false;
      }

      currentEl.style.transition = dragState.oldTransition;
      currentEl.style.willChange = dragState.oldWillChange;
      currentEl.style.cursor = "";

      /**
       * Không restore zIndex/position nếu element đã được move,
       * vì nó cần z-index/relative để transform hiển thị ổn định.
       */
      if (!wasDragging) {
        currentEl.style.zIndex = dragState.oldZIndex;
        currentEl.style.position = dragState.oldPosition;
      }

      doc.body.style.userSelect = "";
      doc.body.style.cursor = "";

      dragState = null;
    };

    doc.addEventListener("pointerdown", handlePointerDown, true);
    doc.addEventListener("pointermove", handlePointerMove, true);
    doc.addEventListener("pointerup", handlePointerUp, true);
    doc.addEventListener("pointercancel", handlePointerUp, true);
  }, [
    emitPropsUpdate,
    getIframeElementInfo,
    scanIframeDom,
    selectIframeElement,
    serializeIframeHtml,
  ]);

  const patchIframeElement = React.useCallback(
    (elementId: string, patch: Record<string, any>) => {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;

      if (!doc) return;

      const el = doc.querySelector(
        `[data-em-id="${elementId}"]`,
      ) as HTMLElement | null;

      if (!el) {
        console.warn(`[patchIframeElement] Element not found with data-em-id: ${elementId}`);
        return;
      }

      const tag = el.tagName.toLowerCase();

      if (patch.action === "delete") {
        el.remove();

        const nextHtml = serializeIframeHtml();
        lastLoadedCodeRef.current = nextHtml;

        emitPropsUpdate({
          code: nextHtml,
          selectedHtmlElement: null,
        });

        window.setTimeout(scanIframeDom, 100);
        return;
      }

      if (patch.action === "duplicate") {
        const clone = el.cloneNode(true) as HTMLElement;

        clone.removeAttribute("data-em-selected");
        if (clone.style) {
          clone.style.outline = "";
          clone.style.boxShadow = "";
        }

        const generateNewIds = (node: HTMLElement) => {
          if (node.dataset && node.dataset.emId) {
            node.dataset.emId = `em-clicked-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          }
          if (node.id) {
            node.id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          }
          Array.from(node.children).forEach((child) => generateNewIds(child as HTMLElement));
        };
        generateNewIds(clone);

        el.parentNode?.insertBefore(clone, el.nextSibling);

        const nextHtml = serializeIframeHtml();
        lastLoadedCodeRef.current = nextHtml;

        const cloneInfo = getIframeElementInfo(clone);

        emitPropsUpdate({
          code: nextHtml,
          selectedHtmlElement: cloneInfo,
        });

        window.setTimeout(scanIframeDom, 100);
        return;
      }

      if (patch.action === "bringForward") {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const isPositioned = position === "absolute" || position === "relative" || position === "fixed" || position === "sticky";
        const currentZ = parseInt(style.zIndex, 10);

        if (isPositioned && !isNaN(currentZ)) {
          el.style.zIndex = String(currentZ + 1);
        } else {
          const next = el.nextElementSibling;
          if (next) {
            el.parentNode?.insertBefore(next, el);
          }
        }
      }

      if (patch.action === "sendBackward") {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const isPositioned = position === "absolute" || position === "relative" || position === "fixed" || position === "sticky";
        const currentZ = parseInt(style.zIndex, 10);

        if (isPositioned && !isNaN(currentZ)) {
          el.style.zIndex = String(currentZ - 1);
        } else {
          const prev = el.previousElementSibling;
          if (prev) {
            el.parentNode?.insertBefore(el, prev);
          }
        }
      }

      if (patch.action === "bringToFront") {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const isPositioned = position === "absolute" || position === "relative" || position === "fixed" || position === "sticky";

        if (isPositioned) {
          const siblings = Array.from(el.parentNode?.children || []) as HTMLElement[];
          const zIndices = siblings
            .map((s) => parseInt(window.getComputedStyle(s).zIndex, 10))
            .filter((z) => !isNaN(z));
          const maxZ = zIndices.length > 0 ? Math.max(...zIndices) : 1;
          el.style.zIndex = String(maxZ + 1);
        } else {
          el.parentNode?.appendChild(el);
        }
      }

      if (patch.action === "sendToBack") {
        const style = window.getComputedStyle(el);
        const position = style.position;
        const isPositioned = position === "absolute" || position === "relative" || position === "fixed" || position === "sticky";

        if (isPositioned) {
          const siblings = Array.from(el.parentNode?.children || []) as HTMLElement[];
          const zIndices = siblings
            .map((s) => parseInt(window.getComputedStyle(s).zIndex, 10))
            .filter((z) => !isNaN(z));
          const minZ = zIndices.length > 0 ? Math.min(...zIndices) : 1;
          el.style.zIndex = String(minZ - 1);
        } else {
          if (el.parentNode) {
            el.parentNode.insertBefore(el, el.parentNode.firstChild);
          }
        }
      }

      if (patch.action === "setStyle") {
        if (patch.style && typeof patch.style === "object") {
          Object.entries(patch.style).forEach(([key, value]) => {
            if (!key) return;
            el.style.setProperty(
              key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`),
              String(value ?? ""),
            );
          });
        }
      }

      if (patch.action === "setText") {
        if (tag !== "img" && tag !== "video" && tag !== "input" && tag !== "textarea" && tag !== "select") {
          if (patch.html !== undefined) {
            let cleanHtml = String(patch.html || "");
            cleanHtml = cleanHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
            cleanHtml = cleanHtml.replace(/on\w+="[^"]*"/gi, "");
            cleanHtml = cleanHtml.replace(/on\w+='[^']*'/gi, "");
            cleanHtml = cleanHtml.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
            cleanHtml = cleanHtml.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
            el.innerHTML = cleanHtml;
          } else if (patch.text !== undefined) {
            el.textContent = String(patch.text || "");
          }
        } else if (tag === "input" || tag === "textarea") {
          (el as HTMLInputElement).value = String(patch.text || "");
          el.setAttribute("value", String(patch.text || ""));
        }
      }

      if (patch.action === "replaceImage") {
        if (tag === "img") {
          el.setAttribute("src", String(patch.src || ""));
          if (patch.srcset) el.setAttribute("srcset", String(patch.srcset || ""));
          if (patch.alt) el.setAttribute("alt", String(patch.alt || ""));
        } else if (tag === "video") {
          el.setAttribute("src", String(patch.src || ""));
        } else {
          el.style.backgroundImage = `url("${String(patch.src || "")}")`;
        }
      }

      if (patch.action === "setAttribute") {
        if (patch.attributes && typeof patch.attributes === "object") {
          Object.entries(patch.attributes).forEach(([key, value]) => {
            if (value === null) {
              el.removeAttribute(key);
            } else {
              let cleanValue = String(value || "");
              if (key === "href") {
                const lowerVal = cleanValue.toLowerCase().trim();
                if (lowerVal.startsWith("javascript:") || lowerVal.startsWith("data:")) {
                  cleanValue = "#";
                }
              }
              el.setAttribute(key, cleanValue);
            }
          });
        }
      }

      const nextHtml = serializeIframeHtml();
      lastLoadedCodeRef.current = nextHtml;

      const nextSelectedElement = getIframeElementInfo(el);

      emitPropsUpdate({
        code: nextHtml,
        selectedHtmlElement: nextSelectedElement,
      });

      window.setTimeout(scanIframeDom, 100);
    },
    [emitPropsUpdate, scanIframeDom, serializeIframeHtml, getIframeElementInfo],
  );

  const handleIframeClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const selector = [
      "header", "nav", "main", "section", "article", "aside", "footer",
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "button", "img", "video",
      "form", "input", "textarea", "select", "li", "div"
    ];
    
    let el: HTMLElement | null = target;
    while (el && el !== el.ownerDocument.body) {
      const tag = el.tagName.toLowerCase();
      if (el.dataset.emId || selector.includes(tag)) {
        break;
      }
      el = el.parentElement;
    }

    if (!el || el === el.ownerDocument.body) return;

    event.preventDefault();
    event.stopPropagation();

    if (!el.dataset.emId) {
      el.dataset.emId = `em-clicked-${Date.now()}`;
    }

    selectIframeElement(el.dataset.emId);
  }, [selectIframeElement]);

  useEffect(() => {
    window.addEventListener("resize", measureHeight);
    return () => {
      window.removeEventListener("resize", measureHeight);
      const iframe = iframeRef.current as HtmlIframeElement | null;
      if (iframe?.__heightObserver) {
        try {
          iframe.__heightObserver.disconnect();
        } catch (e) {
          console.warn("Failed to disconnect height observer", e);
        }
      }
    };
  }, [measureHeight]);

  React.useEffect(() => {
    const handleSelectRequest = (event: Event) => {
      const customEvent = event as CustomEvent<{
        blockId?: string;
        elementId?: string;
      }>;

      const detail = customEvent.detail;

      if (!detail || detail.blockId !== blockId || !detail.elementId) return;

      selectIframeElement(detail.elementId, { scroll: true });
    };

    window.addEventListener(
      "EASY_MANAGER_HTML_SELECT_REQUEST",
      handleSelectRequest as EventListener,
    );

    return () => {
      window.removeEventListener(
        "EASY_MANAGER_HTML_SELECT_REQUEST",
        handleSelectRequest as EventListener,
      );
    };
  }, [blockId, selectIframeElement]);

  React.useEffect(() => {
    const handlePatchRequest = (event: Event) => {
      const customEvent = event as CustomEvent<{
        blockId?: string;
        elementId?: string;
        patch?: Record<string, unknown>;
      }>;

      const detail = customEvent.detail;
      if (!detail || detail.blockId !== blockId || !detail.elementId) return;

      patchIframeElement(detail.elementId, detail.patch || {});
    };

    window.addEventListener(
      "EASY_MANAGER_HTML_PATCH_REQUEST",
      handlePatchRequest as EventListener,
    );

    return () => {
      window.removeEventListener(
        "EASY_MANAGER_HTML_PATCH_REQUEST",
        handlePatchRequest as EventListener,
      );
    };
  }, [blockId, patchIframeElement]);

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{
        width: "100%",
        height: frameHeight,
        minHeight: frameHeight,
        position: "relative",
        border: isSelected ? "1.5px solid #8b5cf6" : "none",
        background: "#ffffff",
        overflow: "visible",
      }}
    >
      {/* Overlay to intercept click and drag events so the editor selection works cleanly */}
      <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />

      <iframe
        ref={iframeRef}
        title="Imported HTML"
        className="w-full border-none"
        scrolling="no"
        onLoad={() => {
          measureHeight();
          bindAutoFitHeight();
          const doc = iframeRef.current?.contentDocument;
          const win = iframeRef.current?.contentWindow;
          if (doc) {
            doc.removeEventListener("click", handleIframeClick, true);
            doc.addEventListener("click", handleIframeClick, true);

            // Disconnect old observer if exists
            const iframe = iframeRef.current as HtmlIframeElement | null;
            if (iframe?.__heightObserver) {
              try {
                iframe.__heightObserver.disconnect();
              } catch {}
            }

            // Create new observer using the iframe window's ResizeObserver if available
            const iframeWindow = win as unknown as { ResizeObserver?: typeof ResizeObserver } | null;
            const ResizeObserverClass = iframeWindow?.ResizeObserver || window.ResizeObserver;
            if (ResizeObserverClass && doc.body) {
              const observer = new ResizeObserverClass(() => {
                if (preserveHtml) {
                  measureHeight();
                } else {
                  scheduleAutoFitHeight();
                }
              });
              observer.observe(doc.body);
              if (iframe) iframe.__heightObserver = observer;
            }
          }
          window.setTimeout(() => {
            measureHeight();
            scheduleAutoFitHeight();
            scanIframeDom();
            enableIframeElementDrag();
          }, 300);

          window.setTimeout(() => {
            measureHeight();
            scheduleAutoFitHeight();
            scanIframeDom();
            enableIframeElementDrag();
          }, 1200);

          window.setTimeout(() => {
            measureHeight();
            scheduleAutoFitHeight();
            scanIframeDom();
          }, 2500);
        }}
        style={{
          width: "100%",
          height: frameHeight,
          minHeight: frameHeight,
          border: 0,
          display: "block",
          background: "#ffffff",
          overflow: "hidden",
          pointerEvents: isSelected ? "auto" : "none",
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />

      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          HTML EMBED
        </div>
      )}
    </div>
  );
};

