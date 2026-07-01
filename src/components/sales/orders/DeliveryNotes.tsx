"use client";

import React, { useMemo, useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import {
  useCreateDeliveryNote,
  useDeleteDeliveryNote,
  useDeliveryNotes,
} from "@/features/ecom/hooks/useDeliveryNotes";
import { useOrders } from "@/features/ecom/hooks/useOrders";

export const DeliveryNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "not_collected" | "collected">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [contentInput, setContentInput] = useState("");

  const notesQuery = useDeliveryNotes({ pageSize: 50 });
  const ordersQuery = useOrders({ pageSize: 50 });
  const createNote = useCreateDeliveryNote();
  const deleteNote = useDeleteDeliveryNote();

  const notes = notesQuery.data?.items ?? [];
  const orders = ordersQuery.data?.items ?? [];

  const filteredNotes = useMemo(() => {
    if (activeTab === "all") return notes;
    if (activeTab === "waiting") return notes.filter((n) => n.status === "DRAFT" || n.status === "WAITING");
    if (activeTab === "not_collected") return notes.filter((n) => n.status === "NOT_COLLECTED");
    return notes.filter((n) => n.status === "COLLECTED");
  }, [activeTab, notes]);

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "waiting", label: "Chờ lấy hàng" },
    { key: "not_collected", label: "Chưa thu tiền" },
    { key: "collected", label: "Đã thu tiền" },
  ];

  const resolveOrderCode = (orderId: number) =>
    orders.find((o) => o.orderId === orderId)?.id ?? `DH${orderId}`;

  const handleCreate = async () => {
    const orderId = Number(orderIdInput);
    if (!Number.isFinite(orderId) || orderId <= 0) return;
    await createNote.mutateAsync({
      orderId,
      content: contentInput.trim() || undefined,
      status: "DRAFT",
    });
    setOrderIdInput("");
    setContentInput("");
    setIsCreateOpen(false);
  };

  return (
    <ApiState isLoading={notesQuery.isLoading} error={notesQuery.error}>
      <div className="space-y-5 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Phiếu giao hàng
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Quản lý hoạt động vận chuyển của các đơn hàng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap"
          >
            + Tạo phiếu giao
          </button>
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

        {filteredNotes.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Đơn hàng</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Nội dung</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Trạng thái</th>
                  <th className="py-3.5 px-5 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotes.map((note) => (
                  <tr key={note.id}>
                    <td className="py-4 px-5 text-xs font-bold text-slate-800 dark:text-white">
                      {resolveOrderCode(note.orderId)}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400">
                      {note.content || "—"}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400">{note.status}</td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => void deleteNote.mutateAsync(note.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-bold cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs flex-1 flex flex-col items-center justify-center py-28 select-none">
            <div className="w-20 h-20 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-lime-400 dark:text-lime-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Chưa có phiếu giao hàng nào
            </h4>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
              Phiếu giao hàng sẽ xuất hiện ở đây khi bạn tạo vận đơn cho đơn hàng.
            </p>
          </div>
        )}

        {isCreateOpen && (
          <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo phiếu giao hàng</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ID đơn hàng (số)</label>
                <input
                  type="number"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900"
                  placeholder="orderId từ BE"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ghi chú</label>
                <textarea
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-650 rounded-lg cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  className="px-5 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ApiState>
  );
};