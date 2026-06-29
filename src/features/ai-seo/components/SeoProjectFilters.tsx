import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";

interface SeoProjectFiltersProps {
  activeCount: number;
  frozenCount: number;
}

export function SeoProjectFilters({
  activeCount,
  frozenCount,
}: SeoProjectFiltersProps) {
  const {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
  } = useAiSeoDashboardStore();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl self-start">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 select-none cursor-pointer ${
            activeTab === "active"
              ? "bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200"
          }`}
        >
          Hoạt động
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activeTab === "active"
                ? "bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-300"
                : "bg-gray-200 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("deep_frozen")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 select-none cursor-pointer ${
            activeTab === "deep_frozen"
              ? "bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200"
          }`}
        >
          Đóng băng sâu
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activeTab === "deep_frozen"
                ? "bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-300"
                : "bg-gray-200 dark:bg-gray-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {frozenCount}
          </span>
        </button>
      </div>

      {/* Inputs & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Domain */}
        <div className="relative w-64">
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
            <option value="installed">Đã cài đặt</option>
            <option value="not_installed">Chưa cài đặt</option>
            <option value="checking">Đang kiểm tra</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest_score">Điểm cao nhất</option>
            <option value="favorites">Ưu tiên yêu thích</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
export default SeoProjectFilters;
