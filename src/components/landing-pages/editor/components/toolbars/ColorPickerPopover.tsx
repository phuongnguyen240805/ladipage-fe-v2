"use client";

import React, { useState } from "react";
import { PRESET_COLORS } from "./ToolbarShared";

interface ColorPickerPopoverProps {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  value,
  onChange,
  onClose,
  anchorRect,
}) => {
  const [hex, setHex] = useState(value || "#000000");

  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 6,
    left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 220)),
    zIndex: 10000,
  };

  const applyColor = (color: string) => {
    setHex(color);
    onChange(color);
  };

  return (
    <div
      data-editor-popover
      className="w-[208px] rounded-[8px] border border-[#e5e7eb] bg-white p-3 shadow-lg"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-700">Chọn màu</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        type="color"
        value={hex.startsWith("#") ? hex : "#000000"}
        onChange={(e) => applyColor(e.target.value)}
        className="mb-2 h-8 w-full cursor-pointer rounded border border-gray-200"
      />

      <input
        type="text"
        value={hex}
        onChange={(e) => {
          setHex(e.target.value);
          if (/^#[0-9a-fA-F]{3,8}$/.test(e.target.value)) {
            onChange(e.target.value);
          }
        }}
        className="mb-2 w-full rounded border border-gray-200 px-2 py-1 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-purple-400"
        placeholder="#000000"
      />

      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">Màu của tôi</p>
      <div className="grid grid-cols-8 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={(e) => {
              e.stopPropagation();
              applyColor(color);
            }}
            className="h-5 w-5 cursor-pointer rounded border border-gray-200 transition hover:scale-110"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};