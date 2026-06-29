"use client";

import React, { useState } from "react";

// ─── Delivery Notes (Phiếu giao hàng) ───────────────────────────────────────
export const DeliveryNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "not_collected" | "collected">("all");

  const tabs = [
    { key: "all",           label: "Tất cả" },
    { key: "waiting",       label: "Chờ lấy hàng" },
    { key: "not_collected", label: "Chưa thu tiền" },
    { key: "collected",     label: "Đã thu tiền" },
  ];

  return (
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="border-b border-gray-150 dark:border-gray-850 pb-5">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Phiếu giao hàng
        </h1>
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Quản lý hoạt động vận chuyển của các đơn hàng.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850 overflow-x-auto">
        <div className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 rounded-t-lg cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-lime-500 text-lime-500 bg-lime-50/40 dark:bg-lime-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time picker */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-205 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Thời gian
          </button>

          {/* Status dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-205 dark:border-gray-800 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer">
              <option>Tất cả trạng thái</option>
              <option>Chờ lấy hàng</option>
              <option>Đã lấy hàng</option>
              <option>Đang giao</option>
              <option>Đã giao</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </span>
          </div>

          {/* Payment collection dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-205 dark:border-gray-800 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer">
              <option>Tất cả thu tiền</option>
              <option>Đã thu tiền</option>
              <option>Chưa thu tiền</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs flex-1 flex flex-col items-center justify-center py-28 select-none">
        {/* Mail / delivery icon */}
        <div className="w-20 h-20 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-lime-300 dark:text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
          Chưa có phiếu giao hàng nào
        </h4>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
          Phiếu giao hàng sẽ xuất hiện ở đây khi bạn tạo vận đơn cho đơn hàng.
        </p>
      </div>
    </div>
  );
};
