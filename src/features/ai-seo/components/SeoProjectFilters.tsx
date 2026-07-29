import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";

export function SeoProjectFilters() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
  } = useAiSeoDashboardStore();

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Danh sách project</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Theo dõi nhanh sức khỏe SEO và traffic 7 ngày.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Domain */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên miền..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ready">Sẵn sàng</option>
            <option value="not_installed">Chưa cài đặt</option>
            <option value="scanning">Đang quét</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "newest" | "oldest" | "favorites")
            }
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="favorites">Yêu thích</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
export default SeoProjectFilters;
