import {
  BadgeDollarSign,
  ChartNoAxesCombined,
  CircleDollarSign,
  MousePointerClick,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import type { AdsMetricSummary } from "../types";

type AdsMetricsSummaryProps = {
  summary: AdsMetricSummary;
  currency: "VND" | "USD";
};

const compactNumber = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatMoney(value: number, currency: "VND" | "USD") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function AdsMetricsSummary({
  summary,
  currency,
}: AdsMetricsSummaryProps) {
  const metrics = [
    {
      label: "Chi tiêu",
      value: formatMoney(summary.spend, currency),
      change: "+8,4%",
      direction: "up",
      icon: ReceiptText,
    },
    {
      label: "Kết quả",
      value: compactNumber.format(summary.results),
      change: "+12,1%",
      direction: "up",
      icon: MousePointerClick,
    },
    {
      label: "Chi phí/kết quả",
      value: formatMoney(summary.costPerResult, currency),
      change: "−3,2%",
      direction: "good",
      icon: CircleDollarSign,
    },
    {
      label: "Doanh thu",
      value: formatMoney(summary.revenue, currency),
      change: "+15,6%",
      direction: "up",
      icon: BadgeDollarSign,
    },
    {
      label: "ROAS",
      value: `${summary.roas.toFixed(2)}x`,
      change: "+0,31",
      direction: "up",
      icon: ChartNoAxesCombined,
    },
    {
      label: "Lượt hiển thị",
      value: compactNumber.format(summary.impressions),
      change: "+6,8%",
      direction: "up",
      icon: UsersRound,
    },
  ];

  return (
    <section
      aria-label="Tổng quan hiệu quả quảng cáo"
      className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article
            key={metric.label}
            className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-theme-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-1.5 truncate text-lg font-semibold tracking-tight text-foreground">
                  {metric.value}
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              <span
                className={
                  metric.direction === "up" || metric.direction === "good"
                    ? "font-semibold text-success-600 dark:text-success-400"
                    : "font-semibold text-warning-600"
                }
              >
                {metric.change}
              </span>{" "}
              so với kỳ trước
            </p>
          </article>
        );
      })}
    </section>
  );
}

