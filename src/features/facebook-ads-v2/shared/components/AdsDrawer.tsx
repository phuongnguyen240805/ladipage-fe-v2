"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type AdsDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
  onClose: () => void;
};

const widthClasses = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-lg",
  lg: "w-full max-w-2xl",
};

export default function AdsDrawer({
  open,
  title,
  description,
  children,
  footer,
  width = "md",
  onClose,
}: AdsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex justify-end"
      style={{ animation: "ads-fade-in 0.15s ease" }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-default bg-gray-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full flex-col border-l border-border bg-card shadow-2xl ${widthClasses[width]}`}
        style={{ animation: "ads-slide-in-right 0.22s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={15} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar">{children}</div>
        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
