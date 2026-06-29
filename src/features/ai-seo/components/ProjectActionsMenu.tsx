import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical, Settings, Trash2, ListTodo, Loader2 } from "lucide-react";
import { useAiSeoProjectMutations } from "../hooks/useAiSeoProjectMutations";

interface ProjectActionsMenuProps {
  projectId: string;
  readyForProcessing: boolean;
  pixelTagState: "not_installed" | "checking" | "installed" | "failed";
}

export function ProjectActionsMenu({
  projectId,
  readyForProcessing,
  pixelTagState,
}: ProjectActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const { deleteMutation } = useAiSeoProjectMutations();
  const isInstallationIncomplete = pixelTagState !== "installed";

  const handleWipe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(projectId);
      setShowConfirmWipe(false);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
      >
        <MoreVertical className="w-4.5 h-4.5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay to catch clicks and close menu */}
          <div
            className="fixed inset-0 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          ></div>

          <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left">
            {/* Go to Tasks link */}
            {readyForProcessing ? (
              <Link
                href={`/ai-seo/projects/${projectId}/tasks`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <ListTodo className="w-4 h-4 text-slate-400" />
                Xem đề xuất tối ưu
              </Link>
            ) : (
              <button
                disabled
                className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-xs text-slate-450 cursor-not-allowed bg-slate-50/50"
                title="Hệ thống đang thu thập dữ liệu sitemap. Vui lòng đợi vài phút."
              >
                <ListTodo className="w-4 h-4 text-slate-350 mt-0.5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-455">Xem đề xuất tối ưu</span>
                  <span className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                    Đang xử lý trang web...
                  </span>
                </div>
              </button>
            )}

            {/* Setup script link */}
            {isInstallationIncomplete && (
              <Link
                href={`/ai-seo/projects/${projectId}/installation`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Cài đặt mã nhúng
              </Link>
            )}

            <div className="h-px bg-slate-100 my-1"></div>

            {/* Wipe Project Action */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirmWipe(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50/50 transition font-bold"
            >
              <Trash2 className="w-4 h-4 text-rose-450" />
              Xóa dự án
            </button>
          </div>
        </>
      )}

      {/* Wipe Confirmation Dialog */}
      {showConfirmWipe && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col gap-4 text-left">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Trash2 className="w-4.5 h-4.5 text-rose-550 shrink-0" />
              Xóa dự án SEO?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Cảnh báo: Hành động này không thể hoàn tác. Toàn bộ đề xuất, điểm số crawl và cấu hình liên kết sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-2 border-t border-slate-100 pt-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmWipe(false);
                }}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                disabled={deleteMutation.isPending}
              >
                Hủy
              </button>
              <button
                onClick={handleWipe}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-75"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProjectActionsMenu;
