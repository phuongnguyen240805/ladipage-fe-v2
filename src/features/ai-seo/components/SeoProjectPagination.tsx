import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";

interface SeoProjectPaginationProps {
  totalItems: number;
}

export function SeoProjectPagination({ totalItems }: SeoProjectPaginationProps) {
  const { page, pageSize, setPage, setPageSize } = useAiSeoDashboardStore();

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page > 1) setPage(page - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-6">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer font-bold text-slate-700"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>dự án mỗi trang</span>
      </div>

      {/* Pages Navigation */}
      <div className="flex items-center gap-2.5 self-end sm:self-center">
        <span className="text-xs font-bold text-slate-500">
          Trang {page} / {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default SeoProjectPagination;
