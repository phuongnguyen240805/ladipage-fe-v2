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
    "border-[#1877F2] bg-[#1877F2] text-white shadow-sm hover:bg-[#1a4dd4] hover:border-[#1a4dd4] dark:border-[#1877F2] dark:bg-[#1877F2] dark:hover:bg-[#1a4dd4]",
  secondary:
    "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20",
  outline:
    "border-border bg-card text-foreground shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
  danger:
    "border-transparent bg-destructive text-white shadow-sm hover:brightness-95",
};

const sizeClasses: Record<AdsButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  icon: "h-8 w-8 p-0",
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
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
