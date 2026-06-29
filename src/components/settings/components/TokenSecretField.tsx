"use client";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import type { FacebookTokenValues, TokenFieldConfig } from "../types";

type TokenSecretFieldProps = {
  field: TokenFieldConfig;
  value: string;
  isVisible: boolean;
  onToggleVisibility: (key: keyof FacebookTokenValues) => void;
};

export default function TokenSecretField({
  field,
  value,
  isVisible,
  onToggleVisibility,
}: TokenSecretFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 sm:text-xs">
        {field.label}
      </label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          placeholder={field.placeholder}
          value={value}
          readOnly
          className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-xs font-semibold text-gray-800 shadow-theme-xs transition-all focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
        />
        <button
          type="button"
          onClick={() => onToggleVisibility(field.key)}
          aria-label={isVisible ? `Ẩn ${field.label}` : `Hiện ${field.label}`}
          className="absolute right-3 top-2.5 cursor-pointer text-gray-400 transition hover:text-lime-400 dark:hover:text-lime-300"
        >
          {isVisible ? <EyeCloseIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
        </button>
      </div>
    </div>
  );
}
