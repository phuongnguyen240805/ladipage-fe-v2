"use client";
import React from "react";
import Image from "next/image";
import { resolveLandingPublicViewUrl } from "@/features/landing-domain-edge/services/free-subdomain.service";
import { DeviceMode } from "./types";

interface EditorTopBarProps {
  pageName: string;
  setPageName: (name: string) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onSave: () => void;
  onCreateRevision: () => void;
  onOpenCommand: () => void;
  onImportJson: () => void;
  onImportHtml: () => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onPublish: () => void;
  onUnpublish?: () => void;
  isSaved: boolean;
  isSaving?: boolean;
  lastSavedAt?: string | null;
  activeViewMode: "design" | "code" | "preview";
  setActiveViewMode: (mode: "design" | "code" | "preview") => void;
  blockCount: number;
  pageStatus?: string;
  pageVisibility?: string;
  pageSlug?: string | null;
  onOpenElements?: () => void;
  onOpenLayers?: () => void;
  onOpenAssets?: () => void;
  onOpenAI?: () => void;
  isAiOpen?: boolean;
}

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5];

const QuickIcon: React.FC<{
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  active?: boolean;
}> = ({ title, onClick, children, active }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition ${
      active
        ? "bg-purple-50 text-[#5b21b6]"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  pageName,
  setPageName,
  deviceMode,
  setDeviceMode,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClose,
  onSave,
  onCreateRevision,
  onOpenCommand,
  onImportJson,
  onImportHtml,
  onExportJson,
  onExportHtml,
  onPublish,
  onUnpublish,
  isSaved,
  isSaving = false,
  lastSavedAt,
  activeViewMode,
  setActiveViewMode,
  blockCount,
  pageStatus = "draft",
  pageVisibility = "private",
  pageSlug,
  onOpenElements,
  onOpenLayers,
  onOpenAssets,
  onOpenAI,
  isAiOpen = false,
}) => {
  const isPublished = pageStatus === "published" && pageVisibility === "public";
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);
  const toolsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyPublicLink = () => {
    if (!isPublished) {
      alert("Trang chưa xuất bản, người khác chưa xem được.\nHãy bấm 'Xem và xuất bản' trước.");
      return;
    }
    const slug =
      pageSlug ||
      pageName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    // Plan A free subdomain when enabled — do not hardcode /p/{slug}
    const link = resolveLandingPublicViewUrl(slug, {
      origin: window.location.origin,
    });
    navigator.clipboard.writeText(link).then(() => {
      alert(`Đã sao chép link công khai:\n${link}`);
    });
  };

  return (
    <div className="flex h-16 select-none items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* LEFT — logo + quick tools */}
      <button
        type="button"
        onClick={onClose}
        className="mr-0.5 flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50"
        title="Quay lại"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 p-1">
        <Image src="/images/logo/logo-icon.svg" alt="Logo" width={24} height={24} className="h-6 w-6" />
      </div>

      <QuickIcon title="Thêm phần tử" onClick={onOpenElements}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </QuickIcon>

      <QuickIcon title="Layers" onClick={onOpenLayers}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
        </svg>
      </QuickIcon>

      <QuickIcon title="Phần tử / Grid" onClick={onOpenElements}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </QuickIcon>

      {onOpenAssets && (
        <QuickIcon title="Assets" onClick={onOpenAssets}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
          </svg>
        </QuickIcon>
      )}

      <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          className="max-w-[160px] truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-gray-800 transition hover:border-gray-200 hover:bg-gray-50 focus:border-[#5b21b6] focus:outline-none"
          spellCheck={false}
        />
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {blockCount} blocks
        </span>
      </div>

      <div className="flex-1" />

      {/* CENTER */}
      <div className="flex flex-shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác (Ctrl+Z)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Làm lại (Ctrl+Y)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
        <div className="mx-0.5 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onClick={onOpenAI}
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            isAiOpen
              ? "bg-[#5b21b6] text-white shadow-sm"
              : "bg-white text-[#5b21b6] hover:bg-purple-50"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L9 21zm0 0l6.6-6.6a1.5 1.5 0 10-2.12-2.12l-6.6 6.6M9 21l6.6-6.6m-6.6 6.6L9 21zm0 0V9m0 0l-3.3 3.3M9 9l3.3 3.3" />
          </svg>
          AI
        </button>
      </div>

      {/* Device + Zoom — compact */}
      <div className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 lg:flex">
        {([
          {
            mode: "desktop" as DeviceMode,
            title: "Desktop",
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
            ),
          },
          {
            mode: "tablet" as DeviceMode,
            title: "Tablet",
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ),
          },
          {
            mode: "mobile" as DeviceMode,
            title: "Mobile",
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 18.75h3" />
              </svg>
            ),
          },
        ]).map(({ mode, title, icon }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setDeviceMode(mode)}
            title={title}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition ${
              deviceMode === mode ? "bg-[#5b21b6] text-white" : "text-gray-500 hover:bg-white"
            }`}
          >
            {icon}
          </button>
        ))}
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-7 cursor-pointer rounded-lg border-0 bg-transparent px-1 text-[11px] font-semibold text-gray-700 focus:outline-none"
        >
          {ZOOM_PRESETS.map((z) => (
            <option key={z} value={z}>{Math.round(z * 100)}%</option>
          ))}
        </select>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-gray-200 md:block" />

      {/* Save status */}
      <div className="hidden items-center gap-1.5 text-xs md:flex">
        {isSaving ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <span className="font-semibold text-blue-600">Đang lưu...</span>
          </>
        ) : isSaved ? (
          <span className="font-semibold text-green-600">
            {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Đã lưu"}
          </span>
        ) : (
          <span className="font-semibold text-amber-500">Chưa lưu</span>
        )}
      </div>

      {/* Tools dropdown */}
      <div className="relative flex-shrink-0" ref={toolsRef}>
        <button
          type="button"
          onClick={() => setIsToolsOpen((prev) => !prev)}
          className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-[11px] font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {isToolsOpen && (
          <div className="absolute right-0 z-[9999] mt-1.5 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
            <button type="button" disabled={isSaved || isSaving} onClick={() => { if (!isSaved && !isSaving) { setIsToolsOpen(false); onSave(); } }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-45">Lưu thiết kế</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onCreateRevision(); }} className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Tạo bản lưu</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onOpenCommand(); }} className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Command Palette</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); setActiveViewMode("code"); }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Code View</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onImportJson(); }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Nhập JSON</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onImportHtml(); }} className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Nhập HTML/ZIP</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onExportJson(); }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Xuất JSON</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); onExportHtml(); }} className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Xuất HTML</button>
            <button type="button" onClick={() => { setIsToolsOpen(false); handleCopyPublicLink(); }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50">Copy link công khai</button>
            {isPublished && onUnpublish && (
              <button type="button" onClick={() => { setIsToolsOpen(false); onUnpublish(); }} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50">Hủy xuất bản</button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT actions */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:flex"
      >
        Lưu
      </button>

      <button
        type="button"
        onClick={() => setActiveViewMode(activeViewMode === "preview" ? "design" : "preview")}
        className={`hidden h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-4 text-xs font-bold transition sm:flex ${
          activeViewMode === "preview"
            ? "border-[#5b21b6] bg-purple-50 text-[#5b21b6]"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        Xem trước
      </button>

      <button
        type="button"
        onClick={onPublish}
        className="flex h-9 flex-shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#5b21b6] px-4 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition hover:bg-[#4c1d95] active:scale-[0.98]"
      >
        Xem và xuất bản
      </button>
    </div>
  );
};