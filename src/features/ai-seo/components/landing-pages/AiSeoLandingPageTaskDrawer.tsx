import React from "react";
import { X, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { useLandingPageTasksQuery } from "../../hooks/useLandingPageQueries";

interface AiSeoLandingPageTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageUrl: string;
  projectId: string;
  orgId?: string;
}

export function AiSeoLandingPageTaskDrawer({
  isOpen,
  onClose,
  pageId,
  pageUrl,
  projectId,
  orgId = "org-1"
}: AiSeoLandingPageTaskDrawerProps) {
  const { data: tasks, isLoading } = useLandingPageTasksQuery(orgId, projectId, pageId);

  if (!isOpen) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Ưu tiên cao</span>;
      case "medium":
        return <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-350 border border-amber-100 dark:border-amber-900/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Trung bình</span>;
      default:
        return <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Thấp</span>;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "content":
        return "Nội dung";
      case "technical":
        return "Kỹ thuật";
      case "ux":
        return "Trải nghiệm người dùng";
      default:
        return "SEO On-page";
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Slide panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-screen shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col z-10 animate-slideOver">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-lime-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Đề xuất Tối ưu AI SEO</h3>
            </div>
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hover:text-lime-500 dark:hover:text-lime-400 transition underline break-all block mt-1"
            >
              {pageUrl}
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
              <span className="text-xs text-slate-500 dark:text-slate-455 font-bold">Đang tải khuyến nghị từ AI...</span>
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tuyệt vời! Không tìm thấy lỗi SEO nào</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                Landing Page của bạn đã tối ưu hóa rất tốt. Vui lòng chạy lại kiểm tra nếu có sự thay đổi về nội dung.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-805 rounded-xl p-4.5 hover:border-lime-400 dark:hover:border-lime-800 transition duration-150 relative overflow-hidden group shadow-xs"
              >
                {/* Priority & Category */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                    {getCategoryName(task.category)}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {task.title}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1.5">
                  {task.description}
                </p>

                {/* Optimization comparison values */}
                {(task.before_value || task.after_value) && (
                  <div className="mt-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 space-y-2">
                    {task.before_value && (
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                          <strong className="text-slate-700 dark:text-slate-300 font-bold">Hiện tại:</strong> {task.before_value}
                        </span>
                      </div>
                    )}
                    {task.after_value && (
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                          <strong className="text-slate-700 dark:text-slate-300 font-bold">Khuyên dùng:</strong> {task.after_value}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Footer inside card */}
                <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Đồng bộ tự động
                  </span>
                  <button className="flex items-center gap-1.5 bg-lime-500 hover:bg-lime-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition duration-150 shadow-xs cursor-pointer select-none">
                    <Sparkles className="w-3 h-3 text-lime-100" />
                    Tự động sửa lỗi (AI)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default AiSeoLandingPageTaskDrawer;
