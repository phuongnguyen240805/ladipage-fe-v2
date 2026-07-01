"use client";

import React, { useState } from "react";
import ApiState from "@/components/common/ApiState";
import type { ReportDateRange } from "@/lib/endpoints/analytics.api";
import { useCustomersReport } from "@/features/analytics/hooks/useReports";
import { ComparisonChart } from "../charts/ComparisonChart";

interface CustomerReportProps {
  dateRange: ReportDateRange;
}

export const CustomerReport: React.FC<CustomerReportProps> = ({ dateRange }) => {
  const { data, isLoading, error } = useCustomersReport(dateRange);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTag, setSelectedTag] = useState("Chọn tag");

  const newCustomers = data?.newCustomers;
  const returning = data?.returningCustomers;
  const categories = newCustomers?.labels ?? [];
  const newCustomersCurrent = newCustomers?.series[0]?.data ?? [];
  const newCustomersPrevious = returning?.series[0]?.data ?? [];
  const hasData = (newCustomers?.summary.total ?? 0) > 0;

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-6 flex-1">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Báo cáo khách hàng
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Thống kê tăng trưởng, phân khúc, khu vực và lịch sử mua của khách hàng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span>📅 {dateRange.from} – {dateRange.to}</span>
            </div>
            <div className="relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
              >
                <option>Chọn tag</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center border-b border-gray-150 dark:border-gray-850">
          {(["overview", "segments", "time"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === tab
                  ? "border-lime-500 text-lime-500 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab === "overview"
                ? "Tổng quan"
                : tab === "segments"
                  ? "Phân tích khách hàng"
                  : "Thời gian mua hàng"}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-6">
            <ComparisonChart
              title="Biểu đồ khách hàng mới"
              categories={categories}
              currentPeriodLabel="Chu kỳ này"
              previousPeriodLabel="Chu kỳ trước"
              currentPeriodData={hasData ? newCustomersCurrent : []}
              previousPeriodData={hasData ? newCustomersPrevious : []}
              valueType="number"
            />
            <ComparisonChart
              title="Khách hàng quay lại"
              categories={returning?.labels ?? categories}
              currentPeriodLabel="Chu kỳ này"
              previousPeriodLabel="Chu kỳ trước"
              currentPeriodData={returning?.series[0]?.data ?? []}
              previousPeriodData={returning?.series[1]?.data ?? []}
              valueType="number"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
            <p className="text-xs font-bold text-slate-400">
              Dữ liệu phân tích chi tiết chưa có trong kỳ đã chọn.
            </p>
          </div>
        )}
      </div>
    </ApiState>
  );
}