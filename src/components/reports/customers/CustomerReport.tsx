import React, { useState } from "react";
import { ComparisonChart } from "../charts/ComparisonChart";

interface CustomerReportProps {
  isSimulated: boolean;
}

export const CustomerReport: React.FC<CustomerReportProps> = ({ isSimulated }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, segments, time
  const [selectedTag, setSelectedTag] = useState("Chọn tag");

  // Chart categories (31/05 to 13/06)
  const categories = [
    "31/05", "01/06", "02/06", "03/06", "04/06", "05/06", "06/06",
    "07/06", "08/06", "09/06", "10/06", "11/06", "12/06", "13/06"
  ];

  const zeroData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Simulated data
  const newCustomersCurrent = [1, 3, 0, 5, 2, 4, 1, 6, 2, 0, 8, 3, 5, 4];
  const newCustomersPrevious = [2, 1, 4, 2, 0, 3, 5, 1, 2, 6, 1, 0, 3, 2];

  const cumulativeCustomersCurrent = [10, 13, 13, 18, 20, 24, 25, 31, 33, 33, 41, 44, 49, 53];
  const cumulativeCustomersPrevious = [5, 6, 10, 12, 12, 15, 20, 21, 23, 29, 30, 30, 33, 35];

  return (
    <div className="space-y-6 flex-1">
      {/* 1. Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Báo cáo khách hàng
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Thống kê tăng trưởng, phân khúc, khu vực và lịch sử mua của khách hàng.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            <span>📅 01/06/2026 – 13/06/2026</span>
            <button className="text-slate-400 hover:text-slate-655 transition cursor-pointer">✕</button>
          </div>

          {/* Tag selector */}
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Chọn tag</option>
              <option>VIP</option>
              <option>Lead</option>
              <option>Spam</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-lime-500 text-lime-500 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("segments")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "segments"
              ? "border-lime-500 text-lime-500 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Phân tích khách hàng
        </button>
        <button
          onClick={() => setActiveTab("time")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "time"
              ? "border-lime-500 text-lime-500 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Thời gian mua hàng
        </button>
      </div>

      {/* 3. Tab Content Panels */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Chart 1: Biểu đồ khách hàng mới */}
          <ComparisonChart
            title="Biểu đồ khách hàng mới (Thống kê nhanh số lượng khách hàng mới và tổng số khách hàng đang có)"
            categories={categories}
            currentPeriodLabel="Chu kỳ này (Khách hàng mới theo ngày)"
            previousPeriodLabel="Chu kỳ trước"
            currentPeriodData={isSimulated ? newCustomersCurrent : zeroData}
            previousPeriodData={isSimulated ? newCustomersPrevious : zeroData}
            valueType="number"
          />

          {/* Chart 2: Tích lũy khách hàng đến */}
          <ComparisonChart
            title="Tích lũy khách hàng đến (Thống kê nhanh số lượng khách hàng mới và tổng số khách hàng đang có)"
            categories={categories}
            currentPeriodLabel="Chu kỳ này"
            previousPeriodLabel="Chu kỳ trước"
            currentPeriodData={isSimulated ? cumulativeCustomersCurrent : zeroData}
            previousPeriodData={isSimulated ? cumulativeCustomersPrevious : zeroData}
            valueType="number"
          />
        </div>
      ) : activeTab === "segments" ? (
        <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400">Phân tích khách hàng theo Segment / vị trí địa lý chưa có dữ liệu.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400">Phân tích thời gian mua hàng ưa thích của khách hàng chưa có dữ liệu.</p>
        </div>
      )}
    </div>
  );
};
