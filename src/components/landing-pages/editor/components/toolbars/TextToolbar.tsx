"use client";

import React, { useRef, useState } from "react";
import { EditorBlock } from "../../types";
import { ColorPickerPopover } from "./ColorPickerPopover";
import {
  ToolbarButton,
  ToolbarDivider,
  ToolbarShell,
  useClickOutside,
} from "./ToolbarShared";

interface TextToolbarProps {
  block: EditorBlock;
  onUpdateBlock: (id: string, props: Record<string, unknown>) => void;
  onOpenSettings: () => void;
}

export const FontSizeCombobox: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const presets = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

  useClickOutside(isOpen, containerRef, () => setIsOpen(false));

  return (
    <div className="relative flex h-[32px] items-center rounded border border-[#e5e7eb] bg-white px-1" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const size = parseInt(e.target.value, 10);
          if (!isNaN(size) && size > 0) {
            onChange(size);
          }
        }}
        className="w-7 bg-transparent text-center text-[11px] font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={4}
        max={300}
      />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-5 w-4 cursor-pointer items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[70] mt-1 max-h-[160px] w-[64px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg scrollbar-thin">
          {presets.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onChange(size);
                setIsOpen(false);
              }}
              className={`block w-full px-2 py-1 text-left text-[11px] font-medium transition hover:bg-purple-50 hover:text-purple-700 ${
                value === size ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TextToolbar: React.FC<TextToolbarProps> = ({
  block,
  onUpdateBlock,
  onOpenSettings,
}) => {
  const props = block.props as Record<string, unknown>;
  const [colorPicker, setColorPicker] = useState<"text" | "bg" | null>(null);
  const [colorAnchor, setColorAnchor] = useState<DOMRect | null>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);

  const isHtmlSubElement = block.type === "html_code" && !!block.props?.selectedHtmlElement;
  const subEl = (isHtmlSubElement ? block.props.selectedHtmlElement : null) as Record<string, unknown> | null;
  const currentProps = subEl ? { ...props, ...subEl } : props;

  const update = (patch: Record<string, unknown>) => {
    onUpdateBlock(block.id, { ...props, ...patch });
  };

  const openColorPicker = (type: "text" | "bg", e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setColorAnchor(rect);
    setColorPicker(type);
  };

  useClickOutside(Boolean(colorPicker), colorBtnRef, () => setColorPicker(null));

  const isBold = currentProps.fontWeight === "bold" || currentProps.fontWeight === 700 || currentProps.fontWeight === "700";
  const isItalic = currentProps.fontStyle === "italic";
  const decoration = (currentProps.textDecoration as string) || "";
  const isUnderline = decoration.includes("underline");
  const isStrike = decoration.includes("line-through");
  const isUppercase = currentProps.textTransform === "uppercase";

  const toggleDecoration = (flag: "underline" | "line-through") => {
    let next = decoration;
    if (flag === "underline") {
      next = isUnderline ? next.replace("underline", "").trim() : `${next} underline`.trim();
    } else {
      next = isStrike ? next.replace("line-through", "").trim() : `${next} line-through`.trim();
    }
    update({ textDecoration: next || "none" });
  };

  return (
    <>
      <ToolbarShell>
        <ToolbarButton title="Hiệu ứng (chưa hỗ trợ)" onClick={() => {}} disabled>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          title="Liên kết"
          onClick={() => {
            const current = (currentProps.link as string) || (currentProps.href as string) || "";
            const url = prompt("Nhập URL liên kết:", current);
            if (url !== null) update({ link: url, href: url });
          }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </ToolbarButton>

        <button
          ref={colorBtnRef}
          type="button"
          title="Màu chữ"
          onClick={(e) => {
            e.stopPropagation();
            openColorPicker("text", e);
          }}
          className="flex h-[32px] w-[32px] cursor-pointer flex-col items-center justify-center rounded-[6px] text-[#111827] hover:bg-[#f3f4f6]"
        >
          <span className="text-[11px] font-extrabold leading-none">A</span>
          <div
            className="mt-0.5 h-[2.5px] w-4 rounded-sm"
            style={{ backgroundColor: (currentProps.color as string) || "#374151" }}
          />
        </button>

        <ToolbarButton title="Màu nền chữ" onClick={(e) => openColorPicker("bg", e)}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.25h.008v.008H10.5V8.25z" />
          </svg>
        </ToolbarButton>

        <FontSizeCombobox
          value={Number(currentProps.fontSize ?? 16)}
          onChange={(size) => update({ fontSize: size })}
        />

        <ToolbarButton title="In đậm" active={isBold} onClick={() => update({ fontWeight: isBold ? "normal" : "bold" })}>
          <span className="text-xs font-extrabold">B</span>
        </ToolbarButton>

        <ToolbarButton title="In nghiêng" active={isItalic} onClick={() => update({ fontStyle: isItalic ? "normal" : "italic" })}>
          <span className="text-xs font-serif italic">I</span>
        </ToolbarButton>

        <ToolbarButton title="Gạch chân" active={isUnderline} onClick={() => toggleDecoration("underline")}>
          <span className="text-xs font-bold underline">U</span>
        </ToolbarButton>

        <ToolbarButton title="Gạch ngang" active={isStrike} onClick={() => toggleDecoration("line-through")}>
          <span className="text-xs font-bold line-through">S</span>
        </ToolbarButton>

        <ToolbarButton title="In hoa" active={isUppercase} onClick={() => update({ textTransform: isUppercase ? "none" : "uppercase" })}>
          <span className="text-[10px] font-extrabold">Tt</span>
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Cài đặt" onClick={() => onOpenSettings()}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.193c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          title="Hướng dẫn"
          onClick={() => alert("Nhấp đúp chuột để chỉnh sửa văn bản trực tiếp. Dùng thanh công cụ để đổi font, màu và căn lề.")}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </ToolbarButton>
      </ToolbarShell>

      {colorPicker && colorAnchor && (
        <ColorPickerPopover
          value={
            colorPicker === "text"
              ? ((currentProps.color as string) || "#374151")
              : ((currentProps.backgroundColor as string) || "#ffffff")
          }
          onChange={(color) => {
            if (colorPicker === "text") update({ color });
            else update({ backgroundColor: color });
          }}
          onClose={() => setColorPicker(null)}
          anchorRect={colorAnchor}
        />
      )}
    </>
  );
};