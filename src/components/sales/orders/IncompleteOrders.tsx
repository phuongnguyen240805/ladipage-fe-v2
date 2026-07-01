"use client";

import React, { useMemo, useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import { useOrders, useUpdateOrderStatus } from "@/features/ecom/hooks/useOrders";

export const IncompleteOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "not_sent" | "sent">("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { data, isLoading, error } = useOrders({
    status: "incomplete",
    pageSize: 50,
  });
  const updateStatus = useUpdateOrderStatus();
  const orders = data?.items ?? [];

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "not_sent") {
      return orders.filter((o) => o.status === "PENDING" || o.status === "UNPAID");
    }
    return orders.filter((o) => o.status === "SHIPPED");
  }, [activeTab, orders]);

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "not_sent", label: "Chưa gửi" },
    { key: "sent", label: "Đã gửi" },
  ];

  const handleComplete = async (orderId?: number) => {
    if (!orderId) return;
    await updateStatus.mutateAsync({ orderId, status: "COMPLETED" });
  };

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-5 flex-1">
        <div className="border-b border-gray-150 dark:border-gray-850 pb-5">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Đơn hàng chưa hoàn tất
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Quản lý các đơn bị bỏ dở ở bước cuối — chủ động liên hệ để giúp khách hoàn thành đơn.
          </p>
        </div>

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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-205 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Thời gian
            </button>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Mã đơn</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Khách hàng</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Sản phẩm</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Trạng thái</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10">
                    <td className="py-4 px-5 text-xs font-bold text-slate-800 dark:text-white">{order.id}</td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {order.customerName}
                      <div className="text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-400">{order.productName}</td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-400">{order.status}</td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => void handleComplete(order.orderId)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg cursor-pointer"
                      >
                        Hoàn tất
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs flex-1 flex flex-col items-center justify-center py-28 select-none">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-9 h-9 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Không có đơn hàng khớp bộ lọc
            </h4>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed mb-5">
              Không có đơn chưa hoàn tất nào khớp. Thử đổi từ khoá hoặc bỏ bớt bộ lọc.
            </p>
            <button
              onClick={() => setActiveTab("all")}
              className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition cursor-pointer"
            >
              Xoá bộ lọc
            </button>
          </div>
        )}
      </div>
    </ApiState>
  );
};