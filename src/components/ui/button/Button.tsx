import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-kedi-navy bg-kedi-navy text-white shadow-xs hover:border-brand-800 hover:bg-brand-800 dark:border-kedi-yellow dark:bg-kedi-yellow dark:text-kedi-navy dark:hover:border-brand-300 dark:hover:bg-brand-300",
  accent:
    "border border-kedi-yellow bg-kedi-yellow text-kedi-navy shadow-xs hover:border-brand-600 hover:bg-brand-400 dark:border-kedi-yellow dark:bg-kedi-yellow dark:text-kedi-navy dark:hover:bg-brand-300",
  outline:
    "border border-kedi-navy/20 bg-white text-kedi-navy shadow-xs hover:border-kedi-navy/40 hover:bg-gray-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-kedi-yellow/50 dark:hover:bg-white/5",
  ghost:
    "border border-transparent bg-transparent text-kedi-navy hover:bg-gray-100 hover:text-kedi-navy dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white",
  danger:
    "border border-error-600 bg-error-600 text-white shadow-xs hover:border-error-700 hover:bg-error-700 dark:border-error-500 dark:bg-error-500 dark:hover:bg-error-400",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    size = "md",
    variant = "primary",
    startIcon,
    endIcon,
    className = "",
    disabled = false,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:ring-3 focus-visible:ring-kedi-yellow/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...buttonProps}
    >
      {startIcon && <span className="flex items-center" aria-hidden="true">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center" aria-hidden="true">{endIcon}</span>}
    </button>
  );
});

export default Button;
