"use client";

import React, { useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import {
  useCreateCustomField,
  useDeleteCustomField,
  useProductCustomFields,
} from "@/features/ecom/hooks/useCustomFields";

// ─── Types ────────────────────────────────────────────────────────────────────
type DataType = "Dòng văn bản" | "Đoạn văn bản" | "Số" | "Ngày/Giờ" | "True/False" | "Danh sách";

type CustomField = {
  id: string;
  displayName: string;
  fieldName: string;
  dataType: DataType;
  updatedAt: string;
};

// ─── Slugify helper ───────────────────────────────────────────────────────────
const toFieldName = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "vi_du_ten_truong";

// ─── Create Field Modal ───────────────────────────────────────────────────────
interface CreateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (displayName: string, fieldName: string, dataType: DataType) => void;
}

const DATA_TYPES: DataType[] = ["Dòng văn bản", "Đoạn văn bản", "Số", "Ngày/Giờ", "True/False", "Danh sách"];

const CreateFieldModal: React.FC<CreateFieldModalProps> = ({ isOpen, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState("");
  const [fieldName, setFieldName] = useState("vi_du_ten_truong");
  const [fieldNameEdited, setFieldNameEdited] = useState(false);
  const [dataType, setDataType] = useState<DataType>("Dòng văn bản");

  if (!isOpen) return null;

  const handleDisplayChange = (v: string) => {
    setDisplayName(v);
    if (!fieldNameEdited) setFieldName(toFieldName(v) || "vi_du_ten_truong");
  };

  const handleFieldNameChange = (v: string) => {
    setFieldNameEdited(true);
    setFieldName(v.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  const handleClose = () => {
    setDisplayName(""); setFieldName("vi_du_ten_truong"); setFieldNameEdited(false); setDataType("Dòng văn bản");
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    onSave(displayName.trim(), fieldName || toFieldName(displayName), dataType);
    setDisplayName(""); setFieldName("vi_du_ten_truong"); setFieldNameEdited(false); setDataType("Dòng văn bản");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo trường mới</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          {/* Display name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Thương hiệu, Chất liệu"
              value={displayName}
              onChange={(e) => handleDisplayChange(e.target.value)}
              autoFocus
              required
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-lime-400 dark:border-lime-500 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-200 font-medium"
            />
          </div>

          {/* Field name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên trường <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-lime-400 font-medium font-mono"
            />
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Dùng để lưu trữ — chỉ chữ thường, số và dấu gạch dưới.
            </p>
          </div>

          {/* Data type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kiểu dữ liệu</label>
            <div className="relative">
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as DataType)}
                className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2.5 pr-8 text-xs font-medium text-slate-600 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer"
              >
                {DATA_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition">Huỷ</button>
            <button type="submit" disabled={!displayName.trim()} className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition ${displayName.trim() ? "bg-violet-600 hover:bg-violet-700 cursor-pointer" : "bg-violet-400 opacity-50 cursor-not-allowed"}`}>Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Product Custom Fields Component ─────────────────────────────────────────
export const ProductCustomFields: React.FC = () => {
  const { data, isLoading, error } = useProductCustomFields();
  const createField = useCreateCustomField("product");
  const deleteField = useDeleteCustomField("product");
  const fields: CustomField[] = data?.items ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };

  const handleSave = async (
    displayName: string,
    fieldName: string,
    dataType: DataType
  ) => {
    await createField.mutateAsync({ displayName, fieldName, dataType });
    triggerToast(`Đã tạo trường "${displayName}"`);
  };

  const filtered = fields.filter((f) =>
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeStyle = (type: DataType) => {
    const map: Record<DataType, string> = {
      "Dòng văn bản":  "text-lime-700 bg-lime-100 dark:text-lime-300 dark:bg-lime-950/40",
      "Đoạn văn bản":  "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/40",
      "Số":            "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-950/40",
      "Ngày/Giờ":      "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/40",
      "True/False":    "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/40",
      "Danh sách":     "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40",
    };
    return map[type];
  };

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Trường tuỳ chỉnh sản phẩm</h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Thêm trường dữ liệu tuỳ chỉnh cho sản phẩm (thương hiệu, chất liệu, bộ sưu tập...).
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap">
          + Tạo trường mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" placeholder="Tìm theo tên hiển thị hoặc tên trường" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Tên hiển thị</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Tên trường</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Loại dữ liệu</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Ngày cập nhật</th>
              <th className="py-3.5 px-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition">
                  <td className="py-4 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300">{f.displayName}</td>
                  <td className="py-4 px-5">
                    <code className="text-[11px] font-mono font-bold text-lime-500 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30 px-2 py-0.5 rounded">{f.fieldName}</code>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${getTypeStyle(f.dataType)}`}>{f.dataType}</span>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">{f.updatedAt}</td>
                  <td className="py-4 px-5 text-center">
                    <button onClick={() => { void deleteField.mutateAsync(Number(f.id)).then(() => triggerToast(`Đã xóa trường "${f.displayName}"`)); }}
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có trường tuỳ chỉnh nào</h4>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
                      Tạo trường đầu tiên để thu thập thêm thông tin cho sản phẩm.
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer">
                      + Tạo trường mới
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateFieldModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 rounded-xl shadow-xl px-4 py-3 min-w-[220px] text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
    </ApiState>
  );
};
