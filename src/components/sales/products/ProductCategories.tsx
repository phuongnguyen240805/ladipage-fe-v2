"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = {
  id: string;
  name: string;
  imageUrl: string;
  parentId: string | null;
  visible: boolean;
  productCount: number;
  updatedAt: string;
};

// ─── Create Category Modal ────────────────────────────────────────────────────
interface CreateCategoryModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (name: string, imageUrl: string, parentId: string | null, visible: boolean) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, categories, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    setName(""); setImageUrl(""); setParentId(null); setVisible(true);
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), imageUrl.trim(), parentId, visible);
    setName(""); setImageUrl(""); setParentId(null); setVisible(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo danh mục</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          {/* Category name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên danh mục</label>
            <input
              type="text"
              placeholder="Nhập tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-lime-300 dark:border-lime-500 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-100 font-medium"
            />
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh đại diện</label>
            <div className="flex items-stretch gap-3">
              {/* Drop zone */}
              <div className="w-20 h-[72px] border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-lime-300 hover:bg-lime-50/40 dark:hover:bg-lime-950/20 transition select-none text-slate-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zm10.5-11.25h.008v.008h-.008V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                <span className="text-[9px] font-medium text-center leading-tight px-1">Bấm hoặc kéo thả ảnh</span>
              </div>
              {/* URL + upload */}
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="Dán URL ảnh hoặc tải lên từ máy..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
                />
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  Tải ảnh lên
                </button>
              </div>
            </div>
          </div>

          {/* Parent category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Danh mục cha</label>
            <div className="relative">
              <select
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2.5 pr-8 text-xs font-medium text-slate-600 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer"
              >
                <option value="">(Không có)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </span>
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hiển thị danh mục</label>
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors cursor-pointer ${visible ? "bg-lime-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${visible ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition">Huỷ</button>
            <button type="submit" disabled={!name.trim()} className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition ${name.trim() ? "bg-violet-600 hover:bg-violet-700 cursor-pointer" : "bg-violet-400 opacity-50 cursor-not-allowed"}`}>Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Product Categories Component ─────────────────────────────────────────────
export const ProductCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSave = (name: string, imageUrl: string, parentId: string | null, visible: boolean) => {
    const cat: Category = {
      id: String(Date.now()),
      name,
      imageUrl,
      parentId,
      visible,
      productCount: 0,
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setCategories((prev) => [cat, ...prev]);
    triggerToast(`Đã tạo danh mục "${name}"`);
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedIds(e.target.checked ? filtered.map((c) => c.id) : []);
  const handleSelectRow = (id: string, checked: boolean) =>
    checked ? setSelectedIds((p) => [...p, id]) : setSelectedIds((p) => p.filter((i) => i !== id));

  return (
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Sắp xếp sản phẩm theo danh mục để quản lý dễ dàng hơn.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap">
          + Tạo danh mục mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" placeholder="Tìm kiếm danh mục..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-lime-50/60 dark:bg-lime-950/20 border border-lime-50 dark:border-lime-900/40 rounded-xl">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Đã chọn <strong className="text-lime-500">{selectedIds.length}</strong> danh mục</span>
          <button onClick={() => { setCategories((p) => p.filter((c) => !selectedIds.includes(c.id))); setSelectedIds([]); triggerToast("Đã xóa danh mục"); }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition cursor-pointer">Xóa</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
              <th className="py-3.5 px-4 w-12 text-center">
                <input type="checkbox" onChange={handleSelectAll} checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" />
              </th>
              <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Tên danh mục</th>
              <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Số sản phẩm</th>
              <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Hiển thị danh mục</th>
              <th className="py-3.5 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((cat) => {
                const isSelected = selectedIds.includes(cat.id);
                return (
                  <tr key={cat.id} className={`hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition ${isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""}`}>
                    <td className="py-4 px-4 text-center">
                      <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectRow(cat.id, e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"/></svg>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">{cat.productCount}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setCategories((p) => p.map((c) => c.id === cat.id ? { ...c, visible: !c.visible } : c))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${cat.visible ? "bg-lime-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${cat.visible ? "translate-x-4.5" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => { setCategories((p) => p.filter((c) => c.id !== cat.id)); triggerToast(`Đã xóa "${cat.name}"`); }}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center select-none">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                      <svg className="w-7 h-7 text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h7.5m-7.5 4.5h7.5"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 13.5v4.5m0 0v.75m0-.75h-4.5m4.5 0h.75"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {searchQuery ? "Không tìm thấy danh mục nào." : "Chưa có danh mục nào."}
                    </h4>
                    {!searchQuery && (
                      <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer">
                        + Tạo danh mục mới
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateCategoryModal isOpen={isModalOpen} categories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-[220px] text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
