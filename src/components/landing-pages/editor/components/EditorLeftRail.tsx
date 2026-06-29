"use client";

import React, { useCallback } from "react";
import { DraggablePanel } from "./DraggablePanel";
import {
  EDITOR_PANEL_EDGE_PADDING,
  EDITOR_TOPBAR_HEIGHT,
  LEFT_RAIL_STORAGE_KEY,
  getDefaultLeftRailPosition,
} from "../hooks/useDraggablePanel";
import { LeftRailAction } from "./EditorLeftDrawer";

export type { LeftRailAction };

export type LeftRailClickAction = LeftRailAction | "add" | "video" | "select";

interface RailItem {
  id: LeftRailClickAction;
  label: string;
  icon: React.ReactNode;
}

interface EditorLeftRailProps {
  activeAction: LeftRailAction | null;
  isDrawerOpen: boolean;
  onAction: (action: LeftRailClickAction) => void;
}

export const RAIL_WIDTH = 44;

const RailIconButton: React.FC<{
  item: RailItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    type="button"
    title={item.label}
    onClick={onClick}
    data-no-drag
    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[10px] transition-all ${
      isActive
        ? "bg-[#5b21b6] text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`}
  >
    {item.icon}
  </button>
);

export const EditorLeftRail: React.FC<EditorLeftRailProps> = ({
  activeAction,
  isDrawerOpen,
  onAction,
}) => {
  const getBounds = useCallback(() => {
    const panelEl = document.querySelector('[data-panel-id="left-rail"]');
    const panelHeight = panelEl instanceof HTMLElement ? panelEl.offsetHeight : 400;

    return {
      minX: EDITOR_PANEL_EDGE_PADDING,
      minY: EDITOR_TOPBAR_HEIGHT + EDITOR_PANEL_EDGE_PADDING,
      maxX: Math.max(
        EDITOR_PANEL_EDGE_PADDING,
        window.innerWidth - RAIL_WIDTH - EDITOR_PANEL_EDGE_PADDING,
      ),
      maxY: Math.max(
        EDITOR_TOPBAR_HEIGHT + EDITOR_PANEL_EDGE_PADDING,
        window.innerHeight - panelHeight - EDITOR_PANEL_EDGE_PADDING,
      ),
    };
  }, []);

  const isDrawerCategory = (id: LeftRailClickAction): id is LeftRailAction =>
    id !== "add" && id !== "video" && id !== "select";

  const items: RailItem[] = [
    {
      id: "assets",
      label: "Hình ảnh / Assets",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 21h19.5a1.5 1.5 0 0 0 1.5-1.5V5.25A1.5 1.5 0 0 0 20.25 3.75H3.75A1.5 1.5 0 0 0 2.25 5.25v14.25Z" />
        </svg>
      ),
    },
    {
      id: "elements",
      label: "Văn bản / Phần tử",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      ),
    },
    {
      id: "section",
      label: "Hình hộp / Section",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ),
    },
    {
      id: "layers",
      label: "Layers",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75v-.008Zm0 5.25h.007v.008H3.75v-.008Z" />
        </svg>
      ),
    },
    {
      id: "select",
      label: "Chọn / Pointer",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
        </svg>
      ),
    },
    {
      id: "funnel",
      label: "Popup / Hiệu ứng",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
    },
    {
      id: "video",
      label: "Video",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      id: "add",
      label: "Thêm phần tử",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
  ];

  return (
    <DraggablePanel
      id="left-rail"
      storageKey={LEFT_RAIL_STORAGE_KEY}
      panelWidth={RAIL_WIDTH}
      defaultPosition={getDefaultLeftRailPosition}
      getBounds={getBounds}
      zIndex={30}
      maxHeightOffset={96}
    >
      {({ dragHandleProps, isDragging }) => (
        <aside className="flex w-11 flex-col items-center gap-1 overflow-hidden rounded-[14px] border border-slate-200/90 bg-white/95 px-1 py-1.5 shadow-md backdrop-blur-sm">
          <div
            {...dragHandleProps}
            className={`flex w-full items-center justify-center py-1 touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div className="grid grid-cols-2 gap-[3px] text-slate-300" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} className="h-[3px] w-[3px] rounded-full bg-current" />
              ))}
            </div>
          </div>

          <div className="h-px w-5 bg-slate-200" data-no-drag />

          <div className="flex flex-col items-center gap-1 pb-0.5" data-no-drag>
            {items.map((item) => (
              <RailIconButton
                key={item.id}
                item={item}
                isActive={isDrawerOpen && isDrawerCategory(item.id) && activeAction === item.id}
                onClick={() => onAction(item.id)}
              />
            ))}
          </div>
        </aside>
      )}
    </DraggablePanel>
  );
};