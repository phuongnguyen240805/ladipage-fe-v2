"use client";

import React, { useEffect, useMemo, useState } from "react";
import ApiState from "@/components/common/ApiState";
import { useErrorLogs } from "@/features/crm/hooks/useErrorLogs";
import { IconSearch, IconX, IconErrorLog } from "../dung-chung/icons";

export const ErrorLog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [listSearch, setListSearch] = useState<string | undefined>();
  const { data, isLoading, error } = useErrorLogs({
    pageSize: 100,
    search: listSearch,
  });
  const logs = useMemo(() => data?.items ?? [], [data?.items]);
  const [showDateRange, setShowDateRange] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListSearch(searchQuery.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredLogs = logs;

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Lịch sử lỗi
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Tra cứu và giám sát các nhật ký lỗi phát sinh trong quá trình đồng bộ, chăm sóc khách hàng.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm mã lỗi, khách hàng, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
            />
          </div>

          {showDateRange && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-50 dark:bg-lime-950/30 text-lime-600 dark:text-lime-200 border border-lime-100 dark:border-lime-900/50 rounded-lg text-xs font-bold">
              <span>📅 Khoảng thời gian: 14/05/2026 – 13/06/2026</span>
              <button
                onClick={() => setShowDateRange(false)}
                className="text-lime-400 hover:text-lime-600 p-0.5 hover:bg-lime-50 dark:hover:bg-lime-900 rounded-full transition cursor-pointer"
              >
                <IconX size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Table / Empty State */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-855 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                    Thời gian
                  </th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Mã lỗi
                  </th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Khách hàng
                  </th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Loại hành động
                  </th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Nội dung lỗi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                    >
                      <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.time}
                      </td>
                      <td className="py-4 px-6 text-xs font-mono font-bold text-red-600 dark:text-red-400">
                        {item.errorCode}
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {item.customer}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-800 dark:text-white">
                        {item.actionType}
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[320px] truncate" title={item.errorContent}>
                        {item.errorContent}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center select-none">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                          <IconErrorLog size={26} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Chưa có log lỗi nào.
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                          Khi phát sinh lỗi đồng bộ dữ liệu hoặc truyền tin (SMS, ZNS, Email), thông tin chi tiết sẽ được ghi nhận tại đây.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-855 p-4 bg-gray-50/20 dark:bg-gray-900/10">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium">
                Đang hiển thị 1-{filteredLogs.length} đến {filteredLogs.length} của {logs.length} bản ghi
              </span>
            </div>
          </div>
        </div>
      </div>
    </ApiState>
  );
};