"use client";

import React, { useState } from "react";
import { ReportsSidebar } from "@/components/reports/sidebar/ReportsSidebar";
import { SalesReport } from "@/components/reports/sales/SalesReport";
import { BusinessReport } from "@/components/reports/business/BusinessReport";
import { CustomerReport } from "@/components/reports/customers/CustomerReport";
import { JobsReport } from "@/components/reports/jobs/JobsReport";
import { AutomationReport } from "@/components/reports/automation/AutomationReport";
import { defaultReportRange } from "@/features/analytics/hooks/useReports";

export default function BaoCaoPage() {
  const [activeSubTab, setActiveSubTab] = useState("sales");
  const [dateRange, setDateRange] = useState(defaultReportRange);

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      <ReportsSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto">
        <div className="sticky top-0 z-30 flex items-center justify-end gap-2 px-6 py-3 bg-[#f8fafc]/80 dark:bg-[#0f1016]/80 backdrop-blur border-b border-gray-150 dark:border-gray-855">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Từ
            </span>
            <input
              type="date"
              value={dateRange.from}
              max={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            />
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Đến
            </span>
            <input
              type="date"
              value={dateRange.to}
              min={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="p-6">
        {activeSubTab === "sales" ? (
          <SalesReport dateRange={dateRange} />
        ) : activeSubTab === "business" ? (
          <BusinessReport dateRange={dateRange} />
        ) : activeSubTab === "customers" ? (
          <CustomerReport dateRange={dateRange} />
        ) : activeSubTab === "jobs" ? (
          <JobsReport dateRange={dateRange} />
        ) : activeSubTab === "automation" ? (
          <AutomationReport dateRange={dateRange} />
        ) : (
          <SalesReport dateRange={dateRange} />
        )}
        </div>
      </div>
    </div>
  );
}