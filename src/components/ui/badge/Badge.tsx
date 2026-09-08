import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2 font-semibold tracking-normal";

  const sizeStyles = {
    sm: "h-5 text-ui-caption leading-4",
    md: "h-6 text-xs leading-5",
  };

  const variants = {
    light: {
      primary:
        "border-lime-200/70 bg-lime-50 text-lime-700 dark:border-lime-800/60 dark:bg-lime-500/10 dark:text-lime-300",
      success:
        "border-success-200/70 bg-success-50 text-success-700 dark:border-success-800/60 dark:bg-success-500/10 dark:text-success-400",
      error:
        "border-error-200/70 bg-error-50 text-error-700 dark:border-error-800/60 dark:bg-error-500/10 dark:text-error-400",
      warning:
        "border-warning-200/70 bg-warning-50 text-warning-700 dark:border-warning-800/60 dark:bg-warning-500/10 dark:text-orange-400",
      info: "border-blue-light-200/70 bg-blue-light-50 text-blue-light-700 dark:border-blue-light-800/60 dark:bg-blue-light-500/10 dark:text-blue-light-400",
      light:
        "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300",
      dark: "border-gray-600 bg-gray-700 text-white dark:border-gray-600 dark:bg-gray-700 dark:text-white",
    },
    solid: {
      primary: "bg-lime-600 text-white dark:bg-lime-500 dark:text-lime-950",
      success: "bg-success-600 text-white dark:bg-success-500",
      error: "bg-error-600 text-white dark:bg-error-500",
      warning: "bg-warning-600 text-white dark:bg-warning-500",
      info: "bg-blue-light-600 text-white dark:bg-blue-light-500",
      light: "bg-gray-400 text-white dark:bg-gray-600",
      dark: "bg-gray-700 text-white dark:bg-gray-700",
    },
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant][color]}`}>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </span>
  );
};

export default Badge;
