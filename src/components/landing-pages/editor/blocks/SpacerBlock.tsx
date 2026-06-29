"use client";
import React from "react";
import { SpacerProps, DividerProps } from "../types";

// ── Spacer Block ──────────────────────────────────────────────
interface SpacerBlockProps {
  props: SpacerProps;
  isSelected: boolean;
  onSelect: () => void;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({ props, isSelected, onSelect }) => {
  const { height, bgColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full group cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ height, backgroundColor: bgColor === "transparent" ? undefined : bgColor }}
    >
      {/* Dashed visual in editor only */}
      <div className="absolute inset-1 border border-dashed border-gray-300/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[11px] text-gray-400 font-mono">{height}px spacer</span>
      </div>
      {isSelected && (
        <>
          <div className="absolute inset-1 border border-dashed border-purple-400/60 rounded flex items-center justify-center">
            <span className="text-[11px] text-purple-400 font-mono">{height}px spacer</span>
          </div>
          <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
            SPACER
          </div>
        </>
      )}
    </div>
  );
};

// ── Divider Block ─────────────────────────────────────────────
interface DividerBlockProps {
  props: DividerProps;
  isSelected: boolean;
  onSelect: () => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ props, isSelected, onSelect }) => {
  const { color, thickness, style, paddingX, paddingY } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ paddingLeft: paddingX, paddingRight: paddingX, paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <hr style={{ borderColor: color, borderTopWidth: thickness, borderStyle: style, margin: 0 }} />
      {isSelected && (
        <div className="absolute top-0 left-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          DIVIDER
        </div>
      )}
    </div>
  );
};
