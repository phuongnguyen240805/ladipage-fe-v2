"use client";

import React, { useState } from "react";
import { ReportsSidebar } from "@/components/reports/sidebar/ReportsSidebar";
import { SalesReport } from "@/components/reports/sales/SalesReport";
import { BusinessReport } from "@/components/reports/business/BusinessReport";
import { CustomerReport } from "@/components/reports/customers/CustomerReport";
import { JobsReport } from "@/components/reports/jobs/JobsReport";
import { AutomationReport } from "@/components/reports/automation/AutomationReport";

export default function BaoCaoPage() {
  const [activeSubTab, setActiveSubTab] = useState("sales");
  const [isSimulated, setIsSimulated] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. Analytics Sub-Sidebar */}
      <ReportsSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* 2. Main Analytics Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6 relative">
        {/* Global Simulation Toggle Button */}
        <div className="absolute top-6 right-6 z-50 hidden xl:block">
          <button
            onClick={() => setIsSimulated(!isSimulated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs border cursor-pointer ${
              isSimulated
                ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-slate-650 dark:text-slate-350 hover:bg-gray-50"
            }`}
          >
            {isSimulated ? "✨ Chế độ: Mô phỏng" : "📊 Chế độ: Thực tế (0đ)"}
          </button>
        </div>

        {/* Mobile Simulation Toggle Button */}
        <div className="xl:hidden mb-4 self-end">
          <button
            onClick={() => setIsSimulated(!isSimulated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs border cursor-pointer ${
              isSimulated
                ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-slate-650 dark:text-slate-350 hover:bg-gray-55"
            }`}
          >
            {isSimulated ? "✨ Chế độ: Mô phỏng" : "📊 Chế độ: Thực tế (0đ)"}
          </button>
        </div>

        {/* Render Tab Contents */}
        {activeSubTab === "sales" ? (
          <SalesReport isSimulated={isSimulated} />
        ) : activeSubTab === "business" ? (
          <BusinessReport isSimulated={isSimulated} />
        ) : activeSubTab === "customers" ? (
          <CustomerReport isSimulated={isSimulated} />
        ) : activeSubTab === "jobs" ? (
          <JobsReport isSimulated={isSimulated} />
        ) : activeSubTab === "automation" ? (
          <AutomationReport isSimulated={isSimulated} />
        ) : (
          <SalesReport isSimulated={isSimulated} />
        )}
      </div>
    </div>
  );
}
