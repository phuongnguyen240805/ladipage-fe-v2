"use client";

import React, { useState } from "react";
import { BlockType } from "../types";
import { BLOCK_ICONS, getCategoryPresets } from "../presets/CategoryPresets";
import { isPremiumLandingBlock } from "@/config/landing-premium-blocks";
import { useLandingAccess } from "@/features/landing-pages/hooks/useLandingAccess";

const ELEMENT_CATEGORIES = [
  "text", "box", "icon", "divider", "form", "product", "video",
  "collection", "carousel", "tabs", "frame", "accordion", "table",
  "survey", "menu", "html",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  text: "Văn bản",
  box: "Hình hộp",
  icon: "Biểu tượng",
  divider: "Đường kẻ",
  form: "Form",
  product: "Sản phẩm mẫu",
  video: "Video",
  collection: "Collection List",
  carousel: "Carousel",
  tabs: "Tabs",
  frame: "Frame",
  accordion: "Accordion",
  table: "Table",
  survey: "Survey",
  menu: "Menu",
  html: "Mã HTML",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  text: BLOCK_ICONS.text,
  box: BLOCK_ICONS.box,
  icon: BLOCK_ICONS.icon,
  divider: BLOCK_ICONS.divider,
  form: BLOCK_ICONS.form_capture,
  product: BLOCK_ICONS.product_card,
  video: BLOCK_ICONS.video,
  collection: BLOCK_ICONS.collection_list,
  carousel: BLOCK_ICONS.carousel,
  tabs: BLOCK_ICONS.tabs,
  frame: BLOCK_ICONS.frame,
  accordion: BLOCK_ICONS.accordion,
  table: BLOCK_ICONS.table,
  survey: BLOCK_ICONS.survey,
  menu: BLOCK_ICONS.menu,
  html: BLOCK_ICONS.html_code,
};

interface ElementPalettePanelProps {
  onAddBlock: (blockType: BlockType, customProps?: Record<string, unknown>) => void;
  onPremiumBlocked?: () => void;
  /** drawer = 3-column Ladipage layout; compact = embedded in LayersPanel */
  layout?: "drawer" | "compact";
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const ElementPalettePanel: React.FC<ElementPalettePanelProps> = ({
  onAddBlock,
  onPremiumBlocked,
  layout = "compact",
  initialCategory = "text",
  onCategoryChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState("");
  const landingAccess = useLandingAccess();

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    onCategoryChange?.(catId);
  };

  const renderPresets = (category: string, query: string) => {
    const q = query.trim().toLowerCase();
    const items = getCategoryPresets(category);
    const filtered = q
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.sub.toLowerCase().includes(q),
        )
      : items;

    if (filtered.length === 0) {
      return (
        <div className="py-8 text-center text-xs font-medium text-gray-400">
          Không tìm thấy phần tử phù hợp
        </div>
      );
    }

    return filtered.map((item) => {
      const isLocked =
        isPremiumLandingBlock(item.blockType) && !landingAccess.canUseAdvancedBlocks;

      return (
        <div
          key={item.id}
          onClick={() => {
            if (isLocked) {
              onPremiumBlocked?.();
              return;
            }
            onAddBlock(item.blockType, item.props);
          }}
          className={`group flex cursor-pointer select-none flex-col gap-2 border-b border-gray-100 bg-white px-4 py-3 transition hover:bg-gray-50 ${
            isLocked ? "opacity-70" : ""
          }`}
          title={isLocked ? "Yêu cầu gói Pro" : "Click để chèn vào cuối trang"}
        >
          <div className="pointer-events-none w-full">{item.element}</div>
          <div className="flex select-none items-center justify-between">
            <span className="max-w-[200px] truncate text-[11px] font-extrabold uppercase tracking-wide text-gray-800 group-hover:text-[#5b21b6]">
              {item.label}
            </span>
            <span className="text-[11px] font-black text-gray-400 transition group-hover:text-[#5b21b6]">
              {isLocked ? "Yêu cầu Pro" : "+ Thêm"}
            </span>
          </div>
        </div>
      );
    });
  };

  const subCategoryColumn = (
    <div
      className={`flex flex-shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white ${
        layout === "drawer" ? "w-[240px]" : "w-[132px] bg-gray-50"
      }`}
    >
      {ELEMENT_CATEGORIES.map((catId) => {
        const isActive = activeCategory === catId;
        return (
          <button
            key={catId}
            type="button"
            onClick={() => handleCategorySelect(catId)}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-l-2 px-4 py-2.5 text-left transition-all ${
              isActive
                ? "border-[#5b21b6] bg-purple-50 font-bold text-[#5b21b6]"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
              {CATEGORY_ICONS[catId]}
            </span>
            <span className="truncate text-[12px] font-semibold">
              {CATEGORY_LABELS[catId]}
            </span>
          </button>
        );
      })}
    </div>
  );

  const presetsColumn = (
    <div
      className={`flex flex-1 flex-col overflow-hidden bg-white ${
        layout === "drawer" ? "min-w-[420px]" : ""
      }`}
    >
      <div className="flex-shrink-0 border-b border-gray-100 px-4 py-3">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
            />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm preset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#5b21b6] focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderPresets(activeCategory, search)}
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden">
      {subCategoryColumn}
      {presetsColumn}
    </div>
  );
};
