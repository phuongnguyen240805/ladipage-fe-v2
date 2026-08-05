"use client";

import type { CustomerCareDateRange } from "@liora/api-types";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

const presets = [
  { key: "today", label: "Hôm nay", days: 0 },
  { key: "yesterday", label: "Hôm qua", days: 1 },
  { key: "7d", label: "7 ngày qua", days: 7 },
  { key: "30d", label: "30 ngày qua", days: 30 },
  { key: "90d", label: "90 ngày qua", days: 90 },
] as const;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: CustomerCareDateRange;
  onChange: (value: CustomerCareDateRange) => void;
}) {
  const [open, setOpen] = useState(false);

  const applyPreset = (preset: (typeof presets)[number]) => {
    const to = new Date();
    const from = new Date();
    if (preset.key === "yesterday") {
      to.setDate(to.getDate() - 1);
      from.setDate(from.getDate() - 1);
    } else {
      from.setDate(from.getDate() - preset.days);
    }
    onChange({ from: formatDate(from), to: formatDate(to), preset: preset.key });
    setOpen(false);
  };

  const selectedLabel =
    presets.find((preset) => preset.key === value.preset)?.label ??
    `${value.from} → ${value.to}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-lime-300 hover:text-lime-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        <CalendarDays className="h-4 w-4 text-lime-600" />
        {selectedLabel}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#171923]">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-lime-50 hover:text-lime-700 dark:text-slate-300 dark:hover:bg-lime-500/10"
            >
              {preset.label}
            </button>
          ))}
          <div className="my-1 border-t border-slate-100 dark:border-white/10" />
          <div className="space-y-2 p-2">
            <input
              type="date"
              value={value.from}
              onChange={(event) => onChange({ ...value, preset: undefined, from: event.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs dark:border-white/10"
            />
            <input
              type="date"
              value={value.to}
              onChange={(event) => onChange({ ...value, preset: undefined, to: event.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs dark:border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
