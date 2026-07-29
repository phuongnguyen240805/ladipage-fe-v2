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
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
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
    <div className="fixed inset-0 z-[100000] flex justify-end bg-gray-950/40 backdrop-blur-[1px]">
      <button
        type="button"
        aria-label="Đóng bảng chi tiết"
        className="min-w-0 flex-1 cursor-default"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex h-full w-full flex-col border-l border-border bg-card shadow-theme-xl ${widthClasses[width]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={17} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}

