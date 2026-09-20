"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdsButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type AdsButtonSize = "sm" | "md" | "icon";

type AdsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdsButtonVariant;
  size?: AdsButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const variantClasses: Record<AdsButtonVariant, string> = {
  primary:
    "border-brand-500 bg-brand-500 text-kedi-navy shadow-theme-xs hover:border-brand-600 hover:bg-brand-600 dark:border-brand-500 dark:bg-brand-500 dark:hover:border-brand-400 dark:hover:bg-brand-400 dark:hover:text-brand-950",
  secondary:
    "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20",
  outline:
    "border-border bg-card text-foreground shadow-theme-xs hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300",
  danger:
    "border-transparent bg-destructive text-white shadow-theme-xs hover:brightness-95",
};

const sizeClasses: Record<AdsButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0",
};

export default function AdsButton({
  variant = "outline",
  size = "md",
  startIcon,
  endIcon,
  className = "",
  children,
  type = "button",
  ...props
}: AdsButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
