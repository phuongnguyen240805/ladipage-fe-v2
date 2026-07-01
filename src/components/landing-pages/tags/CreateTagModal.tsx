import React, { useEffect, useState } from "react";
import { IconX } from "../dung-chung/icons";

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void | Promise<void>;
  mode?: "create" | "edit";
  initialName?: string;
  isSubmitting?: boolean;
}

export const CreateTagModal: React.FC<CreateTagModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialName = "",
  isSubmitting = false,
}) => {
  const [tagName, setTagName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setTagName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim() || isSubmitting) return;
    await onSubmit(tagName.trim());
    if (mode === "create") {
      setTagName("");
    }
    onClose();
  };

  const handleClose = () => {
    setTagName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === "edit" ? "Sửa Tag" : "Tạo Tag mới"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 p-1 cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tên Tag
            </label>
            <input
              type="text"
              placeholder="Ví dụ: oke, hot-sale, tet-2026"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4.5 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};