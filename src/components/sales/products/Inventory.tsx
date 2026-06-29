"use client";

import React, { useState } from "react";

// ─── Inventory Component ──────────────────────────────────────────────────────
export const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý tồn kho</h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Theo dõi số lượng và điều chỉnh tồn kho theo từng SKU.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-gray-200 dark:text-slate-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/70 rounded-lg shadow-2xs transition cursor-pointer whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
          </svg>
          Xem danh sách sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          type="text"
          placeholder="Tìm theo tên hoặc SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
              {/* Sản phẩm */}
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Sản phẩm
                <svg className="inline-block w-3 h-3 ml-0.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
                </svg>
              </th>
              {/* SKU */}
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                SKU
                <svg className="inline-block w-3 h-3 ml-0.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
                </svg>
              </th>
              {/* Giá */}
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Giá
                <svg className="inline-block w-3 h-3 ml-0.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
                </svg>
              </th>
              {/* Số lượng — active sort descending */}
              <th className="py-3.5 px-5 text-xs font-bold text-lime-500 cursor-pointer select-none hover:text-lime-600 transition">
                Số lượng
                <svg className="inline-block w-3 h-3 ml-0.5 text-lime-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M16 15l-4 4-4-4"/>
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="py-24 text-center select-none">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có sản phẩm trong kho</h4>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
                    Tạo sản phẩm trong danh sách để bắt đầu theo dõi tồn kho.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
