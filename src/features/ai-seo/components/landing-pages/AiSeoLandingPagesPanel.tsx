import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";
import { useConnectedLandingPagesQuery } from "../../hooks/useLandingPageQueries";
import AiSeoLandingPageScoreCards from "./AiSeoLandingPageScoreCards";
import AiSeoLandingPageTable from "./AiSeoLandingPageTable";
import ConnectLandingPageModal from "./ConnectLandingPageModal";
import AiSeoLandingPageTaskDrawer from "./AiSeoLandingPageTaskDrawer";

interface AiSeoLandingPagesPanelProps {
  projectId: string;
  orgId?: string;
}

export function AiSeoLandingPagesPanel({
  projectId,
  orgId = "org-1"
}: AiSeoLandingPagesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedTaskPage, setSelectedTaskPage] = useState<{ id: string; url: string } | null>(null);

  const { data: pages, isLoading } = useConnectedLandingPagesQuery(orgId, projectId);

  const filteredPages = pages?.filter(p =>
    p.pageUrl.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/ai-seo"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Dashboard AI SEO
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Quản lý Landing Pages
            </h1>
            <span className="bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/30 text-lime-700 dark:text-lime-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Tích hợp Website Builder
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Liên kết các trang con hoặc Landing Page từ Website Builder để đo lường, kiểm toán và chấm điểm tối ưu hóa SEO.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsConnectOpen(true)}
          className="sm:self-end bg-lime-500 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-lime-600 transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          Kết nối Landing Page
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-lime-500" />
          <span className="text-xs text-slate-500 dark:text-slate-450 font-bold">Đang tải danh sách trang liên kết...</span>
        </div>
      ) : (
        <>
          {/* Summary Score Cards */}
          <AiSeoLandingPageScoreCards pages={pages || []} />

          {/* Table list section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-6 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-850 dark:text-gray-150 placeholder:text-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition"
                />
              </div>
            </div>

            {/* Pages Table */}
            <AiSeoLandingPageTable
              pages={filteredPages}
              projectId={projectId}
              orgId={orgId}
              onViewTasks={(id, url) => setSelectedTaskPage({ id, url })}
            />
          </div>
        </>
      )}

      {/* Modals & Slide Drawers */}
      <ConnectLandingPageModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        projectId={projectId}
        orgId={orgId}
      />

      {selectedTaskPage && (
        <AiSeoLandingPageTaskDrawer
          isOpen={true}
          onClose={() => setSelectedTaskPage(null)}
          pageId={selectedTaskPage.id}
          pageUrl={selectedTaskPage.url}
          projectId={projectId}
          orgId={orgId}
        />
      )}
    </div>
  );
}
export default AiSeoLandingPagesPanel;
