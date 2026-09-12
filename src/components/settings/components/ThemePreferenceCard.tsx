"use client";

import type { ThemePreference } from "../types";
import { CustomSelect } from "@/components/ui/select/Select";

type ThemePreferenceCardProps = {
  value: ThemePreference;
  onChange: (preference: ThemePreference) => void;
};

export default function ThemePreferenceCard({ value, onChange }: ThemePreferenceCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex flex-col">
        <span className="text-xs font-extrabold text-gray-900 dark:text-white sm:text-sm">Giao diện</span>
        <span className="mt-1 text-[10px] font-medium text-gray-400">
          Lựa chọn chế độ hiển thị màn hình của bạn.
        </span>
      </div>
      <CustomSelect
        value={value}
        onChange={(val) => onChange(val as ThemePreference)}
        size="sm"
        options={[
          { value: "system", label: "Hệ thống" },
          { value: "light", label: "Sáng" },
          { value: "dark", label: "Tối" },
        ]}
        className="w-32"
      />
    </div>
  );
}
