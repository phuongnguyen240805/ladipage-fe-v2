"use client";
import React, { useState } from "react";
import { BlockType, EditorBlock } from "./types";
import { BLOCK_ICONS } from "./presets/CategoryPresets";
import { ElementPalettePanel } from "./components/ElementPalettePanel";

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero Section",
  text: "Văn bản",
  image: "Hình ảnh",
  button: "Nút CTA",
  spacer: "Khoảng cách",
  divider: "Đường kẻ",
  columns: "Bố cục cột",
  feature_card: "Feature Card",
  testimonial: "Nhận xét",
  countdown: "Đếm ngược",
  video: "Video",
  form_capture: "Thu thập leads",
  chat_widget: "Chat widget",
  funnel_popup: "Funnel popup",
  tea_landing: "Herb Tea Page",
  smartwatch_landing: "Smartwatch Page",
  gallery: "Gallery",
  box: "Hình hộp",
  icon: "Biểu tượng",
  product_card: "Sản phẩm mẫu",
  collection_list: "Collection List",
  carousel: "Carousel",
  tabs: "Tabs",
  frame: "Frame",
  accordion: "Accordion",
  table: "Table",
  survey: "Survey",
  menu: "Menu",
  html_code: "Mã HTML",
  product_section: "Section sản phẩm",
  form_section: "Section biểu mẫu",
  footer: "Footer trang",
  custom_section: "Section tùy chỉnh",
};

const LAYER_CHILDREN: Partial<Record<BlockType, string[]>> = {
  hero: ["Headline", "Subheadline", "CTA Button"],
  text: ["Text"],
  image: ["Image", "Caption"],
  button: ["Button Label"],
  columns: ["Column 1", "Column 2"],
  feature_card: ["Icon", "Title", "Description"],
  testimonial: ["Quote", "Author", "Rating"],
  countdown: ["Title", "Timer Units"],
  video: ["Embed"],
  form_capture: ["Title", "Fields", "Submit Button"],
  chat_widget: ["Header", "Agent", "Channels", "Survey"],
  funnel_popup: ["Trigger", "Content", "CTA", "Frequency"],
  tea_landing: ["Navigation", "Hero", "Blends", "Ingredients", "Reviews", "Signup"],
  smartwatch_landing: ["Header", "Hero", "Specs Card", "Countdown", "Reviews", "Order Form"],
};

// ── Layers Panel Item (Recursive Tree View) ─────────────────────────────────
const LayerItem: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  selectedId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onSetBlockLocked: (id: string, locked: boolean) => void;
  onSetBlockHidden: (id: string, hidden: boolean) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  depth?: number;
}> = ({
  block,
  isSelected,
  selectedId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onSetBlockLocked,
  onSetBlockHidden,
  onMoveNodeZIndex,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const columns = block.type === "columns" && Array.isArray(block.props.children)
    ? block.props.children as EditorBlock[][]
    : null;

  const childrenToRender: { block?: EditorBlock; label?: string; isVirtual?: boolean; children?: EditorBlock[] }[] = [];

  if (columns) {
    columns.forEach((col, colIdx) => {
      if (col.length > 0) {
        childrenToRender.push({
          label: `Cột ${colIdx + 1}`,
          isVirtual: true,
          children: col,
        });
      }
    });
  } else if (block.children && block.children.length > 0) {
    block.children.forEach((child) => {
      childrenToRender.push({ block: child });
    });
  }

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="text-gray-800" style={{ marginLeft: depth > 0 ? 6 : 0 }}>
      <div
        onClick={() => onSelectBlock(block.id)}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition border group cursor-pointer ${
          isSelected
            ? "bg-purple-50 text-purple-750 border-purple-250 font-semibold shadow-sm"
            : "text-gray-650 hover:bg-gray-50 border-transparent"
        }`}
      >
        {childrenToRender.length > 0 ? (
          <button
            onClick={toggleOpen}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
          >
            <svg
              className={`w-2.5 h-2.5 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="text-gray-450 flex-shrink-0 w-3.5 h-3.5 group-hover:text-purple-650 transition">
          {BLOCK_ICONS[block.type] ?? BLOCK_ICONS.box}
        </span>

        <span className={`flex-1 truncate text-xs ${block.hidden ? "line-through text-gray-400" : ""}`}>
          {block.label || BLOCK_LABELS[block.type] || block.type}
        </span>

        {/* Action icons directly on layers */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {block.kind !== "section" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNodeZIndex(block.id, "forward");
                }}
                title="Lên trên (zIndex + 1)"
                className="text-gray-400 hover:text-purple-650 p-0.5 rounded hover:bg-gray-150 transition cursor-pointer font-bold text-[10px]"
              >
                ▲
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNodeZIndex(block.id, "backward");
                }}
                title="Xuống dưới (zIndex - 1)"
                className="text-gray-400 hover:text-purple-650 p-0.5 rounded hover:bg-gray-150 transition cursor-pointer font-bold text-[10px]"
              >
                ▼
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetBlockHidden(block.id, !block.hidden);
            }}
            className={`p-0.5 rounded hover:bg-gray-150 transition cursor-pointer ${
              block.hidden ? "text-red-500" : "text-gray-400 hover:text-gray-700"
            }`}
            title={block.hidden ? "Hiện phần tử" : "Ẩn phần tử"}
          >
            {block.hidden ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.824 7.824L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetBlockLocked(block.id, !block.locked);
            }}
            className={`p-0.5 rounded hover:bg-gray-150 transition cursor-pointer ${
              block.locked ? "text-amber-500" : "text-gray-400 hover:text-gray-700"
            }`}
            title={block.locked ? "Mở khóa" : "Khóa vị trí"}
          >
            {block.locked ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateBlock(block.id);
            }}
            className="text-gray-400 hover:text-blue-600 p-0.5 rounded hover:bg-gray-150 transition cursor-pointer"
            title="Nhân đôi"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.197 0-.39.024-.577.07m6.75 4.43V7.5c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
            className="text-gray-405 hover:text-red-600 p-0.5 rounded hover:bg-gray-150 transition cursor-pointer"
            title="Xóa"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && childrenToRender.length > 0 && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-150 pl-1.5">
          {childrenToRender.map((item, idx) => {
            if (item.isVirtual && item.children) {
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 px-2 py-0.5 select-none">
                    {item.label}
                  </div>
                  <div className="ml-1 border-l border-gray-150 pl-1.5">
                    {item.children.map((childBlock) => (
                      <LayerItem
                        key={childBlock.id}
                        block={childBlock}
                        isSelected={selectedId === childBlock.id}
                        selectedId={selectedId}
                        onSelectBlock={onSelectBlock}
                        onDeleteBlock={onDeleteBlock}
                        onDuplicateBlock={onDuplicateBlock}
                        onSetBlockLocked={onSetBlockLocked}
                        onSetBlockHidden={onSetBlockHidden}
                        onMoveNodeZIndex={onMoveNodeZIndex}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                </div>
              );
            } else if (item.block) {
              return (
                <LayerItem
                  key={item.block.id}
                  block={item.block}
                  isSelected={selectedId === item.block.id}
                  selectedId={selectedId}
                  onSelectBlock={onSelectBlock}
                  onDeleteBlock={onDeleteBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onSetBlockLocked={onSetBlockLocked}
                  onSetBlockHidden={onSetBlockHidden}
                  onMoveNodeZIndex={onMoveNodeZIndex}
                  depth={depth + 1}
                />
              );
            }
            return null;
          })}
        </div>
      )}

      {isOpen && block.type === "html_code" &&
        Array.isArray(block.props?.htmlOutline) &&
        block.props.htmlOutline.length > 0 && (
          <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2">
            {(block.props.htmlOutline as Array<{
              id: string;
              tag: string;
              kind?: string;
              label: string;
            }>).slice(0, 120).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`block w-full truncate rounded px-2 py-1 text-left text-xs transition ${
                  ["HEADER", "NAV", "HERO", "SECTION", "MAIN", "FOOTER"].includes(
                    String(item.kind || "").toUpperCase(),
                  )
                    ? "bg-gray-50 font-bold text-gray-900 hover:bg-purple-100 hover:text-purple-700"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectBlock(block.id);
                  window.dispatchEvent(
                    new CustomEvent("EASY_MANAGER_HTML_SELECT_REQUEST", {
                      detail: {
                        blockId: block.id,
                        elementId: item.id,
                      },
                    }),
                  );
                }}
                title={item.label}
              >
                {["HEADER", "NAV", "HERO", "SECTION", "MAIN", "FOOTER"].includes(
                  String(item.kind || "").toUpperCase(),
                )
                  ? `▣ ${item.label}`
                  : `• ${item.label}`}
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

// ── Main Left Panel (Light Theme) ───────────────────────────────────────────
interface LayersPanelProps {
  sections: EditorBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (blockType: BlockType, customProps?: Record<string, unknown>) => void;
  onPremiumBlocked?: () => void;
  onDuplicateBlock: (id: string) => void;
  onSetBlockLocked: (id: string, locked: boolean) => void;
  onSetBlockHidden: (id: string, hidden: boolean) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  defaultTab?: "layers" | "components";
  hideTabs?: boolean;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  sections,
  selectedId,
  onSelectBlock,
  onDeleteBlock,
  onAddBlock,
  onPremiumBlocked,
  onDuplicateBlock,
  onSetBlockLocked,
  onSetBlockHidden,
  onMoveNodeZIndex,
  defaultTab = "components",
  hideTabs = false,
}) => {
  const [tab, setTab] = useState<"layers" | "components">(defaultTab);

  return (
    <div className="w-full flex flex-col bg-white h-full overflow-hidden">
      {/* Tabs */}
      {!hideTabs && (
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 px-4 py-2">
          <div className="flex w-full rounded-md border border-gray-200/50 bg-gray-100 p-0.5 select-none">
            {(["components", "layers"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`cursor-pointer flex-1 rounded py-1.5 text-[10px] font-extrabold tracking-widest transition uppercase ${
                  tab === t
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t === "components" ? "Thêm phần tử" : "Quản lý Layers"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {tab === "components" ? (
          <ElementPalettePanel
            onAddBlock={onAddBlock}
            onPremiumBlocked={onPremiumBlocked}
            layout="compact"
          />
        ) : (
          /* Layers tab - single scrollable column list of existing blocks */
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-white">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                <p className="text-xs text-gray-400 font-bold">Chưa có block nào trên canvas.</p>
                <p className="text-[10px] text-gray-450 mt-1 max-w-[160px] leading-relaxed">Hãy thêm khối từ bảng phần tử bên trái.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sections.map((block) => (
                  <LayerItem
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    selectedId={selectedId}
                    onSelectBlock={onSelectBlock}
                    onDeleteBlock={onDeleteBlock}
                    onDuplicateBlock={onDuplicateBlock}
                    onSetBlockLocked={onSetBlockLocked}
                    onSetBlockHidden={onSetBlockHidden}
                    onMoveNodeZIndex={onMoveNodeZIndex}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
