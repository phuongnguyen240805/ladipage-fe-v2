"use client";

import React, { useEffect, useRef } from "react";

export const TOOLBAR_BTN =
  "flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[6px] transition disabled:cursor-not-allowed disabled:opacity-35";
export const TOOLBAR_BTN_ACTIVE = "bg-[#ede9fe] text-[#3b0df6]";
export const TOOLBAR_BTN_DEFAULT = "text-[#111827] hover:bg-[#f3f4f6]";
export const TOOLBAR_BTN_DANGER = "text-red-500 hover:bg-red-50";

export const ToolbarButton: React.FC<{
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ title, onClick, children, danger, active, disabled, className = "" }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    className={`${TOOLBAR_BTN} ${
      danger ? TOOLBAR_BTN_DANGER : active ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN_DEFAULT
    } ${className}`}
  >
    {children}
  </button>
);

export const ToolbarDivider: React.FC = () => (
  <div className="mx-0.5 h-5 w-px bg-[#e5e7eb]" />
);

export const ToolbarMenuItem: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}> = ({ label, onClick, danger, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onClick();
    }}
    className={`flex h-[28px] w-full cursor-pointer items-center px-2.5 text-left text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger ? "text-red-600 hover:bg-red-50" : "text-[#374151] hover:bg-[#f3f4f6]"
    }`}
  >
    {label}
  </button>
);

export const ToolbarShell: React.FC<{
  children: React.ReactNode;
  vertical?: boolean;
  className?: string;
}> = ({ children, vertical, className = "" }) => (
  <div
    data-editor-toolbar
    className={`flex gap-1 rounded-[8px] border border-[#e5e7eb] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] select-none ${
      vertical
        ? "w-[40px] flex-col items-center py-1.5"
        : "h-[42px] items-center px-1.5"
    } ${className}`}
  >
    {children}
  </div>
);

export function useClickOutside(
  isOpen: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, ref, onClose]);
}

export const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#1e293b", "#65a30d",
  "#0ea5e9", "#a855f7", "#f43f5e", "#14b8a6",
];