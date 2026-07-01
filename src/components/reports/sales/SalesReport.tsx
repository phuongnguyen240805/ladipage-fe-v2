"use client";

import React, { useState } from "react";
import ApiState from "@/components/common/ApiState";
import type { ReportDateRange } from "@/lib/endpoints/analytics.api";
import { formatChangePercent, formatVnd } from "@/lib/format/currency";
import { useSalesReport } from "@/features/analytics/hooks/useReports";
import { ComparisonChart } from "../charts/ComparisonChart";
import { IconDollar, IconCard, IconCart, IconCancel } from "../dung-chung/icons";

interface SalesReportProps {
  dateRange: ReportDateRange;
}

export const SalesReport: React.FC<SalesReportProps> = ({ dateRange }) => {
  const [selectedShop, setSelectedShop] = useState("Tất cả cửa hàng");
  const { data, isLoading, error } = useSalesReport(dateRange);

  const revenue = data?.revenue;
  const orders = data?.orders;
  const aov = data?.aov;
  const cancelled = data?.cancelledOrders;

  const categories = revenue?.labels ?? [];
  const revenueCurrent = revenue?.series[0]?.data ?? [];
  const revenuePrevious = revenue?.series[1]?.data ?? [];
  const ordersCurrent = orders?.series[0]?.data ?? [];
  const ordersPrevious = orders?.series[1]?.data ?? [];

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-6 flex-1">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-855 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Tổng quan Bán hàng
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Tổng quan tình hình kinh doanh: doanh thu, hiệu suất đơn hàng và phân bổ theo nguồn/sản phẩm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative">
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
              >
                <option>Tất cả cửa hàng</option>
                <option>Cửa hàng chính</option>
              </select>
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              {dateRange.from} – {dateRange.to}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KpiCard
            label="Doanh thu"
            icon={<IconDollar size={18} />}
            value={formatVnd(revenue?.summary.total ?? 0)}
            change={formatChangePercent(revenue?.summary.changePercent ?? 0)}
            positive={(revenue?.summary.changePercent ?? 0) >= 0}
            iconClass="bg-lime-50 dark:bg-lime-950/40 text-lime-500 dark:text-lime-300"
          />
          <KpiCard
            label="Giá trị TB/đơn"
            icon={<IconCard size={18} />}
            value={formatVnd(aov?.summary.total ?? 0)}
            change={formatChangePercent(aov?.summary.changePercent ?? 0)}
            positive={(aov?.summary.changePercent ?? 0) >= 0}
            iconClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          />
          <KpiCard
            label="Đơn thành công"
            icon={<IconCart size={18} />}
            value={`${orders?.summary.total ?? 0} đơn`}
            change={formatChangePercent(orders?.summary.changePercent ?? 0)}
            positive={(orders?.summary.changePercent ?? 0) >= 0}
            iconClass="bg-success-50 dark:bg-success-950/40 text-success-600 dark:text-success-400"
          />
          <KpiCard
            label="Đơn huỷ"
            icon={<IconCancel size={18} />}
            value={`${cancelled?.summary.total ?? 0} đơn`}
            change={formatChangePercent(cancelled?.summary.changePercent ?? 0)}
            positive={(cancelled?.summary.changePercent ?? 0) <= 0}
            iconClass="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonChart
            title="Doanh thu"
            categories={categories}
            currentPeriodLabel={`${dateRange.from} - ${dateRange.to}`}
            previousPeriodLabel="Kỳ trước"
            currentPeriodData={revenueCurrent}
            previousPeriodData={revenuePrevious}
            valueType="currency"
          />
          <ComparisonChart
            title="Thống kê đơn hàng"
            categories={orders?.labels ?? categories}
            currentPeriodLabel={`${dateRange.from} - ${dateRange.to}`}
            previousPeriodLabel="Kỳ trước"
            currentPeriodData={ordersCurrent}
            previousPeriodData={ordersPrevious}
            valueType="number"
          />
        </div>
      </div>
    </ApiState>
  );
};

function KpiCard({
  label,
  icon,
  value,
  change,
  positive,
  iconClass,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  change: string;
  positive: boolean;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs flex flex-col justify-between min-h-[140px] hover:shadow-theme-sm transition">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
          {value}
        </h3>
        <p className={`text-[11px] font-bold mt-1.5 ${positive ? "text-success-650" : "text-red-500"}`}>
          {change}
        </p>
      </div>
    </div>
  );
}