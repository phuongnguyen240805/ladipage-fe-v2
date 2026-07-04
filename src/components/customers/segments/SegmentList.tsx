"use client";

import React, { useMemo, useState } from "react";
import ApiState from "@/components/common/ApiState";
import {
  useCreateSegment,
  useDeleteSegment,
  useSegments,
} from "@/features/crm/hooks/useSegments";
import { IconSearch, IconX, IconSegment } from "../dung-chung/icons";

export const SegmentList: React.FC = () => {
  const {
    data: segmentsData,
    isLoading,
    error,
  } = useSegments({ pageSize: 100 });
  const createSegment = useCreateSegment();
  const deleteSegment = useDeleteSegment();
  const segments = useMemo(() => {
    const items = segmentsData?.items ?? [];
    return [...items].sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
      }
      return a.name.localeCompare(b.name, "vi");
    });
  }, [segmentsData?.items]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) return;

    try {
      await createSegment.mutateAsync({ name: newSegmentName.trim() });
      triggerToast("Tạo Segment mới thành công!");
      setIsModalOpen(false);
      setNewSegmentName("");
    } catch {
      triggerToast("Không tạo được Segment. Vui lòng thử lại.");
    }
  };

  const handleDeleteSegment = async (id: string, name: string) => {
    const segment = segments.find((s) => s.id === id);
    if (segment?.isDefault) {
      triggerToast("Không thể xóa Segment mặc định của hệ thống!");
      return;
    }
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    try {
      await deleteSegment.mutateAsync(numericId);
      triggerToast(`Đã xóa segment ${name} thành công!`);
    } catch {
      triggerToast("Không xóa được Segment. Vui lòng thử lại.");
    }
  };

  const filteredSegments = segments.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Quản lý Segment
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Nhóm khách hàng theo tiêu chí để nhắm mục tiêu chính xác hơn.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>Tạo Segment mới</span>
          </button>
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
            placeholder="Tìm kiếm theo tên Segment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng số: {segments.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Tên Segment
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Số khách hàng
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Thời gian cập nhật
                </th>
                <th className="py-3.5 px-6 w-20 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSegments.length > 0 ? (
                filteredSegments.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                  >
                    <td className="py-4 px-6 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {item.name}
                        </span>
                        {item.isDefault && (
                          <span className="px-2 py-0.5 text-[9px] font-black text-lime-500 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/40 rounded-sm uppercase tracking-wider">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-800 dark:text-white">
                      {item.customerCount}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.createdAt}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.updatedAt}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {!item.isDefault ? (
                        <button
                          onClick={() => handleDeleteSegment(item.id, item.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded transition cursor-pointer"
                          title="Xóa segment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 select-none">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                        <IconSegment size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Không tìm thấy Segment nào
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                        Thử điều chỉnh từ khóa tìm kiếm để tìm kết quả phù hợp.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-855 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-855 rounded-lg px-3 py-1.5 pr-8 text-[13px] font-medium text-slate-750 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-450">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
            <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium">
              Đang hiển thị 1 đến {filteredSegments.length} của {segments.length} bản ghi
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md bg-lime-500 text-white font-semibold text-xs shadow-xs cursor-pointer">
              1
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-855">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Tạo Segment mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSegment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 font-inter">
                  Tên Segment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khách hàng mua nhiều"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-55 dark:hover:bg-gray-800 text-xs font-bold text-slate-700 dark:text-slate-350 rounded-lg transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-850 border border-slate-800 dark:border-gray-800 rounded-xl shadow-xl px-4 py-3 min-w-[200px] animate-slide-in-right text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
    </ApiState>
  );
};
