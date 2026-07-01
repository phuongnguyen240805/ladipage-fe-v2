"use client";

import React, { useState } from "react";
import ApiState from "@/components/common/ApiState";
import type { ReportDateRange } from "@/lib/endpoints/analytics.api";
import { useBusinessReport } from "@/features/analytics/hooks/useReports";
import { ComparisonChart } from "../charts/ComparisonChart";

interface BusinessReportProps {
  dateRange: ReportDateRange;
}

export const BusinessReport: React.FC<BusinessReportProps> = ({ dateRange }) => {
  const { data, isLoading, error } = useBusinessReport(dateRange);
  const [activeTab, setActiveTab] = useState("overview");
  const [pipeline, setPipeline] = useState("Tất cả pipeline");
  const [employee, setEmployee] = useState("Nhân viên");

  const revenue = data?.revenue;
  const categories = revenue?.labels ?? [];
  const revenueCurrent = revenue?.series[0]?.data ?? [];
  const revenuePrevious = revenue?.series[1]?.data ?? [];
  const funnel = data?.funnel ?? [];
  const hasData = funnel.length > 0 || (revenue?.summary.total ?? 0) > 0;
  const totalDeals = funnel.reduce((sum, stage) => sum + stage.count, 0);
  const wonDeals =
    funnel.find((s) => s.stage.toLowerCase().includes("đơn") || s.stage.toLowerCase().includes("won"))
      ?.count ?? 0;
  const totalRevenue =
    revenue?.summary.total ?? funnel.reduce((sum, s) => sum + s.revenue, 0);
  const successRate =
    totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : "0";

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-6 flex-1">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Tổng quan Kinh doanh
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Hiệu quả bán hàng theo pipeline: giao dịch, doanh thu, cơ hội và hiệu suất nhân viên.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span>📅 {dateRange.from} – {dateRange.to}</span>
            </div>
            <div className="relative">
              <select
                value={pipeline}
                onChange={(e) => setPipeline(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
              >
                <option>Tất cả pipeline</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
              >
                <option>Nhân viên</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center border-b border-gray-150 dark:border-gray-850">
          {(["overview", "performance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === tab
                  ? "border-lime-500 text-lime-500 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab === "overview" ? "Tổng quan" : "Hiệu suất"}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng giao dịch</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="Tổng giao dịch" value={hasData ? String(totalDeals) : "0"} />
                  <StatBox label="Thành công" value={hasData ? String(wonDeals) : "0"} />
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-lime-500 h-full rounded-full transition-all duration-500"
                    style={{ width: hasData ? `${successRate}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng doanh thu</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StatBox
                    label="Tổng doanh thu"
                    value={hasData ? `${totalRevenue.toLocaleString("vi-VN")} đ` : "0 đ"}
                  />
                </div>
              </div>
            </div>

            {funnel.length > 0 && (
              <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 shadow-theme-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                  Cơ hội theo giai đoạn
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {funnel.map((item) => (
                    <div
                      key={item.stage}
                      className="bg-slate-50 dark:bg-gray-850 p-4 rounded-xl border border-slate-100 dark:border-gray-800"
                    >
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        {item.stage}
                      </span>
                      <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">
                        {item.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ComparisonChart
              title="Doanh thu theo giao dịch"
              categories={categories}
              currentPeriodLabel="Chu kỳ này"
              previousPeriodLabel="Chu kỳ trước"
              currentPeriodData={revenueCurrent}
              previousPeriodData={revenuePrevious}
              valueType="currency"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
            <p className="text-xs font-bold text-slate-400">
              Hiệu suất nhân viên chưa có dữ liệu đánh giá.
            </p>
          </div>
        )}
      </div>
    </ApiState>
  );
};

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
        {label}
      </span>
      <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">{value}</h4>
    </div>
  );
}