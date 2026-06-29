"use client";

import type { ThemePreference } from "../types";

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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ThemePreference)}
        className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-lime-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
      >
        <option value="system">Hệ thống</option>
        <option value="light">Sáng</option>
        <option value="dark">Tối</option>
      </select>
    </div>
  );
}
