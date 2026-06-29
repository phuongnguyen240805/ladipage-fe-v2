import React, { useState } from "react";
import { ComparisonChart } from "../charts/ComparisonChart";

interface BusinessReportProps {
  isSimulated: boolean;
}

export const BusinessReport: React.FC<BusinessReportProps> = ({ isSimulated }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, performance
  const [pipeline, setPipeline] = useState("Tất cả pipeline");
  const [employee, setEmployee] = useState("Nhân viên");

  // Chart categories (X-axis dates)
  const categories = ["01/06", "03/06", "05/06", "07/06", "09/06", "11/06", "13/06"];
  const zeroData = [0, 0, 0, 0, 0, 0, 0];

  // Simulated chart data
  const simulatedRevenueCurrent = [800000, 2500000, 1800000, 4200000, 3100000, 6800000, 5000000];
  const simulatedRevenuePrevious = [500000, 1200000, 2000000, 2800000, 3100000, 4500000, 4000000];

  return (
    <div className="space-y-6 flex-1">
      {/* 1. Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Tổng quan Kinh doanh
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Hiệu quả bán hàng theo pipeline: giao dịch, doanh thu, cơ hội và hiệu suất nhân viên.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            <span>📅 01/06/2026 – 13/06/2026</span>
            <button className="text-slate-400 hover:text-slate-650 transition cursor-pointer">✕</button>
          </div>

          {/* Pipeline Selector */}
          <div className="relative">
            <select
              value={pipeline}
              onChange={(e) => setPipeline(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Tất cả pipeline</option>
              <option>Bán sỉ</option>
              <option>Bán lẻ</option>
              <option>Đối tác doanh nghiệp</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          {/* Employee Selector */}
          <div className="relative">
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Nhân viên</option>
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

      {/* 2. Sub Tabs (Tổng quan, Hiệu suất) */}
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
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "performance"
              ? "border-lime-500 text-lime-500 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Hiệu suất
        </button>
      </div>

      {/* 3. Content Panel */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Main Grid for Transaction Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box: Tổng giao dịch */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng giao dịch</h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Thống kê giao dịch</p>
              </div>

              {/* Sub-grid of 4 stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Tổng giao dịch</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "42" : "0"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Đang mở</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "12" : "0"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Thành công</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "25" : "0"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Thất bại</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "5" : "0"}
                  </h4>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tỷ lệ giao dịch thành công</span>
                  <span className="text-[11px] text-slate-400 font-medium">Thống kê tỷ lệ giao dịch thành công và tổng giao dịch</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-lime-500 h-full rounded-full transition-all duration-500"
                    style={{ width: isSimulated ? "59.5%" : "0%" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>Thành công {isSimulated ? "25/42" : "0/0"} giao dịch</span>
                  <span>{isSimulated ? "59.5%" : "0%"} tổng giao dịch</span>
                </div>
              </div>
            </div>

            {/* Right Box: Tổng doanh thu */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tổng doanh thu</h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Thống kê tổng doanh thu theo giao dịch</p>
              </div>

              {/* Sub-grid of 4 stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Tổng doanh thu</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "15.000.000 đ" : "0 đ"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Đang mở</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "4.500.000 đ" : "0 đ"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Thành công</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "9.200.000 đ" : "0 đ"}
                  </h4>
                </div>
                <div className="bg-[#f8fafc] dark:bg-gray-850 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Thất bại</span>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {isSimulated ? "1.300.000 đ" : "0 đ"}
                  </h4>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Thống kê giá trị giao dịch thành công</span>
                  <span className="text-[11px] text-slate-400 font-medium">Thống kê tổng giá trị giao dịch thành công và tổng giao dịch</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-success-600 h-full rounded-full transition-all duration-500"
                    style={{ width: isSimulated ? "61.3%" : "0%" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>Thành công {isSimulated ? "9.200.000 đ/15.000.000 đ" : "0 đ/0 đ"} doanh thu</span>
                  <span>{isSimulated ? "61.3%" : "0%"} tổng doanh thu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities Pipeline Box */}
          <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 shadow-theme-xs">
            {!isSimulated ? (
              <div className="py-12 text-center select-none">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  Chọn một pipeline để xem cơ hội theo giai đoạn.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Cơ hội theo giai đoạn (Pipeline: Bán sỉ)</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { stage: "Mới (Lead)", count: 15, color: "bg-lime-400" },
                    { stage: "Liên hệ", count: 12, color: "bg-indigo-500" },
                    { stage: "Đề xuất", count: 8, color: "bg-purple-500" },
                    { stage: "Thương lượng", count: 5, color: "bg-amber-500" },
                    { stage: "Chốt (Won)", count: 2, color: "bg-success-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-gray-850 p-4 rounded-xl border border-slate-100 dark:border-gray-800 flex flex-col justify-between h-[100px]">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">{item.stage}</span>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{item.count}</span>
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Revenue chart comparison */}
          <ComparisonChart
            title="Doanh thu theo giao dịch (Số giao dịch và doanh thu theo thời gian)"
            categories={categories}
            currentPeriodLabel="Chu kỳ này"
            previousPeriodLabel="Chu kỳ trước"
            currentPeriodData={isSimulated ? simulatedRevenueCurrent : zeroData}
            previousPeriodData={isSimulated ? simulatedRevenuePrevious : zeroData}
            valueType="currency"
          />
        </div>
      ) : (
        /* Performance sub-tab */
        <div className="rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center min-h-[200px] flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400">Hiệu suất nhân viên chưa có dữ liệu đánh giá.</p>
        </div>
      )}
    </div>
  );
};
