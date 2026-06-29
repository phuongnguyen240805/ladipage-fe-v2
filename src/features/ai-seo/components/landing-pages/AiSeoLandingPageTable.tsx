import React from "react";
import { Link2, Trash2, Play, Eye, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { AiSeoProjectPage } from "../../types";
import { useUnlinkLandingPageMutation, useScanLandingPageMutation } from "../../hooks/useLandingPageQueries";

interface AiSeoLandingPageTableProps {
  pages: AiSeoProjectPage[];
  projectId: string;
  orgId?: string;
  onViewTasks: (pageId: string, pageUrl: string) => void;
}

export function AiSeoLandingPageTable({
  pages,
  projectId,
  orgId = "org-1",
  onViewTasks
}: AiSeoLandingPageTableProps) {
  const unlinkMutation = useUnlinkLandingPageMutation(orgId, projectId);
  const scanMutation = useScanLandingPageMutation(orgId, projectId);

  const getScoreBadge = (score: number) => {
    if (score === 0) return <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold">—</span>;
    let color = "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-350 border-rose-100 dark:border-rose-900/30";
    if (score >= 80) color = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-350 border-emerald-100 dark:border-emerald-900/30";
    else if (score >= 50) color = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-350 border-amber-100 dark:border-amber-900/30";

    return (
      <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md ${color}`}>
        {score}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scanning":
        return (
          <span className="flex items-center justify-center gap-1 mx-auto bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse max-w-fit">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Đang quét...
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center justify-center gap-1 mx-auto bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider max-w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn tất
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center justify-center gap-1 mx-auto bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider max-w-fit">
            <AlertCircle className="w-3 h-3" />
            Thất bại
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center gap-1 mx-auto bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider max-w-fit">
            Chưa quét
          </span>
        );
    }
  };

  const handleScan = async (pageId: string) => {
    try {
      await scanMutation.mutateAsync(pageId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlink = async (pageId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy kết nối Landing Page này khỏi dự án SEO?")) {
      try {
        await unlinkMutation.mutateAsync(pageId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Trang Landing Page</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Nguồn</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Trạng thái</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Điểm AI</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Nội dung</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Kỹ thuật</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">UX</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Uy tín</th>
            <th className="py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {pages.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-10 text-center text-xs text-slate-400 dark:text-slate-650 font-medium">
                Chưa có Landing Page nào được kết nối với dự án SEO này.
              </td>
            </tr>
          ) : (
            pages.map((page) => (
              <tr key={page.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                <td className="py-3.5 px-4">
                  <div className="flex flex-col max-w-sm">
                    <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight block truncate">
                      {page.websitePageId ? "Trang Builder Landing Page" : "Trang con bên ngoài"}
                    </span>
                    <a
                      href={page.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hover:text-lime-500 dark:hover:text-lime-400 transition flex items-center gap-1 mt-0.5 truncate"
                    >
                      <Link2 className="w-3.5 h-3.5 shrink-0" />
                      {page.pageUrl}
                    </a>
                  </div>
                </td>
                <td className="py-3.5 text-center">
                  {page.source === "internal" ? (
                    <span className="bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300 border border-lime-200 dark:border-lime-900/30 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                      Builder
                    </span>
                  ) : (
                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                      Ngoài
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-center">
                  {getStatusBadge(page.scanStatus)}
                </td>
                <td className="py-3.5 text-center">{getScoreBadge(page.graderScore)}</td>
                <td className="py-3.5 text-center">{getScoreBadge(page.contentScore)}</td>
                <td className="py-3.5 text-center">{getScoreBadge(page.technicalScore)}</td>
                <td className="py-3.5 text-center">{getScoreBadge(page.uxScore)}</td>
                <td className="py-3.5 text-center">{getScoreBadge(page.authorityScore)}</td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View tasks */}
                    {page.scanStatus === "completed" && (
                      <button
                        onClick={() => onViewTasks(page.id, page.pageUrl)}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                        title="Xem đề xuất tối ưu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Trigger audit */}
                    <button
                      onClick={() => handleScan(page.id)}
                      disabled={page.scanStatus === "scanning"}
                      className="text-slate-500 hover:text-lime-600 dark:text-slate-400 dark:hover:text-lime-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition disabled:opacity-30 cursor-pointer"
                      title="Kiểm toán SEO"
                    >
                      <Play className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                    </button>

                    {/* Unlink */}
                    <button
                      onClick={() => handleUnlink(page.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition cursor-pointer"
                      title="Hủy kết nối"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export default AiSeoLandingPageTable;
