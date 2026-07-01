"use client";

import React, { useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import {
  useCreateTag,
  useDeleteTag,
  useProductTags,
} from "@/features/ecom/hooks/useTags";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductTag = {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = () => (
  <svg className="inline-block w-3 h-3 ml-0.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
  </svg>
);

// ─── Create Product Tag Modal ─────────────────────────────────────────────────
interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({ isOpen, onClose, onSave }) => {
  const [tagName, setTagName] = useState("");

  if (!isOpen) return null;

  const handleClose = () => { setTagName(""); onClose(); };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    onSave(tagName.trim());
    setTagName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo Tag sản phẩm</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Tag dùng để gắn nhãn nhanh cho sản phẩm.</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition ml-4 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          {/* Tag Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên Tag <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={60}
                placeholder="VD: Bán chạy, Khuyến mãi..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                autoFocus
                required
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-lime-400 dark:border-lime-500 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-200 font-medium"
              />
              <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400">{tagName.length}/60</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xem trước</label>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-900">
                {tagName || "Tên Tag"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition">Huỷ</button>
            <button type="submit" disabled={!tagName.trim()} className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition ${tagName.trim() ? "bg-violet-600 hover:bg-violet-700 cursor-pointer" : "bg-violet-400 opacity-50 cursor-not-allowed"}`}>Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Product Tags Component ───────────────────────────────────────────────────
export const ProductTags: React.FC = () => {
  const { data, isLoading, error } = useProductTags();
  const createTag = useCreateTag("product");
  const deleteTag = useDeleteTag("product");
  const tags: ProductTag[] = data?.items ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSave = async (name: string) => {
    await createTag.mutateAsync({ name });
    triggerToast(`Đã tạo tag "${name}"`);
  };

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý Tag sản phẩm</h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Gắn thẻ cho sản phẩm để phân loại — Tag sản phẩm không phân màu.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap">
          + Tạo Tag mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" placeholder="Tìm kiếm tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Tên tag <SortIcon />
              </th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Số sản phẩm <SortIcon />
              </th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Ngày tạo <SortIcon />
              </th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200 cursor-pointer select-none hover:text-lime-500 transition">
                Ngày cập nhật <SortIcon />
              </th>
              <th className="py-3.5 px-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition">
                  <td className="py-4 px-5">
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-900">
                      {tag.name}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-600 dark:text-slate-400">{tag.productCount}</td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">{tag.createdAt}</td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">{tag.updatedAt}</td>
                  <td className="py-4 px-5 text-center">
                    <button onClick={() => { void deleteTag.mutateAsync(Number(tag.id)).then(() => triggerToast(`Đã xóa tag "${tag.name}"`)); }}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center select-none">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                      <svg className="w-7 h-7 text-lime-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.592 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có Tag nào</h4>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center">
                      Tạo Tag để gắn vào sản phẩm và lọc nhanh trong báo cáo, form.
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer">
                      + Tạo Tag mới
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateTagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-[220px] text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
    </ApiState>
  );
};
