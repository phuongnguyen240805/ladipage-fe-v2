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

      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6 relative">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          />
          <span className="text-xs text-slate-400">→</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          />
        </div>

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
  );
}