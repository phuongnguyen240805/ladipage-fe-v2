"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Inbox,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StatisticRangePreset } from "@/components/customer-care/analytics/statistics/types";
import { statisticRangeLabels } from "@/components/customer-care/analytics/statistics/data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const ladiChartColors = ["#84cc16", "#10b981", "#06b6d4", "#f59e0b", "#ec4899"];

export function StatisticsChart({
  options,
  series,
  type,
  height = 300,
}: {
  options: ApexOptions;
  series: any;
  type: "line" | "area" | "bar" | "donut" | "radialBar";
  height?: number;
}) {
  return <ReactApexChart options={options} series={series} type={type} height={height} />;
}

export function baseCartesianOptions(categories: string[], overrides: ApexOptions = {}): ApexOptions {
  const yaxis = Array.isArray(overrides.yaxis)
    ? overrides.yaxis
    : {
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
        ...(overrides.yaxis ?? {}),
      };

  return {
    ...overrides,
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      animations: { speed: 420 },
      ...overrides.chart,
    },
    colors: overrides.colors ?? ladiChartColors,
    dataLabels: overrides.dataLabels ?? { enabled: false },
    stroke: { curve: "smooth", width: 2.25, ...overrides.stroke },
    grid: {
      borderColor: "#334155",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 4, right: 8 },
      ...overrides.grid,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
      ...overrides.xaxis,
    },
    yaxis,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      labels: { colors: "#cbd5e1" },
      markers: { size: 6, },
      ...overrides.legend,
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      ...overrides.tooltip,
    },
  };
}

export function StatisticsCard({
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#151a18] ${className}`}
    >
      {(title || description || action) && (
        <div className="flex min-h-16 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}

export function StatisticPageHeader({
  title,
  description,
  range,
  onRangeChange,
  actions,
}: {
  title: string;
  description?: string;
  range?: StatisticRangePreset;
  onRangeChange?: (range: StatisticRangePreset) => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{title}</h1>
        {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {range && onRangeChange && <StatisticRangeMenu value={range} onChange={onRangeChange} />}
      </div>
    </div>
  );
}

export function StatisticRangeMenu({
  value,
  onChange,
}: {
  value: StatisticRangePreset;
  onChange: (range: StatisticRangePreset) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 min-w-32 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-lime-400 dark:border-white/10 dark:bg-[#151a18] dark:text-slate-200"
      >
        <span>{statisticRangeLabels[value]}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#171c1a]">
          {(Object.entries(statisticRangeLabels) as Array<[StatisticRangePreset, string]>).map(([range, label]) => (
            <button
              key={range}
              type="button"
              onClick={() => {
                onChange(range);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                range === value
                  ? "bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              {label}
              {range === value && <span className="h-2 w-2 rounded-full bg-lime-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateFilterBar({
  showSearch = false,
  showPage = true,
  compact = false,
}: {
  showSearch?: boolean;
  showPage?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/[0.08] dark:bg-[#151a18] ${compact ? "mb-4" : "mb-5"}`}>
      {showPage && (
        <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
          <span className="h-6 w-6 rounded-md bg-gradient-to-br from-lime-400 to-emerald-500" />
          LadiPage Official
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">
        <CalendarDays className="h-4 w-4" />
        06/07/2026 - 04/08/2026
      </button>
      <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">
        <SlidersHorizontal className="h-4 w-4" />
        Tất cả kênh
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {showSearch && (
        <label className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-9 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-lime-500 dark:border-white/10"
            placeholder="Tìm kiếm"
          />
        </label>
      )}
      <button className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg bg-lime-500 px-3 text-xs font-semibold text-slate-950 hover:bg-lime-400">
        <Download className="h-4 w-4" />
        Xuất dữ liệu
      </button>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  color = "lime",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  color?: "lime" | "emerald" | "cyan" | "amber" | "rose";
  icon?: React.ReactNode;
}) {
  const tones = {
    lime: "bg-lime-500/10 text-lime-600 dark:text-lime-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#151a18]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[color]} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
      {hint && <div className="mt-2 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

export function EmptyStatisticsState({
  title = "Chưa có dữ liệu",
  description = "Dữ liệu sẽ hiển thị khi hệ thống ghi nhận hoạt động trong khoảng thời gian đã chọn.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-500">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</div>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{description}</p>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  footer,
}: {
  columns: Array<{ key: string; label: string; align?: "left" | "right" | "center" }>;
  rows: Array<Record<string, React.ReactNode>>;
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-4 py-3 font-medium ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700 dark:divide-white/[0.06] dark:bg-[#151a18] dark:text-slate-300">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-lime-50/40 dark:hover:bg-lime-500/[0.04]">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`whitespace-nowrap px-4 py-3.5 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-slate-100 bg-white px-4 py-3 dark:border-white/[0.06] dark:bg-[#151a18]">{footer}</div>}
    </div>
  );
}

export function SectionTabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/[0.06]">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            value === item.value
              ? "bg-white text-lime-700 shadow-sm dark:bg-[#232a26] dark:text-lime-300"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Compatibility alias for the first statistics clone.
export const StatisticsRangeMenu = StatisticRangeMenu;
