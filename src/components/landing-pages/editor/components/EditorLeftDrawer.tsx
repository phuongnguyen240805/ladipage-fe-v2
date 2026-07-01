"use client";

import React from "react";
import { BlockType, EditorBlock, EditorData } from "../types";
import { LandingEditorAction } from "../editor-actions";
import { LandingPageItem } from "../../dung-chung/types";
import { ElementPalettePanel } from "./ElementPalettePanel";
import { LayersPanel } from "../LayersPanel";
import { TemplatesAssetsPanel } from "../panels/TemplatesAssetsPanel";
import { BrandingPanel } from "../panels/BrandingPanel";
import { PageListingPanel } from "../panels/PageListingPanel";
import { FunnelPanel } from "../panels/FunnelPanel";
import { SandboxPanel } from "../panels/SandboxPanel";
import { HistoryPanel } from "../panels/HistoryPanel";
import { BranchesPanel } from "../panels/BranchesPanel";
import { LANDING_TEMPLATE_PRESETS } from "../template-library";
export type LeftRailAction =
  | "elements"
  | "layers"
  | "assets"
  | "section"
  | "pages"
  | "brand"
  | "funnel"
  | "history"
  | "sandbox"
  | "branches";

export type DrawerCategoryId = LeftRailAction | "products" | "media" | "documents";

interface EditorRevision {
  id: string;
  name: string;
  snapshot: { data: EditorData; actions: LandingEditorAction[]; html: string; updatedAt: string };
  createdAt: string;
}

interface EditorLeftDrawerProps {
  isOpen: boolean;
  category: DrawerCategoryId;
  onClose: () => void;
  onCategoryChange: (category: DrawerCategoryId) => void;
  elementPresetCategory?: string;
  onElementPresetCategoryChange?: (category: string) => void;
  sections: EditorBlock[];
  selectedId: string | null;
  pageSettings: EditorData["pageSettings"];
  page: LandingPageItem;
  pages?: LandingPageItem[];
  actionLog: LandingEditorAction[];
  revisions: EditorRevision[];
  sandboxPreviewUrl: string;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (blockType: BlockType, customProps?: Record<string, unknown>) => void;
  onPremiumBlocked?: () => void;
  onDuplicateBlock: (id: string) => void;
  onSetBlockLocked: (id: string, locked: boolean) => void;
  onSetBlockHidden: (id: string, hidden: boolean) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  onApplyTemplate: (templateId: string, mode: "append" | "replace") => void;
  onUseAsset: (url: string, name: string) => void;
  onUpdatePageSettings: (key: string, value: string | number | boolean) => void;
  onSwitchPage?: (page: LandingPageItem) => void;
  onCreatePage?: (name: string) => LandingPageItem;
  onDeletePage?: (id: string) => void;
  onCreateRevision: () => void;
  onRestoreRevision: (revision: EditorRevision) => void;
  formatActionLabel: (action: LandingEditorAction) => string;
  showToast: (message: string, type?: "success" | "info") => void;
}

const DRAWER_CATEGORIES: { id: DrawerCategoryId; label: string }[] = [
  { id: "elements", label: "Phần tử" },
  { id: "assets", label: "Assets" },
  { id: "section", label: "Section" },
  { id: "funnel", label: "Popup" },
  { id: "sandbox", label: "Dropbox" },
  { id: "products", label: "Sản phẩm" },
  { id: "branches", label: "Blog" },
  { id: "history", label: "Tiện ích" },
  { id: "pages", label: "Quản lý nội dung" },
  { id: "media", label: "Quản lý Media" },
  { id: "documents", label: "Quản lý tài liệu" },
  { id: "brand", label: "Quản lý Font" },
  { id: "layers", label: "Layers" },
];

const SectionTemplatesPanel: React.FC<{
  onApplyTemplate: (templateId: string, mode: "append" | "replace") => void;
}> = ({ onApplyTemplate }) => {
  const sectionTemplates = LANDING_TEMPLATE_PRESETS.filter((t) => t.category === "section");

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
        Mẫu Section
      </h3>
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {sectionTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-purple-300 hover:bg-purple-50/30"
          >
            <div className="text-xs font-bold text-gray-800">{template.name}</div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-gray-500">
              {template.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onApplyTemplate(template.id, "append")}
                className="cursor-pointer rounded-lg border border-purple-200 py-1.5 text-[10px] font-bold text-purple-700 transition hover:bg-purple-50"
              >
                Thêm tiếp
              </button>
              <button
                type="button"
                onClick={() => onApplyTemplate(template.id, "replace")}
                className="cursor-pointer rounded-lg border border-gray-200 py-1.5 text-[10px] font-bold text-gray-700 transition hover:bg-gray-100"
              >
                Dùng mẫu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompatibilityPanel: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex h-full flex-col overflow-hidden">
    <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
        {title}
      </p>
      <p className="mt-0.5 text-[11px] text-amber-600">{description}</p>
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

export const EditorLeftDrawer: React.FC<EditorLeftDrawerProps> = ({
  isOpen,
  category,
  onClose,
  onCategoryChange,
  sections,
  selectedId,
  pageSettings,
  page,
  pages,
  actionLog,
  revisions,
  sandboxPreviewUrl,
  onSelectBlock,
  onDeleteBlock,
  onAddBlock,
  onPremiumBlocked,
  onDuplicateBlock,
  onSetBlockLocked,
  onSetBlockHidden,
  onMoveNodeZIndex,
  onApplyTemplate,
  onUseAsset,
  onUpdatePageSettings,
  onSwitchPage,
  onCreatePage,
  onDeletePage,
  onCreateRevision,
  onRestoreRevision,
  formatActionLabel,
  showToast,
  elementPresetCategory,
  onElementPresetCategoryChange,
}) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (category) {
      case "elements":
      case "products":
        return (
          <ElementPalettePanel
            key={category === "products" ? "product" : (elementPresetCategory ?? "text")}
            onAddBlock={onAddBlock}
            onPremiumBlocked={onPremiumBlocked}
            layout="drawer"
            initialCategory={category === "products" ? "product" : elementPresetCategory}
            onCategoryChange={onElementPresetCategoryChange}
          />
        );
      case "media":
        return (
          <TemplatesAssetsPanel
            onApplyTemplate={onApplyTemplate}
            onUseAsset={onUseAsset}
          />
        );
      case "documents":
        return (
          <CompatibilityPanel
            title="Quản lý tài liệu"
            description="Đang dùng panel Sandbox hiện có"
          >
            <SandboxPanel
              settings={pageSettings}
              onUpdateSettings={onUpdatePageSettings}
              sandboxPreviewUrl={sandboxPreviewUrl}
              showToast={showToast}
            />
          </CompatibilityPanel>
        );
      case "layers":
        return (
          <LayersPanel
            sections={sections}
            selectedId={selectedId}
            onSelectBlock={onSelectBlock}
            onDeleteBlock={onDeleteBlock}
            onAddBlock={onAddBlock}
            onPremiumBlocked={onPremiumBlocked}
            onDuplicateBlock={onDuplicateBlock}
            onSetBlockLocked={onSetBlockLocked}
            onSetBlockHidden={onSetBlockHidden}
            onMoveNodeZIndex={onMoveNodeZIndex}
            defaultTab="layers"
            hideTabs
          />
        );
      case "assets":
        return (
          <TemplatesAssetsPanel
            onApplyTemplate={onApplyTemplate}
            onUseAsset={onUseAsset}
          />
        );
      case "section":
        return <SectionTemplatesPanel onApplyTemplate={onApplyTemplate} />;
      case "pages":
        return (
          <PageListingPanel
            page={page}
            pages={pages}
            onSwitchPage={onSwitchPage}
            onCreatePage={onCreatePage}
            onDeletePage={onDeletePage}
          />
        );
      case "brand":
        return (
          <CompatibilityPanel
            title="Quản lý Font & Branding"
            description="Đang dùng panel Branding hiện có"
          >
            <BrandingPanel settings={pageSettings} onUpdateSettings={onUpdatePageSettings} />
          </CompatibilityPanel>
        );
      case "funnel":
        return (
          <CompatibilityPanel
            title="Popup & Funnel"
            description="Đang dùng panel Funnel hiện có"
          >
            <FunnelPanel settings={pageSettings} onUpdateSettings={onUpdatePageSettings} />
          </CompatibilityPanel>
        );
      case "history":
        return (
          <CompatibilityPanel
            title="Tiện ích"
            description="Đang dùng panel Lịch sử hiện có"
          >
            <HistoryPanel
              actionLog={actionLog}
              revisions={revisions}
              onCreateRevision={onCreateRevision}
              onRestoreRevision={onRestoreRevision}
              formatActionLabel={formatActionLabel}
            />
          </CompatibilityPanel>
        );
      case "sandbox":
        return (
          <CompatibilityPanel
            title="Dropbox / Sandbox"
            description="Đang dùng panel Sandbox hiện có"
          >
            <SandboxPanel
              settings={pageSettings}
              onUpdateSettings={onUpdatePageSettings}
              sandboxPreviewUrl={sandboxPreviewUrl}
              showToast={showToast}
            />
          </CompatibilityPanel>
        );
      case "branches":
        return (
          <CompatibilityPanel
            title="Blog / Branches"
            description="Đang dùng panel Branches hiện có"
          >
            <BranchesPanel />
          </CompatibilityPanel>
        );
      default:
        return null;
    }
  };

  const isThreeColumn = category === "elements" || category === "products";

  return (
    <>
      <button
        type="button"
        aria-label="Đóng panel"
        className="fixed inset-0 z-40 bg-black/20"
        style={{ top: "64px" }}
        onClick={onClose}
      />
      <div
        className="fixed z-50 flex overflow-hidden rounded-r-2xl border border-gray-200 bg-white shadow-2xl"
        style={{ top: "64px", bottom: 0, left: "72px", maxWidth: "calc(100vw - 88px)" }}
      >
        {/* Column 1: main categories */}
        <div className="flex w-[200px] flex-shrink-0 flex-col border-r border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-xs font-bold text-gray-700">Thư viện</span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {DRAWER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full cursor-pointer px-4 py-2.5 text-left text-[12px] font-semibold transition ${
                  category === cat.id
                    ? "border-l-2 border-[#5b21b6] bg-white text-[#5b21b6]"
                    : "border-l-2 border-transparent text-gray-600 hover:bg-white/80 hover:text-gray-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2+3: content */}
        <div
          className={`flex overflow-hidden bg-white ${
            isThreeColumn ? "w-[min(760px,calc(100vw-256px))]" : "w-[min(480px,calc(100vw-256px))]"
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};