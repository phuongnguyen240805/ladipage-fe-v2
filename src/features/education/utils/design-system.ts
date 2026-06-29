// ==================== COLOR PALETTE ====================
export const COLORS = {
  // Primary - Indigo (Accent/Interactive)
  primary: {
    50: "indigo-50",
    100: "indigo-100",
    500: "indigo-500",
    600: "indigo-600",
    700: "indigo-700",
    900: "indigo-900",
  },

  // Secondary - Slate (Background/Neutral)
  slate: {
    50: "slate-50",
    100: "slate-100",
    200: "slate-200",
    300: "slate-300",
    400: "slate-400",
    500: "slate-500",
    600: "slate-600",
    700: "slate-700",
    800: "slate-800",
    900: "slate-900",
    950: "slate-950",
  },

  // Accent - Amber/Gold (Pro/Premium Features)
  gold: {
    50: "amber-50",
    300: "amber-300",
    400: "amber-400",
    500: "amber-500",
  },

  // Status Colors
  status: {
    success: "green-600",
    warning: "amber-600",
    error: "red-600",
    info: "blue-600",
  },
};

// ==================== BUTTON VARIANT STYLES ====================
export const ButtonVariants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-200 dark:shadow-none disabled:bg-slate-300 dark:disabled:bg-slate-700 leading-normal",

  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:disabled:bg-slate-700 leading-normal",

  outline:
    "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:border-slate-300 disabled:text-slate-300 dark:hover:bg-indigo-500/10 leading-normal",

  ghost:
    "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 leading-normal",
} as const;

export const ButtonSizes = {
  sm: "px-3 py-1.5 text-sm font-medium rounded-lg",
  md: "px-4 py-2 text-sm font-medium rounded-lg",
  lg: "px-6 py-3 text-base font-medium rounded-lg",
} as const;

export const BUTTON_STYLES = {
  ...ButtonVariants,
  ...ButtonSizes,
  disabled:
    "opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

// Input Styles
export const INPUT_STYLES = {
  base: "w-full px-4 py-2.5 text-sm leading-normal border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg transition-all duration-200",

  focus:
    "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none",

  hover: "hover:border-slate-300 dark:hover:border-slate-600",

  error:
    "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-500/10",

  disabled: "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800",
};

// Card Styles
export const CARD_STYLES = {
  base: "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 transition-all duration-300",

  shadow: "shadow-sm hover:shadow-md dark:shadow-slate-900/50",

  padding: "p-5 sm:p-6 md:p-8",

  interactive:
    "hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer",
};

// Badge Styles
export const BADGE_STYLES = {
  // Pro/Premium Badge (Diamond Border + Shimmer)
  pro: "relative flex scale-75 items-center justify-center overflow-hidden rounded-full p-[1.5px] shadow-[0_0_10px_rgba(251,191,36,0.3)]",

  proBg:
    "absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F59E0B_0%,#FDE68A_25%,#F59E0B_50%,#FDE68A_75%,#F59E0B_100%)]",

  proInner:
    "relative z-10 flex items-center gap-1 rounded-full bg-slate-950 px-2 py-0.5 text-[8px] font-bold text-amber-400",

  proShimmer:
    "absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent",

  // Status Badges
  success:
    "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  error: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
};

// Dropdown Styles
export const DROPDOWN_STYLES = {
  base: "absolute top-full right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-900/50 z-50 py-1",

  item: "block w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150",

  divider: "border-t border-slate-200 dark:border-slate-700 my-1",
};

// Modal Styles
export const MODAL_STYLES = {
  overlay:
    "fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]",

  content:
    "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-slate-900/50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto",

  header:
    "flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700",

  body: "px-6 py-4",

  footer:
    "flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700",
};

// Text Styles with improved line-height for readability
export const TEXT_STYLES = {
  h1: "text-3xl font-bold leading-tight text-slate-900 dark:text-white",
  h2: "text-2xl font-bold leading-snug text-slate-900 dark:text-white",
  h3: "text-xl font-semibold leading-snug text-slate-900 dark:text-white",
  h4: "text-lg font-semibold leading-normal text-slate-900 dark:text-white/90",
  body: "text-base leading-relaxed text-slate-700 dark:text-slate-300",
  sm: "text-sm leading-relaxed text-slate-600 dark:text-slate-400",
  xs: "text-xs leading-normal text-slate-500 dark:text-slate-500",
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Merge button styles with proper type safety
 * @param variant - Button color variant: primary, secondary, outline, ghost
 * @param size - Button size: sm, md, lg
 * @param disabled - Whether button is disabled
 * @param className - Additional custom classes
 * @returns Combined class string
 */
export const mergeButtonClasses = (
  variant: keyof typeof ButtonVariants = "primary",
  size: keyof typeof ButtonSizes = "md",
  disabled: boolean = false,
  className: string = "",
): string => {
  const base =
    "inline-flex items-center justify-center font-medium gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900";

  const variantClass = ButtonVariants[variant] || ButtonVariants.primary;
  const sizeClass = ButtonSizes[size] || ButtonSizes.md;
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return [base, variantClass, sizeClass, disabledClass, className]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Merge input styles with additional classes
 */
export const mergeInputClasses = (
  error?: boolean,
  disabled?: boolean,
  className?: string,
): string => {
  const errorClass = error ? INPUT_STYLES.error : "";
  const disabledClass = disabled ? INPUT_STYLES.disabled : INPUT_STYLES.hover;

  return `${INPUT_STYLES.base} ${INPUT_STYLES.focus} ${disabledClass} ${errorClass} ${className || ""}`.trim();
};

/**
 * Merge card styles
 */
export const mergeCardClasses = (
  interactive?: boolean,
  className?: string,
): string => {
  const interactiveClass = interactive ? CARD_STYLES.interactive : "";

  return `${CARD_STYLES.base} ${CARD_STYLES.shadow} ${interactiveClass} ${className || ""}`.trim();
};
