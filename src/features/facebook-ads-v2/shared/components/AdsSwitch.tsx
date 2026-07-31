"use client";

type AdsSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export default function AdsSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  size = "sm",
}: AdsSwitchProps) {
  const trackSize = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const thumbSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const thumbTranslate = size === "sm"
    ? (checked ? "translate-x-3" : "translate-x-0.5")
    : (checked ? "translate-x-4" : "translate-x-0.5");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 ${trackSize} ${checked ? "bg-[#1877F2]" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-150 ease-in-out ${thumbSize} ${thumbTranslate} mt-0.5`}
      />
    </button>
  );
}
