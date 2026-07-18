import React from "react";
import Link from "next/link";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";
import { useSeoProjectsQuery } from "../../hooks/useSeoProjectQueries";
import { useSeoTasksQuery } from "../../hooks/useSeoTaskQueries";
import { AlertCircle, CheckCircle2, ChevronRight, BarChart3, Database } from "lucide-react";

export function DashboardOverview() {
  const { selectedOrgId, selectedProjectId, selectedSeoProjectId } = useAiSeoUiStore();

  const { data: seoProjects = [] } = useSeoProjectsQuery(selectedOrgId);
  const { data: tasks = [] } = useSeoTasksQuery(selectedOrgId, selectedSeoProjectId);

  const activeSeoProj = seoProjects.find((sp) => sp.id === selectedSeoProjectId);

  // Filter tasks in 'todo' status to show as recommendations
  const activeRecommendations = tasks.filter(t => t.status === "todo").slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Domain Connection Status */}
      <div className="lg:col-span-2 bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            Kết nối Tên miền (Domain Integration)
          </h3>

          {activeSeoProj ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Tên miền theo dõi
                </span>
                <p className="text-lg font-black text-gray-850 dark:text-white mt-0.5">
                  {activeSeoProj.domain}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* GSC */}
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeSeoProj.gscConnected ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20" : "bg-amber-50 text-amber-500 dark:bg-amber-950/20"
                  }`}>
                    {activeSeoProj.gscConnected ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Google Search Console
                    </p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">
                      {activeSeoProj.gscConnected ? "Đã kết nối" : "Chưa kết nối"}
                    </p>
                  </div>
                </div>

                {/* GBP / Analytics connectivity */}
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeSeoProj.gbpConnected ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20" : "bg-amber-50 text-amber-500 dark:bg-amber-950/20"
                  }`}>
                    {activeSeoProj.gbpConnected ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Google Business Profile
                    </p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">
                      {activeSeoProj.gbpConnected ? "Đã kết nối" : "Chưa kết nối"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 dark:text-gray-600 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-xs font-semibold">Chưa thiết lập cấu hình SEO</p>
              <Link
                href="/ai-seo/projects/create"
                className="text-xs font-bold text-blue-500 hover:text-blue-600 mt-2 flex items-center gap-0.5"
              >
                Cấu hình domain ngay
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {activeSeoProj && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex justify-end">
            <Link
              href={selectedProjectId ? `/ai-seo/projects/${selectedProjectId}/tasks` : "/ai-seo/projects"}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
            >
              Mở Task Board quản lý
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Recommended tasks brief */}
      <div className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            Đề xuất ưu tiên (Priority Tasks)
          </h3>

          {activeRecommendations.length === 0 ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-650">
              <p className="text-xs font-semibold">Không có đề xuất mới</p>
              <p className="text-[10px] mt-1 max-w-[200px] mx-auto">
                Chạy Audit kỹ thuật hoặc kết nối Search Console để nhận các đề xuất tối ưu tự động từ OTTO.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition flex items-start gap-2.5"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    rec.importance === "high"
                      ? "bg-rose-500"
                      : rec.importance === "medium"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate">
                      {rec.title}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {rec.importance.toUpperCase()} Importance
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex justify-end">
            <Link
              href={selectedProjectId ? `/ai-seo/projects/${selectedProjectId}/tasks` : "/ai-seo/projects"}
              className="text-xs font-bold text-purple-500 hover:text-purple-650 flex items-center gap-0.5"
            >
              Xem tất cả đề xuất
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
export default DashboardOverview;
