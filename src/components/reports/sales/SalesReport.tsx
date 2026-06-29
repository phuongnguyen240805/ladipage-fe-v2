import React, { useState } from "react";
import { ComparisonChart } from "../charts/ComparisonChart";
import { IconDollar, IconCard, IconCart, IconCancel } from "../dung-chung/icons";

interface SalesReportProps {
  isSimulated: boolean;
}

export const SalesReport: React.FC<SalesReportProps> = ({ isSimulated }) => {
  const [selectedShop, setSelectedShop] = useState("Tất cả cửa hàng");

  // Chart categories (X-axis dates)
  const categories = ["01/06", "03/06", "05/06", "07/06", "09/06", "11/06", "13/06"];

  // Real-world (Zero data to match screenshot)
  const zeroData = [0, 0, 0, 0, 0, 0, 0];

  // Simulated active data (when toggled)
  const simulatedRevenueCurrent = [1200000, 3500000, 2100000, 5400000, 4300000, 8900000, 6200000];
  const simulatedRevenuePrevious = [800000, 1500000, 2400000, 3100000, 3900000, 5200000, 4800000];

  const simulatedOrdersCurrent = [3, 8, 5, 12, 9, 18, 14];
  const simulatedOrdersPrevious = [2, 4, 6, 8, 10, 11, 10];

  return (
    <div className="space-y-6 flex-1">
      {/* Control / Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-150 dark:border-gray-855 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Tổng quan Bán hàng
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Tổng quan tình hình kinh doanh: doanh thu, hiệu suất đơn hàng và phân bổ theo nguồn/sản phẩm.
          </p>
        </div>

        {/* Filters and Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative">
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer shadow-2xs"
            >
              <option>Tất cả cửa hàng</option>
              <option>Cửa hàng chính</option>
              <option>TikTok Shop</option>
              <option>Shopee Store</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          {/* Date Picker indicators */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-bold">
              <span>📅 01/06/2026 – 13/06/2026</span>
              <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition cursor-pointer">
                ✕
              </button>
            </div>
            <span className="text-[11px] font-bold text-slate-400">so với</span>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-bold">
              <span>📅 18/05/2026 – 31/05/2026</span>
              <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition cursor-pointer">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Doanh thu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs flex flex-col justify-between min-h-[140px] hover:shadow-theme-sm transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Doanh thu
            </span>
            <div className="w-8 h-8 rounded-lg bg-lime-50 dark:bg-lime-950/40 text-lime-500 dark:text-lime-300 flex items-center justify-center">
              <IconDollar size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isSimulated ? "31.600.000 đ" : "0 đ"}
            </h3>
            <p className={`text-[11px] font-bold mt-1.5 ${isSimulated ? "text-success-650" : "text-red-500"}`}>
              {isSimulated ? "📈 Tăng 44.5% so với kỳ trước" : "Kỳ trước: Không có doanh thu"}
            </p>
          </div>
        </div>

        {/* Giá trị TB/đơn */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs flex flex-col justify-between min-h-[140px] hover:shadow-theme-sm transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Giá trị TB/đơn
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <IconCard size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isSimulated ? "390.123 đ" : "0 đ"}
            </h3>
            <p className={`text-[11px] font-bold mt-1.5 ${isSimulated ? "text-success-655" : "text-red-500"}`}>
              {isSimulated ? "📈 Tăng 12.8% so với kỳ trước" : "Kỳ trước: Không có doanh thu"}
            </p>
          </div>
        </div>

        {/* Đơn thành công */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs flex flex-col justify-between min-h-[140px] hover:shadow-theme-sm transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Đơn thành công
            </span>
            <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-950/40 text-success-600 dark:text-success-400 flex items-center justify-center">
              <IconCart size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isSimulated ? "81 đơn" : "0 đơn"}
            </h3>
            <p className={`text-[11px] font-bold mt-1.5 ${isSimulated ? "text-success-655" : "text-red-500"}`}>
              {isSimulated ? "📈 Tăng 65.3% so với kỳ trước" : "Kỳ trước: Không có đơn"}
            </p>
          </div>
        </div>

        {/* Đơn huỷ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs flex flex-col justify-between min-h-[140px] hover:shadow-theme-sm transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Đơn huỷ
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <IconCancel size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isSimulated ? "3 đơn" : "0 đơn"}
            </h3>
            <p className={`text-[11px] font-bold mt-1.5 ${isSimulated ? "text-success-655" : "text-red-500"}`}>
              {isSimulated ? "📉 Giảm 50% so với kỳ trước" : "Kỳ trước: Không có đơn"}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonChart
          title="Doanh thu"
          categories={categories}
          currentPeriodLabel="01/06/2026 - 13/06/2026"
          previousPeriodLabel="18/05/2026 - 31/05/2026"
          currentPeriodData={isSimulated ? simulatedRevenueCurrent : zeroData}
          previousPeriodData={isSimulated ? simulatedRevenuePrevious : zeroData}
          valueType="currency"
        />

        <ComparisonChart
          title="Thống kê đơn hàng"
          categories={categories}
          currentPeriodLabel="01/06/2026 - 13/06/2026"
          previousPeriodLabel="18/05/2026 - 31/05/2026"
          currentPeriodData={isSimulated ? simulatedOrdersCurrent : zeroData}
          previousPeriodData={isSimulated ? simulatedOrdersPrevious : zeroData}
          valueType="number"
        />
      </div>
    </div>
  );
};
