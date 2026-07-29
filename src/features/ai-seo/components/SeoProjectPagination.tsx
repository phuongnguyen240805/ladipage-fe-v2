import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";

interface SeoProjectPaginationProps {
  totalItems: number;
}

export function SeoProjectPagination({ totalItems }: SeoProjectPaginationProps) {
  const { page, setPage } = useAiSeoDashboardStore();
  const pageSize = 10

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
    <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {totalItems} project · 10 project mỗi trang
      </span>
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-slate-500">
          Trang {page} / {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            aria-label="Trang trước"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            aria-label="Trang sau"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default SeoProjectPagination;
