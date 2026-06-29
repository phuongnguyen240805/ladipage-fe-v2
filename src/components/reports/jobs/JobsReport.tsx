import React, { useState } from "react";
import { ComparisonChart } from "../charts/ComparisonChart";

interface JobsReportProps {
  isSimulated: boolean;
}

export const JobsReport: React.FC<JobsReportProps> = ({ isSimulated }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, performance, volume
  const [space, setSpace] = useState("Chọn Space");
  const [member, setMember] = useState("Chọn thành viên");

  // Mock data for simulation
  const categories = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
  const zeroData = [0, 0, 0, 0, 0];
  const simulatedTasksCurrent = [5, 12, 8, 15, 11];
  const simulatedTasksPrevious = [4, 8, 10, 9, 10];

  return (
    <div className="space-y-6 flex-1">
      {/* 1. Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Báo cáo công việc
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Theo dõi toàn bộ tiến độ công việc, hiệu suất đội nhóm trong một nơi duy nhất, giúp bạn nhanh chóng nắm bắt tình hình và đưa ra quyết định kịp thời.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            <span>📅 01/06/2026 – 13/06/2026</span>
            <button className="text-slate-400 hover:text-slate-655 transition cursor-pointer">✕</button>
          </div>

          {/* Space Selector */}
          <div className="relative">
            <select
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Chọn Space</option>
              <option>Phát triển sản phẩm</option>
              <option>Marketing & Growth</option>
              <option>Chăm sóc khách hàng</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          {/* Member Selector */}
          <div className="relative">
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Chọn thành viên</option>
              <option>Nguyễn Văn An</option>
              <option>Trần Thị Bình</option>
              <option>Lê Quang Cường</option>
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
        {["overview", "performance", "volume"].map((tab) => {
          const tabLabels: Record<string, string> = {
            overview: "Tổng quan",
            performance: "Hiệu suất",
            volume: "Khối lượng",
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === tab
                  ? "border-lime-500 text-lime-500 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {!isSimulated ? (
            /* Empty state (matches screenshot exactly) */
            <div className="rounded-2xl border border-gray-200 bg-white p-20 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs min-h-[320px] flex items-center justify-center">
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                Không có dữ liệu
              </span>
            </div>
          ) : (
            /* Populated layout for visual helper */
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Công việc đã tạo</span>
                  <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1">24 việc</h4>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Đang tiến hành</span>
                  <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1">5 việc</h4>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Hoàn thành</span>
                  <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1">18 việc</h4>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Đúng hạn (%)</span>
                  <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1">94.4%</h4>
                </div>
              </div>

              <ComparisonChart
                title="Số lượng công việc hoàn thành theo ngày"
                categories={categories}
                currentPeriodLabel="Tuần này"
                previousPeriodLabel="Tuần trước"
                currentPeriodData={simulatedTasksCurrent}
                previousPeriodData={simulatedTasksPrevious}
                valueType="number"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400">Không có dữ liệu hiệu suất hoặc khối lượng công việc nào được ghi nhận.</p>
        </div>
      )}
    </div>
  );
};
