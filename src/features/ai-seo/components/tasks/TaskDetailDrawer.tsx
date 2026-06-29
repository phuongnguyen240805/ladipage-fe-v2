import React from "react";
import { SeoTask } from "../../types";
import { X, Play, Check, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface TaskDetailDrawerProps {
  task: SeoTask | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeploy: (id: string) => void;
}

export function TaskDetailDrawer({ task, onClose, onApprove, onReject, onDeploy }: TaskDetailDrawerProps) {
  if (!task) return null;

  const importanceLabels = {
    high: "Ưu tiên cao",
    medium: "Trung bình",
    low: "Thấp"
  };

  return (
    <div className="fixed inset-0 z-9999 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Sliding Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-[#1a1a26] shadow-2xl flex flex-col justify-between border-l border-gray-250 dark:border-gray-800 transition">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-gray-850 dark:text-white text-sm">
              Đề xuất tối ưu hóa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
              task.importance === "high"
                ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                : task.importance === "medium"
                ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                : "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
            }`}>
              {importanceLabels[task.importance]}
            </span>
            <h4 className="text-base font-extrabold text-gray-800 dark:text-white leading-snug">
              {task.title}
            </h4>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Chi tiết đề xuất
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl">
              {task.description || "Không có chi tiết mô tả thêm cho đề xuất này."}
            </p>
          </div>

          {/* Impact Check */}
          <div className="p-4 rounded-2xl border border-indigo-100/35 bg-indigo-50/20 dark:bg-indigo-950/10 dark:border-indigo-900/10 flex gap-3 text-xs text-indigo-700 dark:text-indigo-400">
            <HelpCircle className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-bold">Đánh giá tác động SEO</p>
              <p className="mt-1 opacity-90 leading-relaxed">
                Tối ưu hóa yếu tố này sẽ trực tiếp cải thiện chỉ số thu thập thông tin và giúp cấu trúc tài liệu của website đạt tiêu chuẩn cao hơn trên Google bot.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col gap-2.5">
          {task.status !== "completed" && (
            <button
              onClick={() => {
                onDeploy(task.id);
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Tự động sửa lỗi & Triển khai
            </button>
          )}

          {task.status === "todo" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onApprove(task.id);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5 text-green-500" />
                Phê duyệt
              </button>
              <button
                onClick={() => {
                  onReject(task.id);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition text-xs font-bold"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TaskDetailDrawer;
