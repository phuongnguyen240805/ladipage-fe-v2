"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorBlock, BlockType, EditorData, DeviceMode, DEVICE_WIDTHS, ElementFrame, getEffectiveFrame, getNodeKind } from "./types";
import { findBlockRecursive } from "./core/editor-reducer";
import { DraggablePanel } from "./components/DraggablePanel";
import { getBlockDisplayLabel } from "./components/EditorContextToolbar";
import {
  computePanelBounds,
  EDITOR_PANEL_EDGE_PADDING,
  EDITOR_TOPBAR_HEIGHT,
  getDefaultInspectorPosition,
  INSPECTOR_PANEL_STORAGE_KEY,
  type DragHandleProps,
} from "./hooks/useDraggablePanel";
import type { InspectorMode } from "./inspector-state";

const INSPECTOR_PANEL_WIDTH = 288;

type AlignAction = "left" | "centerH" | "right" | "top" | "centerV" | "bottom";

function getSectionNaturalHeight(section: EditorBlock): number {
  return (
    section.frame?.height ??
    (typeof section.props?.minHeight === "number"
      ? (section.props.minHeight as number)
      : 500)
  );
}

function getParentBounds(
  block: EditorBlock,
  sections: EditorBlock[],
  canvasWidth: number,
): { width: number; height: number } | null {
  let parentId = block.parentId;
  if (!parentId) {
    const parentSection = sections.find((s) => s.children?.some((c) => c.id === block.id));
    if (parentSection) parentId = parentSection.id;
  }
  if (!parentId) return null;
  const parent = findBlockRecursive(sections, parentId);
  if (!parent) return null;
  return {
    width: parent.frame?.width ?? canvasWidth,
    height: getSectionNaturalHeight(parent),
  };
}

const IconBtn: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  disabledTitle?: string;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, disabledTitle, danger, active, children }) => (
  <button
    type="button"
    title={disabled ? (disabledTitle ?? "Không hỗ trợ") : title}
    disabled={disabled}
    onClick={onClick}
    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-35 ${
      danger
        ? "text-red-500 hover:bg-red-50"
        : active
        ? "bg-[#ede9fe] text-[#3b0df6]"
        : "text-[#111827] hover:bg-[#f3f4f6]"
    }`}
  >
    {children}
  </button>
);

const AlignIconButton = IconBtn;

const InspectorAlignToolbar: React.FC<{
  block: EditorBlock;
  sections: EditorBlock[];
  deviceMode: DeviceMode;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
}> = ({ block, sections, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame }) => {
  const canvasWidth = DEVICE_WIDTHS[deviceMode];
  const frame = getEffectiveFrame(block, deviceMode);
  const bounds = getParentBounds(block, sections, canvasWidth);
  const nodeKind = getNodeKind(block.type, block.kind);
  const canAlign = nodeKind !== "section" && Boolean(bounds);

  const applyAlign = (action: AlignAction) => {
    if (!bounds || !canAlign) return;
    let patch: Partial<ElementFrame> = {};
    switch (action) {
      case "left":
        patch = { x: 0 };
        break;
      case "centerH":
        patch = { x: Math.round((bounds.width - frame.width) / 2) };
        break;
      case "right":
        patch = { x: Math.max(0, bounds.width - frame.width) };
        break;
      case "top":
        patch = { y: 0 };
        break;
      case "centerV":
        patch = { y: Math.round((bounds.height - frame.height) / 2) };
        break;
      case "bottom":
        patch = { y: Math.max(0, bounds.height - frame.height) };
        break;
    }
    if (deviceMode === "desktop") {
      onUpdateNodeFrame(block.id, patch);
    } else {
      onUpdateResponsiveFrame(block.id, deviceMode, patch);
    }
  };

  const alignDisabledTitle = "Không đủ thông tin parent để căn chỉnh";

  return (
    <div className="mb-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-2.5 py-2">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Căn chỉnh</p>
      <div className="flex flex-wrap items-center gap-0.5">
        <AlignIconButton title="Căn trái" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("left")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 5v14M9 8h11M9 12h8M9 16h11" /></svg>
        </AlignIconButton>
        <AlignIconButton title="Căn giữa ngang" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("centerH")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4v16M7 8h10M8 12h8M7 16h10" /></svg>
        </AlignIconButton>
        <AlignIconButton title="Căn phải" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("right")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M20 5v14M4 8h11M6 12h9M4 16h11" /></svg>
        </AlignIconButton>
        <AlignIconButton title="Căn trên" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("top")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 4h14M8 9v11M12 8v12M16 9v11" /></svg>
        </AlignIconButton>
        <AlignIconButton title="Căn giữa dọc" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("centerV")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 12h16M8 7v10M12 6v12M16 7v10" /></svg>
        </AlignIconButton>
        <AlignIconButton title="Căn dưới" disabledTitle={alignDisabledTitle} onClick={() => applyAlign("bottom")} disabled={!canAlign}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 20h14M8 4v11M12 4v12M16 4v11" /></svg>
        </AlignIconButton>
      </div>
    </div>
  );
};

function getSiblingZRange(blockId: string, sections: EditorBlock[]): { min: number; max: number } {
  const block = findBlockRecursive(sections, blockId);
  if (!block) return { min: 1, max: 99 };
  let parentId = block.parentId;
  if (!parentId) {
    const parentSection = sections.find((s) => s.children?.some((c) => c.id === blockId));
    if (parentSection) parentId = parentSection.id;
  }
  if (!parentId) return { min: 1, max: 99 };
  const parent = findBlockRecursive(sections, parentId);
  const siblings = parent?.children ?? [];
  const zValues = siblings.map((s) => s.frame?.zIndex ?? 1);
  return {
    min: Math.min(...zValues, 1),
    max: Math.max(...zValues, 1),
  };
}

const LayerMenuButton: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}> = ({ label, onClick, danger, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex h-8 w-full cursor-pointer items-center px-3 text-left text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger ? "text-red-600 hover:bg-red-50" : "text-[#111827] hover:bg-[#f3f4f6]"
    }`}
  >
    {label}
  </button>
);

const InspectorLayerPanel: React.FC<{
  block: EditorBlock;
  sections: EditorBlock[];
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveNodeZIndex?: (direction: "forward" | "backward") => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onMoveSectionFirst?: () => void;
  onMoveSectionLast?: () => void;
  onToggleHidden?: () => void;
  isHidden?: boolean;
}> = ({
  block,
  sections: _sections,
  onDuplicate,
  onDelete,
  onMoveNodeZIndex,
  onBringToFront,
  onSendToBack,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveSectionFirst,
  onMoveSectionLast,
  onToggleHidden,
  isHidden,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSection = getNodeKind(block.type, block.kind) === "section";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const hasActions =
    onMoveNodeZIndex ||
    onBringToFront ||
    onSendToBack ||
    onMoveSectionUp ||
    onMoveSectionDown ||
    onMoveSectionFirst ||
    onMoveSectionLast ||
    onToggleHidden;

  if (!hasActions) return null;

  return (
    <div className="relative mb-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-2.5 py-2" ref={menuRef}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Lớp / Thứ tự</p>
        <div className="flex items-center gap-0.5">
          <IconBtn title="Menu lớp" onClick={() => setOpen((v) => !v)} active={open}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6h12M6 12h12M6 18h12" />
            </svg>
          </IconBtn>
          <IconBtn title="Nhân bản" onClick={onDuplicate}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9m9 9H3.375" />
            </svg>
          </IconBtn>
          <IconBtn title="Xóa" onClick={onDelete} danger>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </IconBtn>
        </div>
      </div>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[200px] overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white py-0.5 shadow-lg">
          {isSection && onMoveSectionUp && (
            <LayerMenuButton label="Di chuyển section lên" onClick={() => { onMoveSectionUp(); setOpen(false); }} />
          )}
          {isSection && onMoveSectionDown && (
            <LayerMenuButton label="Di chuyển section xuống" onClick={() => { onMoveSectionDown(); setOpen(false); }} />
          )}
          {isSection && onMoveSectionFirst && (
            <LayerMenuButton label="Đưa section lên đầu" onClick={() => { onMoveSectionFirst(); setOpen(false); }} />
          )}
          {isSection && onMoveSectionLast && (
            <LayerMenuButton label="Đưa section xuống cuối" onClick={() => { onMoveSectionLast(); setOpen(false); }} />
          )}
          {!isSection && onMoveNodeZIndex && (
            <LayerMenuButton label="Đưa lên một lớp" onClick={() => { onMoveNodeZIndex("forward"); setOpen(false); }} />
          )}
          {!isSection && onMoveNodeZIndex && (
            <LayerMenuButton label="Đưa xuống một lớp" onClick={() => { onMoveNodeZIndex("backward"); setOpen(false); }} />
          )}
          {!isSection && onBringToFront && (
            <LayerMenuButton label="Đưa lên trên cùng" onClick={() => { onBringToFront(); setOpen(false); }} />
          )}
          {!isSection && onSendToBack && (
            <LayerMenuButton label="Đưa xuống dưới cùng" onClick={() => { onSendToBack(); setOpen(false); }} />
          )}
          {!isSection && onMoveNodeZIndex && (
            <LayerMenuButton label="Tăng z-index" onClick={() => { onMoveNodeZIndex("forward"); setOpen(false); }} />
          )}
          {!isSection && onMoveNodeZIndex && (
            <LayerMenuButton label="Giảm z-index" onClick={() => { onMoveNodeZIndex("backward"); setOpen(false); }} />
          )}
          {onToggleHidden && (
            <LayerMenuButton
              label={isHidden ? "Hiện phần tử" : isSection ? "Ẩn section" : "Ẩn phần tử"}
              onClick={() => { onToggleHidden(); setOpen(false); }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ── Field sub-components (Light Theme) ──────────────────────────────────────

const FieldLabel: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
  <label className="mb-0.5 block text-[9px] font-extrabold uppercase tracking-wider text-[#64748b] select-none">
    {label}
    {hint && <span className="ml-1 font-normal normal-case text-gray-400">({hint})</span>}
  </label>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}> = ({ label, value, onChange, hint, multiline, rows = 3 }) => (
  <div className="py-0.5">
    <FieldLabel label={label} hint={hint} />
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="h-auto min-h-[48px] w-full resize-none rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-[#3b0df6] focus:outline-none shadow-sm font-sans"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7.5 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-800 placeholder-gray-400 focus:border-[#3b0df6] focus:outline-none shadow-sm font-sans"
      />
    )}
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  onChangeSilent?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  noSlider?: boolean;
}> = ({ label, value, onChange, onChangeSilent, min = 0, max = 2000, step = 1, unit, hint, noSlider = false }) => {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setLocal(value);
    setPrevValue(value);
  }

  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    setLocal(clamped);
    onChange(clamped);
  };

  if (noSlider) {
    return (
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#64748b] w-4 select-none">{label}</span>
        <div className="flex h-7.5 w-full items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={local}
            onChange={(e) => {
              const next = Number(e.target.value);
              setLocal(next);
              if (onChangeSilent) onChangeSilent(next);
              else onChange(next);
            }}
            onBlur={() => commit(local)}
            onKeyDown={(e) => e.key === "Enter" && commit(local)}
            className="w-full bg-transparent text-right text-[11px] font-semibold text-gray-800 focus:outline-none"
          />
          {unit && <span className="text-[9px] font-bold text-gray-400 select-none pl-0.5">{unit}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="py-0.5">
      <FieldLabel label={label} hint={hint} />
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local}
          onChange={(e) => {
            const next = Number(e.target.value);
            setLocal(next);
            if (onChangeSilent) onChangeSilent(next);
            else onChange(next);
          }}
          onPointerUp={(e) => {
            if (onChangeSilent) commit(Number((e.currentTarget as HTMLInputElement).value));
          }}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#3b0df6] hover:accent-[#2a0bc2]"
        />
        <div className="flex h-7.5 min-w-[54px] items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1 shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={local}
            onChange={(e) => setLocal(Number(e.target.value))}
            onBlur={() => commit(local)}
            onKeyDown={(e) => e.key === "Enter" && commit(local)}
            className="w-full bg-transparent text-right text-[11px] font-semibold text-gray-800 focus:outline-none"
          />
          {unit && <span className="text-[9px] font-bold text-gray-400 select-none pr-0.5">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="py-0.5">
    <FieldLabel label={label} />
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-[28px] h-[28px] rounded-md border border-gray-200 cursor-pointer bg-transparent p-0.5 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7.5 flex-1 px-2 text-xs border border-gray-200 bg-white rounded-md text-gray-800 focus:outline-none focus:border-[#3b0df6] font-mono shadow-sm"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="py-0.5">
    <FieldLabel label={label} />
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7.5 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-800 focus:border-[#3b0df6] focus:outline-none shadow-sm font-sans"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const ToggleField: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-wide select-none">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-8 h-4.5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#3b0df6]" : "bg-gray-300"}`}
    >
      <span className={`absolute top-[1.5px] left-[1.5px] w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-3.5" : ""}`} />
    </button>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-1.5 mt-2 flex items-center gap-2 first:mt-0 select-none">
    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#94a3b8]">{title}</span>
    <div className="h-[0.5px] flex-1 bg-gray-150" />
  </div>
);

// ── Per-block field definitions ───────────────────────────────

type UpdateFn = (key: string, value: unknown) => void;

const HeroInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Tiêu đề chính" value={p.headline as string} onChange={(v) => update("headline", v)} />
    <TextField label="Tiêu đề phụ" value={p.subheadline as string} onChange={(v) => update("subheadline", v)} multiline />
    <TextField label="Nút CTA — văn bản" value={p.ctaText as string} onChange={(v) => update("ctaText", v)} />
    <TextField label="Nút CTA — đường dẫn" value={p.ctaUrl as string} onChange={(v) => update("ctaUrl", v)} hint="URL" />
    <SectionHeader title="Hình thức" />
    <SelectField label="Căn chỉnh văn bản" value={p.textAlign as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("textAlign", v)} />
    <NumberField label="Chiều cao tối thiểu" value={p.minHeight as number} onChange={(v) => update("minHeight", v)} onChangeSilent={updateSilent ? (v) => updateSilent("minHeight", v) : undefined} min={200} max={1000} step={10} unit="px" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nút CTA" value={p.ctaColor as string} onChange={(v) => update("ctaColor", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <TextField label="URL ảnh nền" value={p.bgImage as string} onChange={(v) => update("bgImage", v)} hint="https://..." />
    {p.bgImage && (
      <NumberField label="Độ mờ overlay" value={p.overlayOpacity as number} onChange={(v) => update("overlayOpacity", v)} onChangeSilent={updateSilent ? (v) => updateSilent("overlayOpacity", v) : undefined} min={0} max={1} step={0.05} hint="0–1" />
    )}
  </>
);

const TextInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Văn bản" value={p.content as string} onChange={(v) => update("content", v)} multiline />
    <SectionHeader title="Typography" />
    <NumberField label="Kích thước chữ" value={p.fontSize as number} onChange={(v) => update("fontSize", v)} onChangeSilent={updateSilent ? (v) => updateSilent("fontSize", v) : undefined} min={10} max={80} unit="px" />
    <NumberField label="Chiều cao dòng" value={p.lineHeight as number} onChange={(v) => update("lineHeight", v)} onChangeSilent={updateSilent ? (v) => updateSilent("lineHeight", v) : undefined} min={1} max={3} step={0.05} hint="x" />
    <SelectField label="Căn chỉnh" value={p.textAlign as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("textAlign", v)} />
    <SectionHeader title="Màu & Khoảng cách" />
    <ColorField label="Màu chữ" value={p.color as string} onChange={(v) => update("color", v)} />
    <NumberField label="Padding trái/phải" value={p.paddingX as number} onChange={(v) => update("paddingX", v)} onChangeSilent={updateSilent ? (v) => updateSilent("paddingX", v) : undefined} max={200} unit="px" />
    <NumberField label="Padding trên/dưới" value={p.paddingY as number} onChange={(v) => update("paddingY", v)} onChangeSilent={updateSilent ? (v) => updateSilent("paddingY", v) : undefined} max={200} unit="px" />
  </>
);

const ImageInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Hình ảnh" />
    <TextField label="URL ảnh" value={p.src as string} onChange={(v) => update("src", v)} hint="https://..." />
    <TextField label="Alt text" value={p.alt as string} onChange={(v) => update("alt", v)} />
    <TextField label="Caption" value={p.caption as string} onChange={(v) => update("caption", v)} />
    <SectionHeader title="Hình thức" />
    <SelectField label="Kích thước" value={p.width as string} options={[{value:"full",label:"Toàn chiều rộng"},{value:"large",label:"Lớn (80%)"},{value:"medium",label:"Trung bình (60%)"},{value:"small",label:"Nhỏ (40%)"}]} onChange={(v) => update("width", v)} />
    <SelectField label="Object fit" value={p.objectFit as string} options={[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"fill",label:"Fill"}]} onChange={(v) => update("objectFit", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={48} unit="px" />
    <ToggleField label="Hiện caption" value={p.showCaption as boolean} onChange={(v) => update("showCaption", v)} />
  </>
);

const ButtonInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Văn bản nút" value={p.label as string} onChange={(v) => update("label", v)} />
    <TextField label="Đường dẫn (URL)" value={p.url as string} onChange={(v) => update("url", v)} />
    <SectionHeader title="Giao diện" />
    <SelectField label="Kiểu nút" value={p.style as string} options={[{value:"filled",label:"Đặc (Filled)"},{value:"outline",label:"Viền (Outline)"},{value:"ghost",label:"Ghost"}]} onChange={(v) => update("style", v)} />
    <SelectField label="Kích thước" value={p.size as string} options={[{value:"sm",label:"Nhỏ"},{value:"md",label:"Trung bình"},{value:"lg",label:"Lớn"}]} onChange={(v) => update("size", v)} />
    <SelectField label="Căn chỉnh" value={p.align as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("align", v)} />
    <SectionHeader title="Màu sắc & Bo góc" />
    <ColorField label="Màu nền / viền" value={p.color as string} onChange={(v) => update("color", v)} />
    <ColorField label="Màu chữ" value={p.textColor as string} onChange={(v) => update("textColor", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={50} unit="px" />
    <ToggleField label="Toàn chiều rộng" value={p.fullWidth as boolean} onChange={(v) => update("fullWidth", v)} />
  </>
);

const SpacerInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Khoảng cách" />
    <NumberField label="Chiều cao" value={p.height as number} onChange={(v) => update("height", v)} onChangeSilent={updateSilent ? (v) => updateSilent("height", v) : undefined} min={8} max={400} step={4} unit="px" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nền" value={(p.bgColor as string) === "transparent" ? "#ffffff" : (p.bgColor as string)} onChange={(v) => update("bgColor", v)} />
  </>
);

const DividerInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Đường kẻ" />
    <ColorField label="Màu" value={p.color as string} onChange={(v) => update("color", v)} />
    <NumberField label="Độ dày" value={p.thickness as number} onChange={(v) => update("thickness", v)} onChangeSilent={updateSilent ? (v) => updateSilent("thickness", v) : undefined} min={1} max={10} unit="px" />
    <SelectField label="Kiểu đường" value={p.style as string} options={[{value:"solid",label:"Liền"},{value:"dashed",label:"Gạch"},{value:"dotted",label:"Chấm"}]} onChange={(v) => update("style", v)} />
    <SectionHeader title="Khoảng cách" />
    <NumberField label="Padding trên/dưới" value={p.paddingY as number} onChange={(v) => update("paddingY", v)} onChangeSilent={updateSilent ? (v) => updateSilent("paddingY", v) : undefined} max={100} unit="px" />
  </>
);

const ColumnsInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Bố cục" />
    <NumberField label="Số cột" value={p.columns as number} onChange={(v) => update("columns", v)} onChangeSilent={updateSilent ? (v) => updateSilent("columns", v) : undefined} min={2} max={4} step={1} />
    <NumberField label="Khoảng cách giữa cột" value={p.gap as number} onChange={(v) => update("gap", v)} onChangeSilent={updateSilent ? (v) => updateSilent("gap", v) : undefined} min={0} max={80} unit="px" />
  </>
);

const FeatureCardInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Icon (emoji)" value={p.icon as string} onChange={(v) => update("icon", v)} />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Mô tả" value={p.description as string} onChange={(v) => update("description", v)} multiline />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu icon" value={p.iconColor as string} onChange={(v) => update("iconColor", v)} />
    <ColorField label="Nền icon" value={p.iconBg as string} onChange={(v) => update("iconBg", v)} />
    <ColorField label="Màu nền card" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu viền" value={p.borderColor as string} onChange={(v) => update("borderColor", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={32} unit="px" />
  </>
);

const TestimonialInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Nội dung nhận xét" value={p.quote as string} onChange={(v) => update("quote", v)} multiline />
    <TextField label="Tên tác giả" value={p.authorName as string} onChange={(v) => update("authorName", v)} />
    <TextField label="Chức danh" value={p.authorRole as string} onChange={(v) => update("authorRole", v)} />
    <TextField label="URL avatar" value={p.authorAvatar as string} onChange={(v) => update("authorAvatar", v)} hint="https://..." />
    <SectionHeader title="Đánh giá & Màu sắc" />
    <NumberField label="Số sao" value={p.rating as number} onChange={(v) => update("rating", v)} onChangeSilent={updateSilent ? (v) => updateSilent("rating", v) : undefined} min={1} max={5} step={1} unit="★" />
    <ToggleField label="Hiện đánh giá sao" value={p.showRating as boolean} onChange={(v) => update("showRating", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu chữ" value={p.textColor as string} onChange={(v) => update("textColor", v)} />
  </>
);

const CountdownInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent: _updateSilent }) => (
  <>
    <SectionHeader title="Cài đặt" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <div>
      <FieldLabel label="Ngày đếm ngược đến" />
      <input
        type="date"
        value={(p.targetDate as string).slice(0, 10)}
        onChange={(e) => update("targetDate", e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
      />
    </div>
    <TextField label="Văn bản khi hết hạn" value={p.expiredText as string} onChange={(v) => update("expiredText", v)} />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu accent (ô số)" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
  </>
);

const VideoInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => (
  <>
    <SectionHeader title="Video" />
    <TextField label="URL YouTube / Vimeo" value={p.url as string} onChange={(v) => update("url", v)} hint="https://..." />
    <SelectField label="Tỷ lệ khung hình" value={p.aspectRatio as string} options={[{value:"16/9",label:"16:9 (Widescreen)"},{value:"4/3",label:"4:3 (Standard)"},{value:"1/1",label:"1:1 (Vuông)"}]} onChange={(v) => update("aspectRatio", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={32} unit="px" />
    <SectionHeader title="Điều khiển" />
    <ToggleField label="Tự động phát" value={p.autoplay as boolean} onChange={(v) => update("autoplay", v)} />
    <ToggleField label="Tắt tiếng" value={p.muted as boolean} onChange={(v) => update("muted", v)} />
    <ToggleField label="Hiện controls" value={p.controls as boolean} onChange={(v) => update("controls", v)} />
  </>
);

const FormCaptureInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => {
  const fields = p.fields as { id: string; label: string; type: string; required: boolean }[];
  return (
    <>
      <SectionHeader title="Nội dung form" />
      <TextField label="Tiêu đề form" value={p.title as string} onChange={(v) => update("title", v)} />
      <TextField label="Mô tả" value={p.subtitle as string} onChange={(v) => update("subtitle", v)} />
      <TextField label="Văn bản nút gửi" value={p.submitLabel as string} onChange={(v) => update("submitLabel", v)} />
      <SectionHeader title="Màu sắc & Bo góc" />
      <ColorField label="Màu nút gửi" value={p.submitColor as string} onChange={(v) => update("submitColor", v)} />
      <ColorField label="Màu nền form" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
      <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={32} unit="px" />
      <SectionHeader title={`Trường nhập (${fields.length})`} />
      {fields.map((f, i) => (
        <div key={f.id} className="p-2.5 bg-gray-50 border border-gray-250 rounded-lg mb-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Trường {i + 1}</span>
            {fields.length > 1 && (
              <button
                onClick={() => {
                  const next = fields.filter((_, fi) => fi !== i);
                  update("fields", next);
                }}
                className="text-red-500 text-[10px] hover:text-red-650 font-bold"
              >
                Xóa
              </button>
            )}
          </div>
          <input
            type="text"
            value={f.label}
            placeholder="Nhãn trường"
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], label: e.target.value };
              update("fields", next);
            }}
            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 mb-1.5 shadow-inner"
          />
          <select
            value={f.type}
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], type: e.target.value };
              update("fields", next);
            }}
            className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            <option value="text">Văn bản</option>
            <option value="email">Email</option>
            <option value="phone">Điện thoại</option>
          </select>
        </div>
      ))}
      <button
        onClick={() => update("fields", [...fields, { id: `f_${Date.now()}`, label: "Trường mới", type: "text", required: false }])}
        className="cursor-pointer w-full text-xs text-purple-600 border border-purple-300 rounded-lg py-2 hover:bg-purple-50 transition bg-white shadow-sm font-semibold"
      >
        + Thêm trường
      </button>
    </>
  );
};

const TeaLandingInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Template Herb Tea" />
    <TextField label="Brand Name" value={p.brand as string} onChange={(v) => update("brand", v)} />
    <TextField label="Hero Image Link" value={p.heroImage as string} onChange={(v) => update("heroImage", v)} hint="URL" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu Accent" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Nền trang" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

const ChatWidgetInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Chat widget" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Lời chào" value={p.greeting as string} onChange={(v) => update("greeting", v)} multiline />
    <TextField label="Tên tư vấn viên" value={p.agentName as string} onChange={(v) => update("agentName", v)} />
    <TextField label="Thời gian phản hồi" value={p.replyTime as string} onChange={(v) => update("replyTime", v)} />
    <SectionHeader title="Kênh liên hệ" />
    <TextField label="Kênh chính" value={p.primaryChannel as string} onChange={(v) => update("primaryChannel", v)} />
    <TextField label="Kênh phụ" value={p.secondaryChannel as string} onChange={(v) => update("secondaryChannel", v)} />
    <TextField label="Nút bắt đầu" value={p.buttonLabel as string} onChange={(v) => update("buttonLabel", v)} />
    <SectionHeader title="Hiển thị" />
    <SelectField label="Vị trí" value={p.position as string} options={[{ value: "right", label: "Phải" }, { value: "left", label: "Trái" }]} onChange={(v) => update("position", v)} />
    <ToggleField label="Hiện câu hỏi nhanh" value={p.showSurvey as boolean} onChange={(v) => update("showSurvey", v)} />
    <ColorField label="Màu chính" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

const FunnelPopupInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Funnel popup" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Mô tả" value={p.description as string} onChange={(v) => update("description", v)} multiline />
    <TextField label="Nút CTA" value={p.ctaText as string} onChange={(v) => update("ctaText", v)} />
    <TextField label="Đường dẫn CTA" value={p.ctaUrl as string} onChange={(v) => update("ctaUrl", v)} />
    <SectionHeader title="Trigger" />
    <SelectField
      label="Kiểu kích hoạt"
      value={p.trigger as string}
      options={[
        { value: "immediate", label: "Ngay lập tức" },
        { value: "time_on_page", label: "Theo thời gian" },
        { value: "scroll_progress", label: "Theo cuộn trang" },
        { value: "exit_intent", label: "Thoát trang" },
        { value: "inactivity", label: "Không hoạt động" },
      ]}
      onChange={(v) => update("trigger", v)}
    />
    <NumberField label="Ngưỡng trigger" value={p.triggerValue as number} onChange={(v) => update("triggerValue", v)} min={0} max={10000} step={100} />
    <SelectField label="Tần suất" value={p.frequency as string} options={[{ value: "once", label: "Một lần" }, { value: "session", label: "Mỗi phiên" }, { value: "always", label: "Luôn hiện" }]} onChange={(v) => update("frequency", v)} />
    <SectionHeader title="Giao diện" />
    <TextField label="Ảnh popup" value={p.imageUrl as string} onChange={(v) => update("imageUrl", v)} hint="URL" />
    <ToggleField label="Nền mờ" value={p.showBackdrop as boolean} onChange={(v) => update("showBackdrop", v)} />
    <ColorField label="Màu CTA" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Màu nền popup" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

// ── NEW: Product Card / Grid Inspector ────────────────────────
const ProductCardInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; updateSilent?: UpdateFn }> = ({ props: p, update, updateSilent }) => {
  const items = p.items as { id: string; title: string; description: string; price: string; oldPrice?: string; image: string; badge?: string }[] | undefined;
  const isGrid = Array.isArray(items) && items.length > 0;

  const convertToGrid = () => {
    update("items", [
      {
        id: `p_${Date.now()}_1`,
        title: (p.title as string) || "Sản phẩm 1",
        description: (p.description as string) || "Mô tả sản phẩm 1",
        price: (p.price as string) || "399.000đ",
        oldPrice: (p.oldPrice as string) || "550.000đ",
        image: (p.image as string) || "/images/product/skincare_product.png",
        badge: (p.badge as string) || "Bán chạy"
      },
      {
        id: `p_${Date.now()}_2`,
        title: "Sản phẩm 2",
        description: "Mô tả sản phẩm 2",
        price: "249.000đ",
        oldPrice: "320.000đ",
        image: "/images/product/green_tea_product.png",
        badge: "Mới"
      }
    ]);
    update("columns", 2);
  };

  const convertToSingle = () => {
    if (isGrid && items.length > 0) {
      const first = items[0];
      update("title", first.title);
      update("description", first.description);
      update("price", first.price);
      update("oldPrice", first.oldPrice || "");
      update("image", first.image);
      update("badge", first.badge || "");
    }
    update("items", undefined);
    update("columns", undefined);
  };

  return (
    <>
      <SectionHeader title="Cài đặt khối sản phẩm" />
      <TextField label="Văn bản nút mua" value={(p.ctaText as string) || "MUA NGAY"} onChange={(v) => update("ctaText", v)} />
      <ColorField label="Màu nền khối" value={(p.bgColor as string) || "#ffffff"} onChange={(v) => update("bgColor", v)} />
      <ColorField label="Màu viền" value={(p.borderColor as string) || "#e2e8f0"} onChange={(v) => update("borderColor", v)} />
      <NumberField label="Bo góc thẻ" value={(p.borderRadius as number) || 16} onChange={(v) => update("borderRadius", v)} onChangeSilent={updateSilent ? (v) => updateSilent("borderRadius", v) : undefined} max={32} unit="px" />

      {isGrid ? (
        <>
          <SectionHeader title="Cấu hình lưới (Grid)" />
          <NumberField label="Số cột hiển thị" value={(p.columns as number) || 2} onChange={(v) => update("columns", v)} onChangeSilent={updateSilent ? (v) => updateSilent("columns", v) : undefined} min={1} max={4} step={1} />
          <button
            onClick={convertToSingle}
            className="cursor-pointer w-full text-center text-xs font-semibold text-purple-650 bg-purple-50 border border-purple-200 py-2 rounded-lg hover:bg-purple-100 transition mt-2 mb-4 shadow-sm"
          >
            Chuyển về 1 sản phẩm đơn lẻ
          </button>

          <SectionHeader title={`Danh sách sản phẩm (${items.length})`} />
          {items.map((item, idx) => (
            <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500">Sản phẩm #{idx + 1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => {
                      const next = items.filter((_, i) => i !== idx);
                      update("items", next);
                    }}
                    className="text-red-500 text-[10px] hover:text-red-650 font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.title}
                placeholder="Tên sản phẩm"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], title: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              <textarea
                value={item.description}
                placeholder="Mô tả chi tiết"
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], description: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 resize-none shadow-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.price}
                  placeholder="Giá bán (399.000đ)"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], price: e.target.value };
                    update("items", next);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
                />
                <input
                  type="text"
                  value={item.oldPrice || ""}
                  placeholder="Giá cũ (nếu có)"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], oldPrice: e.target.value };
                    update("items", next);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>
              <input
                type="text"
                value={item.image}
                placeholder="Đường dẫn ảnh sản phẩm"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], image: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              <input
                type="text"
                value={item.badge || ""}
                placeholder="Nhãn (ví dụ: Bán chạy, Mới)"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], badge: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newId = `p_${Date.now()}`;
              update("items", [
                ...items,
                {
                  id: newId,
                  title: `Sản phẩm #${items.length + 1}`,
                  description: "Mô tả sản phẩm mới thêm.",
                  price: "299.000đ",
                  oldPrice: "",
                  image: "/images/product/skincare_product.png",
                  badge: ""
                }
              ]);
            }}
            className="cursor-pointer w-full text-xs text-purple-650 border border-purple-300 rounded-lg py-2 hover:bg-purple-50 transition bg-white shadow-sm font-semibold"
          >
            + Thêm sản phẩm vào lưới
          </button>
        </>
      ) : (
        <>
          <SectionHeader title="Thông tin sản phẩm" />
          <button
            onClick={convertToGrid}
            className="cursor-pointer w-full text-center text-xs font-semibold text-purple-650 bg-purple-50 border border-purple-250 py-2 rounded-lg hover:bg-purple-100 transition mt-1 mb-4 shadow-sm"
          >
            Chuyển sang dạng lưới nhiều sản phẩm
          </button>
          <TextField label="Tên sản phẩm" value={(p.title as string) || ""} onChange={(v) => update("title", v)} />
          <TextField label="Mô tả sản phẩm" value={(p.description as string) || ""} onChange={(v) => update("description", v)} multiline />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Giá bán" value={(p.price as string) || ""} onChange={(v) => update("price", v)} />
            <TextField label="Giá cũ" value={(p.oldPrice as string) || ""} onChange={(v) => update("oldPrice", v)} />
          </div>
          <TextField label="Ảnh sản phẩm" value={(p.image as string) || ""} onChange={(v) => update("image", v)} hint="URL hoặc đường dẫn" />
          <TextField label="Nhãn nổi bật" value={(p.badge as string) || ""} onChange={(v) => update("badge", v)} hint="Ví dụ: Bán chạy" />
        </>
      )}
    </>
  );
};

const HtmlCodeElementInspector: React.FC<{ block?: EditorBlock }> = ({ block }) => {
  const htmlSelectedElement = (block?.props?.selectedHtmlElement ?? null) as {
    id?: string;
    tag?: string;
    label?: string;
    text?: string;
    href?: string;
    src?: string;
    alt?: string;
  } | null;

  const patchHtmlElement = (patch: Record<string, unknown>) => {
    if (!htmlSelectedElement?.id || !block) return;

    window.dispatchEvent(
      new CustomEvent("EASY_MANAGER_HTML_PATCH_REQUEST", {
        detail: {
          blockId: block.id,
          elementId: htmlSelectedElement.id,
          patch,
        },
      }),
    );
  };

  if (!htmlSelectedElement) {
    return (
      <p className="text-[11px] leading-relaxed text-gray-500">
        Chọn phần tử trong HTML preview để chỉnh nội dung. Mã nguồn nằm ở tab Nâng cao.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-2.5">
      <div className="mb-2">
        <div className="text-[10px] font-black uppercase text-purple-700">Element đang chọn</div>
        <div className="mt-0.5 text-xs font-bold text-gray-900">
          {htmlSelectedElement.label || htmlSelectedElement.tag}
        </div>
        <div className="text-[10px] text-gray-500">ID: {htmlSelectedElement.id}</div>
      </div>

      {htmlSelectedElement.tag !== "img" && htmlSelectedElement.tag !== "video" && (
        <div className="mb-2">
          <label className="mb-1 block text-[10px] font-bold text-gray-600">Sửa nội dung chữ</label>
          <textarea
            key={`${htmlSelectedElement.id}-text`}
            className="min-h-[72px] w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none focus:border-purple-500"
            defaultValue={htmlSelectedElement.text || ""}
            onBlur={(event) => patchHtmlElement({ action: "setText", text: event.target.value })}
          />
        </div>
      )}

      {htmlSelectedElement.tag === "a" && (
        <div className="mb-2">
          <label className="mb-1 block text-[10px] font-bold text-gray-600">Sửa link href</label>
          <input
            key={`${htmlSelectedElement.id}-href`}
            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none focus:border-purple-500"
            defaultValue={htmlSelectedElement.href || ""}
            onBlur={(event) => patchHtmlElement({ action: "setAttribute", attributes: { href: event.target.value } })}
          />
        </div>
      )}

      {(htmlSelectedElement.tag === "img" || htmlSelectedElement.tag === "video") && (
        <div className="mb-2">
          <label className="mb-1 block text-[10px] font-bold text-gray-600">Sửa source URL</label>
          <input
            key={`${htmlSelectedElement.id}-src`}
            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none focus:border-purple-500"
            defaultValue={htmlSelectedElement.src || ""}
            onBlur={(event) => patchHtmlElement({ action: "replaceImage", src: event.target.value })}
          />
        </div>
      )}

      {htmlSelectedElement.tag === "img" && (
        <div className="mb-2">
          <label className="mb-1 block text-[10px] font-bold text-gray-600">Sửa alt text</label>
          <input
            key={`${htmlSelectedElement.id}-alt`}
            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none focus:border-purple-500"
            defaultValue={htmlSelectedElement.alt || ""}
            onBlur={(event) => patchHtmlElement({ action: "replaceImage", src: htmlSelectedElement.src || "", alt: event.target.value })}
          />
        </div>
      )}
    </div>
  );
};

const HtmlCodeAdvancedInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Mã HTML nhúng" />
    <TextField label="Mã HTML/CSS/JS" value={(p.code as string) ?? ""} onChange={(v) => update("code", v)} multiline rows={12} />
    <NumberField label="Chiều cao tối thiểu" value={(p.height as number) ?? 200} onChange={(v) => update("height", v)} min={50} max={1500} unit="px" />
  </>
);

const _HtmlCodeInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn; block?: EditorBlock }> = ({ props: p, update, block }) => {
  const htmlSelectedElement = (block?.props?.selectedHtmlElement ?? null) as {
    id?: string;
    tag?: string;
    label?: string;
    text?: string;
    href?: string;
    src?: string;
    alt?: string;
  } | null;

  const patchHtmlElement = (patch: Record<string, unknown>) => {
    if (!htmlSelectedElement?.id || !block) return;

    window.dispatchEvent(
      new CustomEvent("EASY_MANAGER_HTML_PATCH_REQUEST", {
        detail: {
          blockId: block.id,
          elementId: htmlSelectedElement.id,
          patch,
        },
      }),
    );
  };

  return (
    <>
      <SectionHeader title="Mã HTML nhúng" />

      {htmlSelectedElement && (
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-3">
          <div className="mb-3">
            <div className="text-xs font-black uppercase text-purple-700">
              Element đang chọn
            </div>

            <div className="mt-1 text-sm font-bold text-gray-900">
              {htmlSelectedElement.label || htmlSelectedElement.tag}
            </div>

            <div className="text-xs text-gray-500">
              ID: {htmlSelectedElement.id}
            </div>
          </div>

          {htmlSelectedElement.tag !== "img" &&
            htmlSelectedElement.tag !== "video" && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  Sửa nội dung chữ
                </label>

                <textarea
                  key={`${htmlSelectedElement.id}-text`}
                  className="min-h-[90px] w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                  defaultValue={htmlSelectedElement.text || ""}
                  onBlur={(event) => {
                    patchHtmlElement({
                      action: "setText",
                      text: event.target.value,
                    });
                  }}
                />
              </div>
            )}

          {htmlSelectedElement.tag === "a" && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Sửa link href
              </label>

              <input
                key={`${htmlSelectedElement.id}-href`}
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                defaultValue={htmlSelectedElement.href || ""}
                onBlur={(event) => {
                  patchHtmlElement({
                    action: "setAttribute",
                    attributes: { href: event.target.value },
                  });
                }}
              />
            </div>
          )}

          {(htmlSelectedElement.tag === "img" ||
            htmlSelectedElement.tag === "video") && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Sửa source URL
              </label>

              <input
                key={`${htmlSelectedElement.id}-src`}
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                defaultValue={htmlSelectedElement.src || ""}
                onBlur={(event) => {
                  patchHtmlElement({
                    action: "replaceImage",
                    src: event.target.value,
                  });
                }}
              />
            </div>
          )}

          {htmlSelectedElement.tag === "img" && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Sửa alt text
              </label>

              <input
                key={`${htmlSelectedElement.id}-alt`}
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                defaultValue={htmlSelectedElement.alt || ""}
                onBlur={(event) => {
                  patchHtmlElement({
                    action: "replaceImage",
                    src: htmlSelectedElement.src || "",
                    alt: event.target.value,
                  });
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Màu chữ
              </label>

              <input
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                placeholder="#ffffff"
                onBlur={(event) => {
                  if (!event.target.value.trim()) return;

                  patchHtmlElement({
                    style: {
                      color: event.target.value,
                    },
                  });
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">
                Font size
              </label>

              <input
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-purple-500"
                placeholder="48px"
                onBlur={(event) => {
                  if (!event.target.value.trim()) return;

                  patchHtmlElement({
                    style: {
                      fontSize: event.target.value,
                    },
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      <TextField label="Mã HTML/CSS/JS" value={(p.code as string) ?? ""} onChange={(v) => update("code", v)} multiline rows={12} />
      <NumberField label="Chiều cao tối thiểu" value={(p.height as number) ?? 200} onChange={(v) => update("height", v)} min={50} max={1500} unit="px" />
    </>
  );
};

// ── Page settings (Light Theme) ─────────────────────────────────────────────
export const PageSettingsPanel: React.FC<{
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}> = ({ settings, onUpdateSettings }) => (
  <div className="space-y-1 text-gray-800">
    <SectionHeader title="Page settings" />
    <ColorField label="Màu nền trang" value={settings.bgColor} onChange={(v) => onUpdateSettings("bgColor", v)} />
    <NumberField label="Chiều rộng tối đa" value={settings.maxWidth} onChange={(v) => onUpdateSettings("maxWidth", v)} min={800} max={1920} step={40} unit="px" />
    <ColorField label="Màu accent chính" value={settings.primaryColor} onChange={(v) => onUpdateSettings("primaryColor", v)} />
    <SelectField
      label="Font chữ"
      value={settings.fontFamily}
      options={[
        { value: "Inter, sans-serif", label: "Inter" },
        { value: "Roboto, sans-serif", label: "Roboto" },
        { value: "'Be Vietnam Pro', sans-serif", label: "Be Vietnam Pro" },
        { value: "Montserrat, sans-serif", label: "Montserrat" },
        { value: "Georgia, serif", label: "Georgia (Serif)" },
      ]}
      onChange={(v) => onUpdateSettings("fontFamily", v)}
    />
    <SectionHeader title="Thiết lập SEO & Đường dẫn" />
    <TextField
      label="Đường dẫn (Slug)"
      value={settings.slug ?? ""}
      onChange={(v) => {
        const cleanSlug = v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        onUpdateSettings("slug", cleanSlug);
      }}
      hint="vi-du-duong-dan"
    />
    <TextField
      label="Tiêu đề SEO (Title)"
      value={settings.seoTitle ?? ""}
      onChange={(v) => onUpdateSettings("seoTitle", v)}
    />
    <TextField
      label="Mô tả SEO (Description)"
      value={settings.seoDescription ?? ""}
      onChange={(v) => onUpdateSettings("seoDescription", v)}
      multiline
      rows={2}
    />
  </div>
);

// ── Main Inspector Panel (Light Theme) ──────────────────────────────────────

const INSPECTOR_MAP: Partial<
  Record<
    BlockType,
    React.FC<{
      props: Record<string, unknown>;
      update: UpdateFn;
      updateSilent?: UpdateFn;
      block?: EditorBlock;
    }>
  >
> = {
  hero: HeroInspector,
  text: TextInspector,
  image: ImageInspector,
  button: ButtonInspector,
  spacer: SpacerInspector,
  divider: DividerInspector,
  columns: ColumnsInspector,
  feature_card: FeatureCardInspector,
  testimonial: TestimonialInspector,
  countdown: CountdownInspector,
  video: VideoInspector,
  form_capture: FormCaptureInspector,
  chat_widget: ChatWidgetInspector,
  funnel_popup: FunnelPopupInspector,
  tea_landing: TeaLandingInspector,
  product_card: ProductCardInspector,
};

const SectionSettingsPanel: React.FC<{
  block: EditorBlock;
  update: UpdateFn;
  onSetBlockHidden?: (hidden: boolean) => void;
  isHidden?: boolean;
}> = ({ block, update, onSetBlockHidden, isHidden = false }) => {
  const p = block.props;
  const layoutMode = (p.layoutMode as string) ?? "auto";

  return (
    <div className="mb-2 space-y-3">
      {/* Layout Mode Selection Cards */}
      <div className="space-y-2 mt-1">
        <button
          type="button"
          onClick={() => update("layoutMode", "auto")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition select-none cursor-pointer ${
            layoutMode === "auto"
              ? "border-[#3b0df6] bg-[#3b0df6]/5 text-[#3b0df6]"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded transition ${
            layoutMode === "auto" ? "bg-[#3b0df6]/10 text-[#3b0df6]" : "bg-gray-50 text-gray-400"
          }`}>
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold">Tự động</div>
            <div className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">Tự động cân chỉnh phần tử</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => update("layoutMode", "manual")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition select-none cursor-pointer ${
            layoutMode === "manual"
              ? "border-[#3b0df6] bg-[#3b0df6]/5 text-[#3b0df6]"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded transition ${
            layoutMode === "manual" ? "bg-[#3b0df6]/10 text-[#3b0df6]" : "bg-gray-50 text-gray-400"
          }`}>
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12-2.122" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold">Thủ công</div>
            <div className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">Chỉnh sửa phần tử tự do</div>
          </div>
        </button>
      </div>

      {/* Auto Arrange Mobile Button */}
      <button
        type="button"
        onClick={() => {
          update("mobileAutoArrange", true);
        }}
        className="w-full text-center text-xs font-semibold text-gray-700 bg-white border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer select-none"
      >
        Tự động sắp xếp Mobile
      </button>

      {/* Section settings toggles */}
      <div className="space-y-1 mt-1">
        <SectionHeader title="Thiết lập Section" />
        <ToggleField
          label="Section Tabs"
          value={(p.sectionTabs as boolean) ?? false}
          onChange={(v) => update("sectionTabs", v)}
        />
        {onSetBlockHidden && (
          <ToggleField
            label="Hiển thị section"
            value={!isHidden}
            onChange={(v) => onSetBlockHidden(!v)}
          />
        )}
      </div>

      {/* Section height */}
      {"minHeight" in p && (
        <div className="space-y-1">
          <SectionHeader title="Kích thước" />
          <NumberField
            label="H"
            value={(p.minHeight as number) ?? 400}
            onChange={(v) => update("minHeight", v)}
            min={80}
            max={3000}
            step={10}
            unit="px"
            noSlider
          />
        </div>
      )}

      {/* Section background */}
      <div className="space-y-1">
        <SectionHeader title="Màu & Hình nền" />
        <ColorField label="Màu nền" value={(p.bgColor as string) || "transparent"} onChange={(v) => update("bgColor", v)} />
      </div>

      {/* Section padding / border radius */}
      <div className="space-y-1.5">
        <SectionHeader title="Khoảng cách & Bo góc" />
        <NumberField label="Padding ngang" value={(p.paddingX as number) ?? 0} onChange={(v) => update("paddingX", v)} max={200} unit="px" />
        <NumberField label="Padding dọc" value={(p.paddingY as number) ?? 0} onChange={(v) => update("paddingY", v)} max={200} unit="px" />
        <NumberField label="Bo góc" value={(p.borderRadius as number) ?? 0} onChange={(v) => update("borderRadius", v)} max={64} unit="px" />
      </div>
    </div>
  );
};

const FrameInspector: React.FC<{
  block: EditorBlock;
  deviceMode: DeviceMode;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onUpdateNodeFrameSilent?: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrameSilent?: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
}> = ({ block, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame, onUpdateNodeFrameSilent, onUpdateResponsiveFrameSilent }) => {
  const frame = getEffectiveFrame(block, deviceMode);
  const isSection = getNodeKind(block.type, block.kind) === "section";

  const commitField = (key: keyof ElementFrame, value: number) => {
    const patch = { [key]: value };
    if (deviceMode === "desktop") {
      onUpdateNodeFrame(block.id, patch);
    } else {
      onUpdateResponsiveFrame(block.id, deviceMode, patch);
    }
  };

  const previewField = (key: keyof ElementFrame, value: number) => {
    const patch = { [key]: value };
    if (deviceMode === "desktop") {
      onUpdateNodeFrameSilent?.(block.id, patch);
    } else {
      onUpdateResponsiveFrameSilent?.(block.id, deviceMode, patch);
    }
  };

  const silent = onUpdateNodeFrameSilent || onUpdateResponsiveFrameSilent ? previewField : undefined;

  if (isSection) return null;

  return (
    <div className="space-y-1 mb-2.5">
      <SectionHeader title="Kích thước" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <NumberField label="W" value={frame.width} onChange={(v) => commitField("width", v)} onChangeSilent={silent ? (v) => silent("width", v) : undefined} min={20} max={3000} step={1} noSlider />
        <NumberField label="H" value={frame.height} onChange={(v) => commitField("height", v)} onChangeSilent={silent ? (v) => silent("height", v) : undefined} min={20} max={3000} step={1} noSlider />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
        <NumberField label="X" value={frame.x} onChange={(v) => commitField("x", v)} onChangeSilent={silent ? (v) => silent("x", v) : undefined} min={0} max={3000} step={1} noSlider />
        <NumberField label="Y" value={frame.y} onChange={(v) => commitField("y", v)} onChangeSilent={silent ? (v) => silent("y", v) : undefined} min={0} max={3000} step={1} noSlider />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
        <NumberField label="R" value={frame.rotate ?? 0} onChange={(v) => commitField("rotate", v)} onChangeSilent={silent ? (v) => silent("rotate", v) : undefined} min={0} max={360} step={1} unit="°" noSlider />
        <NumberField label="Z" value={frame.zIndex ?? 1} onChange={(v) => commitField("zIndex", v)} min={1} max={999} step={1} noSlider />
      </div>
    </div>
  );
};

type InspectorTab = "design" | "events" | "effects" | "advanced";

interface InspectorPanelProps {
  selectedBlock: EditorBlock | null;
  inspectorMode?: InspectorMode;
  pageSettings: EditorData["pageSettings"];
  onUpdateBlock: (id: string, newProps: Record<string, unknown>) => void;
  onUpdateBlockSilent?: (id: string, newProps: Record<string, unknown>) => void;
  onUpdatePageSettings: (key: string, value: string | number | boolean) => void;
  deviceMode: DeviceMode;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateNodeFrameSilent?: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrameSilent?: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onDuplicateBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
  onMoveNodeZIndex?: (id: string, direction: "forward" | "backward") => void;
  onMoveSectionUp?: (index: number) => void;
  onMoveSectionDown?: (index: number) => void;
  onMoveSection?: (fromIndex: number, toIndex: number) => void;
  onMoveWithinParent?: (parentId: string | undefined, columnIndex: number | undefined, fromIndex: number, toIndex: number) => void;
  onSetBlockHidden?: (id: string, hidden: boolean) => void;
  onUpdateBlockLabel?: (id: string, label: string) => void;
  handleSendChatMessage?: (text: string) => void;
  isAiTyping?: boolean;
  variant?: "sidebar" | "floating";
  onClose?: () => void;
  sections?: EditorBlock[];
}

function getInspectorTitle(block: EditorBlock | null): string {
  if (!block) return "PAGE SETTINGS";
  return getBlockDisplayLabel(block);
}

const EventFields: React.FC<{
  block: EditorBlock;
  update: UpdateFn;
}> = ({ block, update }) => {
  const p = block.props;
  const hasUrl = "url" in p || "ctaUrl" in p;
  const hasTrigger = block.type === "funnel_popup";

  if (!hasUrl && !hasTrigger && block.type !== "button" && block.type !== "hero") {
    return (
      <p className="text-xs leading-relaxed text-gray-500">
        Khối này chưa có cấu hình sự kiện/link riêng.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {"ctaUrl" in p && (
        <TextField label="Đường dẫn CTA" value={p.ctaUrl as string} onChange={(v) => update("ctaUrl", v)} hint="URL" />
      )}
      {"url" in p && (
        <TextField label="Đường dẫn (URL)" value={p.url as string} onChange={(v) => update("url", v)} />
      )}
      {hasTrigger && (
        <>
          <SelectField
            label="Kiểu kích hoạt"
            value={p.trigger as string}
            options={[
              { value: "immediate", label: "Ngay lập tức" },
              { value: "time_on_page", label: "Theo thời gian" },
              { value: "scroll_progress", label: "Theo cuộn trang" },
              { value: "exit_intent", label: "Thoát trang" },
              { value: "inactivity", label: "Không hoạt động" },
            ]}
            onChange={(v) => update("trigger", v)}
          />
          <NumberField label="Ngưỡng trigger" value={p.triggerValue as number} onChange={(v) => update("triggerValue", v)} min={0} max={10000} step={100} />
        </>
      )}
    </div>
  );
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedBlock,
  inspectorMode = "page",
  pageSettings,
  onUpdateBlock,
  onUpdateBlockSilent,
  onUpdatePageSettings,
  deviceMode,
  onUpdateNodeFrame,
  onUpdateNodeFrameSilent,
  onUpdateResponsiveFrame,
  onUpdateResponsiveFrameSilent,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveNodeZIndex,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveSection,
  onMoveWithinParent: _onMoveWithinParent,
  onSetBlockHidden,
  onUpdateBlockLabel,
  handleSendChatMessage,
  isAiTyping = false,
  variant = "sidebar",
  onClose,
  sections = [],
}) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<InspectorTab>("design");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !handleSendChatMessage) return;
    handleSendChatMessage(aiPrompt);
    setAiPrompt("");
  };

  const update: UpdateFn = useCallback(
    (key: string, value: unknown) => {
      if (!selectedBlock) return;
      onUpdateBlock(selectedBlock.id, { ...selectedBlock.props, [key]: value });
    },
    [selectedBlock, onUpdateBlock]
  );

  const updateSilent: UpdateFn | undefined = useCallback(
    (key: string, value: unknown) => {
      if (!selectedBlock || !onUpdateBlockSilent) return;
      onUpdateBlockSilent(selectedBlock.id, { ...selectedBlock.props, [key]: value });
    },
    [selectedBlock, onUpdateBlockSilent]
  );

  const showPageSettings = inspectorMode === "page" || !selectedBlock;
  const InspectorComponent = selectedBlock ? INSPECTOR_MAP[selectedBlock.type] : null;
  const nodeKind = selectedBlock ? getNodeKind(selectedBlock.type, selectedBlock.kind) : null;
  const isSection =
    inspectorMode === "section" || (!showPageSettings && nodeKind === "section");
  const isElement = Boolean(
    selectedBlock &&
      !showPageSettings &&
      !isSection &&
      (inspectorMode === "text" ||
        inspectorMode === "image" ||
        inspectorMode === "button" ||
        inspectorMode === "block" ||
        inspectorMode === "group" ||
        inspectorMode === "html" ||
        inspectorMode === "htmlSubElement"),
  );
  const sectionIndex = selectedBlock && isSection
    ? sections.findIndex((s) => s.id === selectedBlock.id)
    : -1;

  const layerPanel = selectedBlock && onDuplicateBlock && onDeleteBlock ? (
    <InspectorLayerPanel
      block={selectedBlock}
      sections={sections}
      onDuplicate={() => onDuplicateBlock(selectedBlock.id)}
      onDelete={() => onDeleteBlock(selectedBlock.id)}
      onMoveNodeZIndex={
        onMoveNodeZIndex && !isSection
          ? (dir) => onMoveNodeZIndex(selectedBlock.id, dir)
          : undefined
      }
      onBringToFront={
        !isSection
          ? () => {
              const { max } = getSiblingZRange(selectedBlock.id, sections);
              onUpdateNodeFrame(selectedBlock.id, { zIndex: max + 1 });
            }
          : undefined
      }
      onSendToBack={
        !isSection
          ? () => {
              const { min } = getSiblingZRange(selectedBlock.id, sections);
              onUpdateNodeFrame(selectedBlock.id, { zIndex: Math.max(1, min - 1) });
            }
          : undefined
      }
      onMoveSectionUp={
        isSection && sectionIndex > 0 && onMoveSectionUp
          ? () => onMoveSectionUp(sectionIndex)
          : undefined
      }
      onMoveSectionDown={
        isSection && sectionIndex >= 0 && sectionIndex < sections.length - 1 && onMoveSectionDown
          ? () => onMoveSectionDown(sectionIndex)
          : undefined
      }
      onMoveSectionFirst={
        isSection && sectionIndex > 0 && onMoveSection
          ? () => onMoveSection(sectionIndex, 0)
          : undefined
      }
      onMoveSectionLast={
        isSection && sectionIndex >= 0 && sectionIndex < sections.length - 1 && onMoveSection
          ? () => onMoveSection(sectionIndex, sections.length - 1)
          : undefined
      }
      onToggleHidden={
        onSetBlockHidden
          ? () => onSetBlockHidden(selectedBlock.id, !selectedBlock.hidden)
          : undefined
      }
      isHidden={Boolean(selectedBlock.hidden)}
    />
  ) : null;

  const tabs: { id: InspectorTab; label: string }[] = [
    { id: "design", label: "Thiết kế" },
    { id: "events", label: "Sự kiện" },
    { id: "effects", label: "Hiệu ứng" },
    { id: "advanced", label: "Nâng cao" },
  ];

  const renderTabContent = () => {
    if (activeTab === "design") {
      if (showPageSettings) {
        return <PageSettingsPanel settings={pageSettings} onUpdateSettings={onUpdatePageSettings} />;
      }

      if (isSection && selectedBlock) {
        return (
          <>
            {layerPanel}
            <SectionSettingsPanel
              block={selectedBlock}
              update={update}
              onSetBlockHidden={
                onSetBlockHidden
                  ? (hidden) => onSetBlockHidden(selectedBlock.id, hidden)
                  : undefined
              }
              isHidden={Boolean(selectedBlock.hidden)}
            />
          </>
        );
      }

      return (
        <>
          {layerPanel}
          <FrameInspector
            block={selectedBlock}
            deviceMode={deviceMode}
            onUpdateNodeFrame={onUpdateNodeFrame}
            onUpdateResponsiveFrame={onUpdateResponsiveFrame}
            onUpdateNodeFrameSilent={onUpdateNodeFrameSilent}
            onUpdateResponsiveFrameSilent={onUpdateResponsiveFrameSilent}
          />
          {isElement && sections.length > 0 && (
            <InspectorAlignToolbar
              block={selectedBlock}
              sections={sections}
              deviceMode={deviceMode}
              onUpdateNodeFrame={onUpdateNodeFrame}
              onUpdateResponsiveFrame={onUpdateResponsiveFrame}
            />
          )}
          {InspectorComponent && selectedBlock.type !== "html_code" && (
            <InspectorComponent props={selectedBlock.props} update={update} updateSilent={updateSilent} block={selectedBlock} />
          )}
        </>
      );
    }

    if (activeTab === "events" && selectedBlock) {
      return <EventFields block={selectedBlock} update={update} />;
    }

    if (activeTab === "effects") {
      return (
        <p className="text-xs leading-relaxed text-gray-500">
          Hiệu ứng/animation chưa được map vào data model. Tab này sẽ được bổ sung khi có handler thật.
        </p>
      );
    }

    if (activeTab === "advanced" && selectedBlock) {
      return (
        <div className="space-y-2">
          {selectedBlock.type === "html_code" ? (
            <>
              <HtmlCodeAdvancedInspector props={selectedBlock.props} update={update} />
              <HtmlCodeElementInspector block={selectedBlock} />
            </>
          ) : (
            <>
              <NumberField
                label="Z-index (nâng cao)"
                value={getEffectiveFrame(selectedBlock, deviceMode).zIndex ?? 1}
                onChange={(v) => onUpdateNodeFrame(selectedBlock.id, { zIndex: v })}
                min={1}
                max={999}
              />
              {onSetBlockHidden && (
                <ToggleField
                  label="Ẩn phần tử"
                  value={Boolean(selectedBlock.hidden)}
                  onChange={(v) => onSetBlockHidden(selectedBlock.id, v)}
                />
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <p className="text-xs leading-relaxed text-gray-500">
        Chọn một khối trên canvas để chỉnh sửa thuộc tính.
      </p>
    );
  };

  const panelWidth = INSPECTOR_PANEL_WIDTH;

  const getInspectorBounds = useCallback(() => {
    const panelEl = document.querySelector('[data-panel-id="inspector-panel"]');
    const panelHeight = panelEl instanceof HTMLElement ? panelEl.offsetHeight : 480;

    return computePanelBounds(panelWidth, panelHeight, {
      topbarHeight: EDITOR_TOPBAR_HEIGHT,
      edgePadding: EDITOR_PANEL_EDGE_PADDING,
      minX: EDITOR_PANEL_EDGE_PADDING,
    });
  }, [panelWidth]);

  const panelBody = (
    <>
      <div
        className="flex-1 space-y-2 overflow-y-auto bg-white px-3 py-2.5 max-h-[calc(100vh-110px)]"
        data-no-drag
      >
        {renderTabContent()}
      </div>

      {selectedBlock && handleSendChatMessage && activeTab === "design" && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-2" data-no-drag>
          <form onSubmit={handleSendAi} className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
              Chỉnh sửa bằng AI
            </p>
            <div className="relative flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm focus-within:border-[#5b21b6]">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ví dụ: Đổi màu nút thành đỏ..."
                rows={1}
                disabled={isAiTyping}
                className="no-scrollbar flex-1 resize-none bg-transparent pr-6 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (aiPrompt.trim() && !isAiTyping) {
                      handleSendChatMessage(aiPrompt);
                      setAiPrompt("");
                    }
                  }
                }}
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isAiTyping}
                className="absolute right-2 cursor-pointer text-[#5b21b6] transition disabled:opacity-30"
              >
                {isAiTyping ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-[#5b21b6] border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4 rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );

  const renderHeader = (
    dragHandleProps?: DragHandleProps,
    isDragging = false,
    onResetPosition?: () => void,
  ) => (
    <div className="flex-shrink-0 border-b border-gray-100 bg-white">
      <div
        {...(dragHandleProps ?? {})}
        onDoubleClick={onResetPosition}
        className={`flex h-10 items-center justify-between gap-1 px-3 ${
          dragHandleProps
            ? `cursor-grab touch-none ${isDragging ? "cursor-grabbing bg-[#ede9fe]/40" : "hover:bg-[#f8fafc]"}`
            : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {dragHandleProps && (
            <div className="grid grid-cols-2 gap-[2px] text-gray-300 mr-0.5" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} className="h-[3px] w-[3px] rounded-full bg-current" />
              ))}
            </div>
          )}
          {isRenaming && selectedBlock && onUpdateBlockLabel ? (
            <input
              data-no-drag
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => {
                if (renameValue.trim()) onUpdateBlockLabel(selectedBlock.id, renameValue.trim());
                setIsRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (renameValue.trim()) onUpdateBlockLabel(selectedBlock.id, renameValue.trim());
                  setIsRenaming(false);
                }
                if (e.key === "Escape") setIsRenaming(false);
              }}
              className="h-6 min-w-0 flex-1 rounded border border-purple-200 px-1.5 text-[10px] font-bold uppercase text-gray-900 focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="truncate text-xs font-extrabold uppercase tracking-wide text-[#111827] select-none">
                {showPageSettings ? "PAGE SETTINGS" : getInspectorTitle(selectedBlock)}
              </p>
              {selectedBlock && onUpdateBlockLabel && (
                <button
                  type="button"
                  title="Đổi tên"
                  onClick={() => {
                    setRenameValue(selectedBlock.label || getInspectorTitle(selectedBlock));
                    setIsRenaming(true);
                  }}
                  className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5" data-no-drag>
          {onClose && (
            <button
              type="button"
              title="Đóng inspector"
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="h-[34px] border-b border-[#e5e7eb] px-2" data-no-drag>
        <div className="flex h-full items-end gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 cursor-pointer border-b-2 px-1 pb-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "border-[#3b0df6] text-[#3b0df6]"
                  : "border-transparent text-[#64748b] hover:text-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === "floating") {
    return (
      <DraggablePanel
        id="inspector-panel"
        storageKey={INSPECTOR_PANEL_STORAGE_KEY}
        panelWidth={panelWidth}
        defaultPosition={() => getDefaultInspectorPosition(panelWidth)}
        getBounds={getInspectorBounds}
        maxHeightOffset={EDITOR_TOPBAR_HEIGHT + 24}
        zIndex={45}
      >
        {({ dragHandleProps, resetPosition, isDragging }) => (
          <div className="flex h-full max-h-[calc(100vh-110px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {renderHeader(dragHandleProps, isDragging, resetPosition)}
            {panelBody}
          </div>
        )}
      </DraggablePanel>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-gray-200 bg-white">
      {renderHeader()}
      {panelBody}
    </div>
  );
};

