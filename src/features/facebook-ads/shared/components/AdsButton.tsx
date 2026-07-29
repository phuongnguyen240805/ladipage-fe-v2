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
    "border-lime-500 bg-lime-500 text-white shadow-theme-xs hover:border-lime-600 hover:bg-lime-600 dark:border-lime-500 dark:bg-lime-500 dark:hover:border-lime-400 dark:hover:bg-lime-400 dark:hover:text-lime-950",
  secondary:
    "border-lime-200 bg-lime-50 text-lime-700 hover:border-lime-300 hover:bg-lime-100 dark:border-lime-500/25 dark:bg-lime-500/10 dark:text-lime-300 dark:hover:bg-lime-500/20",
  outline:
    "border-border bg-card text-foreground shadow-theme-xs hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700 dark:hover:border-lime-500/40 dark:hover:bg-lime-500/10 dark:hover:text-lime-300",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-lime-50 hover:text-lime-700 dark:hover:bg-lime-500/10 dark:hover:text-lime-300",
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
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
