"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type AdsModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function AdsModal({
  open,
  title,
  description,
  children,
  footer,
  size = "md",
  onClose,
}: AdsModalProps) {
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
      role="presentation"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-theme-xl ${sizeClasses[size]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
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
      </section>
    </div>
  );
}

