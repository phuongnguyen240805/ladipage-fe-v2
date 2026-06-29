"use client";

import React, { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderTag = {
  id: string;
  name: string;
  color: string;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Color options ────────────────────────────────────────────────────────────
const TAG_COLORS = [
  { value: "#e5e7eb", label: "Xám" },    // neutral/white outline
  { value: "#fb923c", label: "Cam" },
  { value: "#fbbf24", label: "Vàng" },
  { value: "#a3e635", label: "Xanh lá" },
  { value: "#34d399", label: "Ngọc" },
  { value: "#38bdf8", label: "Xanh dương" },
  { value: "#818cf8", label: "Tím nhạt" },
  { value: "#a78bfa", label: "Tím" },
  { value: "#f472b6", label: "Hồng" },
];

// ─── Create Tag Modal ─────────────────────────────────────────────────────────
interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({ isOpen, onClose, onSave }) => {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    onSave(tagName.trim(), selectedColor);
    setTagName("");
    setSelectedColor(TAG_COLORS[0].value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-md animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo tag mới</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Đặt tên và chọn màu cho tag để dễ phân biệt khi gắn vào đơn hàng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          {/* Tag Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên tag <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={80}
                placeholder="Ví dụ: VIP, Khách quen, Giao gấp..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-lime-300 dark:border-lime-500 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-100 dark:focus:ring-lime-900"
                autoFocus
                required
              />
              <span className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-400">
                {tagName.length}/80
              </span>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Màu hiển thị
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {TAG_COLORS.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    title={color.label}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer border-2 ${
                      isSelected
                        ? "border-lime-500 scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={color.value === "#e5e7eb" ? "#6b7280" : "white"} strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xem trước</label>
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: selectedColor + "33",
                  color: selectedColor === "#e5e7eb" ? "#6b7280" : selectedColor,
                  border: `1.5px solid ${selectedColor}`,
                }}
              >
                {tagName || "Tên tag"}
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!tagName.trim()}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition ${
                tagName.trim()
                  ? "bg-violet-600 hover:bg-violet-700 cursor-pointer"
                  : "bg-violet-400 opacity-50 cursor-not-allowed"
              }`}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Order Tags Main Component ────────────────────────────────────────────────
export const OrderTags: React.FC = () => {
  const [tags, setTags] = useState<OrderTag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSaveTag = (name: string, color: string) => {
    const newTag: OrderTag = {
      id: String(Date.now()),
      name,
      color,
      orderCount: 0,
      createdAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        + ", " + new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setTags((prev) => [newTag, ...prev]);
    triggerToast(`Đã tạo tag "${name}" thành công!`);
  };

  const handleDeleteTag = (id: string, name: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    triggerToast(`Đã xóa tag "${name}"`);
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Quản lý Tag đơn hàng
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Gắn thẻ cho đơn hàng để phân loại và quản lý hiệu quả hơn.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap"
        >
          + Tạo Tag mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[360px] justify-between">
        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">
                  Tên tag
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">
                  Số lượng đơn
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">
                  Ngày cập nhật
                </th>
                <th className="py-3.5 px-5 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition">
                    <td className="py-4 px-5">
                      <span
                        className="inline-block px-3 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: tag.color + "33",
                          color: tag.color === "#e5e7eb" ? "#6b7280" : tag.color,
                          border: `1.5px solid ${tag.color}`,
                        }}
                      >
                        {tag.name}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {tag.orderCount}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {tag.createdAt}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {tag.updatedAt}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer"
                        title="Xóa tag"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty state */
                <tr>
                  <td colSpan={5} className="py-24 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                        <svg className="w-7 h-7 text-lime-300 dark:text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.592 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có tag nào</h4>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Tạo tag đầu tiên để bắt đầu phân loại đơn hàng.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        + Tạo Tag mới
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateTagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTag}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-[220px] animate-slide-in-right text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
