"use client";

import React, { useState } from "react";
import ApiState from "@/components/common/ApiState";
import {
  useCreateCustomerCustomField,
  useCustomerCustomFields,
  useDeleteCustomerCustomField,
} from "@/features/crm/hooks/useCustomerCustomFields";
import { CustomFieldType } from "../dung-chung/types";
import { IconSearch, IconX, IconCustomField } from "../dung-chung/icons";


export const CustomerCustomFields: React.FC = () => {
  const { data, isLoading, error } = useCustomerCustomFields();
  const createField = useCreateCustomerCustomField();
  const deleteField = useDeleteCustomerCustomField();
  const fields = data?.items ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | CustomFieldType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newDisplayName, setNewDisplayName] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newDataType, setNewDataType] = useState<CustomFieldType>("Chữ");
  const [newDescription, setNewDescription] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newFieldName.trim()) return;

    try {
      await createField.mutateAsync({
        displayName: newDisplayName.trim(),
        fieldName: newFieldName.trim().toLowerCase().replace(/\s+/g, "_"),
        dataType: newDataType,
        description: newDescription.trim() || undefined,
      });
      triggerToast("Tạo trường tùy chỉnh mới thành công!");
      setIsModalOpen(false);
      setNewDisplayName("");
      setNewFieldName("");
      setNewDataType("Chữ");
      setNewDescription("");
    } catch {
      triggerToast("Không tạo được trường tùy chỉnh. Vui lòng thử lại.");
    }
  };

  const handleDeleteField = async (id: string, name: string) => {
    try {
      await deleteField.mutateAsync(id);
      triggerToast(`Đã xóa trường tùy chỉnh ${name} thành công!`);
    } catch {
      triggerToast("Không xóa được trường tùy chỉnh. Vui lòng thử lại.");
    }
  };

  const filteredFields = fields.filter((f) => {
    const matchesSearch =
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "ALL" || f.dataType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Trường tùy chỉnh
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Mở rộng cấu trúc dữ liệu khách hàng của bạn bằng cách định nghĩa thêm các trường thông tin đặc thù.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer font-inter"
          >
            <span>Tạo trường mới</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hiển thị, tên trường..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>

        {/* Data Type Filter Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-lime-400 cursor-pointer"
            >
              <option value="ALL">Tất cả kiểu dữ liệu</option>
              <option value="Chữ">Chữ (Text)</option>
              <option value="Số">Số (Number)</option>
              <option value="Ngày tháng">Ngày tháng (Date)</option>
              <option value="Danh sách">Danh sách (List)</option>
              <option value="Đúng/Sai">Đúng/Sai (Boolean)</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Tổng số: {fields.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-855 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Tên hiển thị
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Tên trường
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Kiểu dữ liệu
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Mô tả
                </th>
                <th className="py-3.5 px-6 w-20 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFields.length > 0 ? (
                filteredFields.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                  >
                    <td className="py-4 px-6 text-xs font-bold text-slate-800 dark:text-white">
                      {item.displayName}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-lime-500 dark:text-lime-300">
                      {item.fieldName}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] rounded-md font-extrabold tracking-wider ${
                          item.dataType === "Chữ"
                            ? "text-lime-800 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/40"
                            : item.dataType === "Số"
                            ? "text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40"
                            : item.dataType === "Ngày tháng"
                            ? "text-purple-800 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/40"
                            : item.dataType === "Danh sách"
                            ? "text-indigo-800 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/40"
                            : "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40"
                        }`}
                      >
                        {item.dataType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[300px] truncate" title={item.description}>
                      {item.description || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteField(item.id, item.displayName)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded transition cursor-pointer"
                        title="Xóa trường"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                        <IconCustomField size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Không tìm thấy trường tùy chỉnh nào
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                        Thử thay đổi từ khóa hoặc bộ lọc kiểu dữ liệu để tìm kết quả.
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
            <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium">
              Đang hiển thị 1-{filteredFields.length} đến {filteredFields.length} của {fields.length} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-855">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Tạo trường tùy chỉnh mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateField} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhu cầu mua sắm"
                  value={newDisplayName}
                  onChange={(e) => {
                    setNewDisplayName(e.target.value);
                    if (!newFieldName) {
                      // auto-slugify
                      setNewFieldName(
                        e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[đĐ]/g, "d")
                          .replace(/[^a-z0-9\s]/g, "")
                          .replace(/\s+/g, "_")
                      );
                    }
                  }}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Tên trường (không dấu, cách bằng dấu gạch dưới) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: shopping_demands"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Kiểu dữ liệu
                </label>
                <select
                  value={newDataType}
                  onChange={(e) => setNewDataType(e.target.value as any)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium cursor-pointer"
                >
                  <option value="Chữ">Chữ (Text)</option>
                  <option value="Số">Số (Number)</option>
                  <option value="Ngày tháng">Ngày tháng (Date)</option>
                  <option value="Danh sách">Danh sách (List)</option>
                  <option value="Đúng/Sai">Đúng/Sai (Boolean)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Mô tả trường
                </label>
                <textarea
                  placeholder="Mô tả công dụng của trường tùy chỉnh này..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium resize-none"
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
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-xs font-bold text-white rounded-lg shadow-sm transition duration-150 cursor-pointer"
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
