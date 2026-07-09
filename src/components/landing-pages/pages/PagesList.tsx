import React, { useState } from "react";
import { LandingPageItem } from "../dung-chung/types";

function resolvePublicPageUrl(item: LandingPageItem): string {
  const slug =
    item.slug ||
    item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";
  return `${origin}/p/${slug}`;
}

function handleViewPublishedPage(item: LandingPageItem, onCloseMenu: () => void) {
  onCloseMenu();
  if (item.status !== "PUBLISHED") {
    alert(
      "Trang chưa xuất bản, người khác chưa xem được.\nHãy mở trình chỉnh sửa và bấm 'Xem và xuất bản' trước.",
    );
    return;
  }
  window.open(resolvePublicPageUrl(item), "_blank", "noopener,noreferrer");
}

interface PagesListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filteredPages: LandingPageItem[];
  selectedIds: string[];
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRow: (id: string, checked: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  onEdit?: (page: LandingPageItem) => void;
  onDelete?: (page: LandingPageItem) => void;
  onDeleteSelected?: (ids: string[]) => void;
}

export const PagesList: React.FC<PagesListProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredPages,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
  setIsCreateModalOpen,
  onEdit,
  onDelete,
  onDeleteSelected,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      {/* Header Title with Subtitle & Blue Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Landing Pages
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý danh sách Landing Page của bạn dễ dàng hơn với việc gắn Tag, theo dõi hiệu suất của Landing Page.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} landing page đã chọn?`)) {
                  onDeleteSelected?.(selectedIds);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-650 hover:bg-red-700 rounded-lg shadow-sm transition duration-150 cursor-pointer"
            >
              <span>Xóa đã chọn ({selectedIds.length})</span>
            </button>
          )}

          <div className="relative">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
            >
              <span>+ Tạo Landing Page</span>
            </button>
            {/* AI badge floating at top right */}
            <span className="absolute -top-2.5 -right-1.5 px-1.5 py-0.5 text-[8px] font-bold text-white bg-linear-to-r from-pink-500 to-violet-600 rounded-md shadow-xs animate-bounce select-none">
              AI ✦
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar (Search, member dropdown, status dropdown) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-5">
        {/* Main search box */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm Landing Page"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Member Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <select className="w-full md:w-48 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
              <option>Tất cả thành viên</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          {/* Status Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="UNPUBLISHED">Chưa xuất bản</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Bảng Danh sách Landing Pages */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex-1 flex flex-col justify-between min-h-[300px]">
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3 px-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredPages.length > 0 && selectedIds.length === filteredPages.length}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" 
                  />
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Landing Page
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Truy cập</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Chuyển đổi</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Doanh thu</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredPages.length > 0 ? (
                filteredPages.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10 ${
                        isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit?.(item)}
                              className="text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-lime-500 transition cursor-pointer"
                            >
                              {item.name}
                            </button>
                            {item.status === "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={() => handleViewPublishedPage(item, () => {})}
                                title="Mở trang đã xuất bản"
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                                Live
                              </button>
                            )}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border text-lime-600 dark:text-lime-300 bg-lime-50 dark:bg-lime-950/30 border-lime-100/40 dark:border-lime-800/50"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {item.status === "PUBLISHED" ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-black text-success-700 bg-success-100 dark:text-success-300 dark:bg-success-950/40 rounded-md tracking-wider">
                              ĐÃ XUẤT BẢN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-700 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800 rounded-md uppercase tracking-wider">
                              Chưa xuất bản
                            </span>
                          )}
                          {/* Device & Timestamp */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            <span>{item.updatedAt}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.views}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.conversions}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.revenue.toLocaleString()}đ
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit button — opens visual editor */}
                          <button
                            onClick={() => onEdit?.(item)}
                            title="Mở trình chỉnh sửa"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-lime-500 dark:text-lime-300 bg-lime-50 dark:bg-lime-950/30 rounded-lg hover:bg-lime-50 dark:hover:bg-lime-900/40 transition cursor-pointer border border-lime-100/50 dark:border-lime-800/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Chỉnh sửa
                          </button>
                          {/* More options */}
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                              className="text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                              </svg>
                            </button>
                            {openMenuId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 z-20 py-1">
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onEdit?.(item);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                                  >
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => handleViewPublishedPage(item, () => setOpenMenuId(null))}
                                    className={`w-full text-left px-4 py-2 text-xs transition ${
                                      item.status === "PUBLISHED"
                                        ? "text-emerald-700 dark:text-emerald-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                                        : "text-slate-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-750"
                                    }`}
                                  >
                                    Xem xuất bản
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      if (confirm(`Bạn có chắc chắn muốn xóa landing page "${item.name}"?`)) {
                                        onDelete?.(item);
                                      }
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs text-red-650 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                                  >
                                    Xóa trang
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    Chưa có Landing Page nào khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          {/* Show entries select */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
            <span className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
              Hiển thị 1-{filteredPages.length} trên {filteredPages.length}
            </span>
          </div>

          {/* Pages Navigation */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Page Number 1 */}
            <button className="flex items-center justify-center w-7 h-7 rounded-md bg-lime-500 text-white font-semibold text-xs shadow-xs cursor-pointer">
              1
            </button>

            {/* Next */}
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
