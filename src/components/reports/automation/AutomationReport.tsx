"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import ApiState from "@/components/common/ApiState";
import type { ReportDateRange } from "@/lib/endpoints/analytics.api";
import { useAutomationReport } from "@/features/analytics/hooks/useReports";
import { ComparisonChart } from "../charts/ComparisonChart";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface AutomationReportProps {
  dateRange: ReportDateRange;
}

export const AutomationReport: React.FC<AutomationReportProps> = ({ dateRange }) => {
  const { data, isLoading, error } = useAutomationReport(dateRange);
  const [activeTab, setActiveTab] = useState("overview");

  const newCustomers = data?.newCustomers;
  const sentSpend = data?.sentSpend;
  const hasData =
    (newCustomers?.summary.total ?? 0) > 0 ||
    (sentSpend?.summary.total ?? 0) > 0;

  const categoriesNewCustomers = newCustomers?.labels ?? [];
  const newCustomersCurrent = newCustomers?.series[0]?.data ?? [];
  const newCustomersPrevious = newCustomers?.series[1]?.data ?? [];

  const categoriesSentSpend = sentSpend?.labels ?? [];
  const zeroLen = categoriesSentSpend.length || 1;
  const zeroData = Array(zeroLen).fill(0);
  const sentSeries = sentSpend?.series ?? [];

  // ApexOptions for the dual Y-axis chart
  const sentSpendChartOptions: ApexOptions = {
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "11px",
      markers: {
        shape: "circle",
        size: 5,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
    },
    colors: ["#fbbf24", "#65a30d", "#ef4444", "#0d9488"], // Yellow, Dark Blue, Red, Teal
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2, 2],
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: categoriesSentSpend,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#64748b",
          fontWeight: 500,
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Số tin",
          style: {
            fontSize: "11px",
            fontWeight: 600,
            color: "#64748b",
          },
        },
        labels: {
          style: {
            colors: "#64748b",
          },
        },
        min: 0,
      },
      {
        opposite: true,
        title: {
          text: "Điểm",
          style: {
            fontSize: "11px",
            fontWeight: 600,
            color: "#64748b",
          },
        },
        labels: {
          style: {
            colors: "#64748b",
          },
        },
        min: 0,
      },
    ],
    tooltip: {
      enabled: true,
      shared: true,
      y: {
        formatter: (val, opts) => {
          // If it's the "Số tiền" series (index 2)
          if (opts.seriesIndex === 2) {
            return val.toLocaleString("vi-VN") + " đ";
          }
          // If it's "Điểm" series (index 0)
          if (opts.seriesIndex === 0) {
            return val + " điểm";
          }
          return val + " tin";
        },
      },
    },
  };

  const sentSpendChartSeries = [
    {
      name: sentSeries[0]?.name ?? "Điểm",
      type: "line",
      data: hasData ? (sentSeries[0]?.data ?? zeroData) : zeroData,
    },
    {
      name: sentSeries[1]?.name ?? "Tin gửi thất bại",
      type: "line",
      data: hasData ? (sentSeries[1]?.data ?? zeroData) : zeroData,
    },
    {
      name: sentSeries[2]?.name ?? "Số tiền",
      type: "line",
      data: hasData ? (sentSeries[2]?.data ?? zeroData) : zeroData,
    },
    {
      name: sentSeries[3]?.name ?? "Tin gửi thành công",
      type: "line",
      data: hasData ? (sentSeries[3]?.data ?? zeroData) : zeroData,
    },
  ];

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-6 flex-1">
      {/* 1. Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Báo cáo tự động hóa
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Theo dõi khách hàng mới, tin nhắn đã gửi và chi tiêu theo từng kênh.
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
          <span>📅 {dateRange.from} – {dateRange.to}</span>
          <button className="text-slate-400 hover:text-slate-655 transition cursor-pointer">✕</button>
        </div>
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850 overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 py-1">
          {[
            { key: "overview", label: "Tổng quan" },
            { key: "zalo-zns", label: "Zalo ZNS" },
            { key: "zalo-care", label: "Zalo Quan tâm" },
            { key: "sms", label: "SMS" },
            { key: "email", label: "Email" },
            { key: "facebook", label: "Facebook Messenger" },
            { key: "third-party", label: "Third-party" },
            { key: "ai-call", label: "AI Call" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 rounded-t-lg cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-lime-500 text-lime-500 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-55 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Content */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* KPI grid of 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
              <span className="text-xs font-bold text-slate-400 block uppercase font-inter">Khách hàng mới</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {newCustomers?.summary.total ?? 0}
              </h4>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
              <span className="text-xs font-bold text-slate-400 block uppercase font-inter">Tin gửi thành công</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {sentSpend?.summary.total ?? 0}
              </h4>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
              <span className="text-xs font-bold text-slate-400 block uppercase font-inter">Điểm còn lại</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                250
              </h4>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
              <span className="text-xs font-bold text-slate-400 block uppercase font-inter">Số dư còn lại</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {(sentSpend?.summary.total ?? 0).toLocaleString("vi-VN")} đ
              </h4>
            </div>
          </div>

          {/* Chart 1: Báo cáo khách hàng mới */}
          <ComparisonChart
            title="Báo cáo khách hàng mới"
            categories={categoriesNewCustomers}
            currentPeriodLabel="Khách hàng mới"
            previousPeriodLabel="Kỳ trước"
            currentPeriodData={newCustomersCurrent}
            previousPeriodData={newCustomersPrevious}
            valueType="number"
          />

          {/* Chart 2: Báo cáo tin đã gửi và chi tiêu (Dual Y-Axis) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">
                Báo cáo tin đã gửi và chi tiêu
              </h3>
            </div>
            <div className="max-w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[700px] xl:min-w-full">
                <ReactApexChart
                  options={sentSpendChartOptions}
                  series={sentSpendChartSeries}
                  type="line"
                  height={280}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400">Báo cáo kênh tự động hóa cụ thể chưa có dữ liệu chi tiết.</p>
        </div>
      )}
    </div>
    </ApiState>
  );
};
