import React, { useState } from "react";
import { LandingCommerceSummaryBadges } from "@/features/commerce/components/LandingPurposeBadge";
import { useLandingCommerceVersion } from "@/features/commerce/hooks/useLandingCommerceProfile";
import { landingCommerceBindingsStore } from "@/features/commerce/mock/landing-commerce-bindings-store";
import { resolveLandingPublicViewUrl } from "@/features/landing-domain-edge/services/free-subdomain.service";
import { LandingPageLabModal } from "./LandingPageLabModal";
import { LandingPageItem } from "../dung-chung/types";
import { ladiToast, ladiConfirm } from "@/lib/ladi-feedback";

function resolvePublicPageUrl(item: LandingPageItem): string {
  // Always prefer stored publicUrl from API (already absolute, Plan A/B aware)
  if (item.publishedUrl && /^https?:\/\//i.test(item.publishedUrl)) {
    return item.publishedUrl;
  }
  const slug =
    item.slug ||
    item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";
  return resolveLandingPublicViewUrl(slug, {
    storedPublicUrl: item.publishedUrl,
    origin,
  });
}

function handleViewPublishedPage(item: LandingPageItem, onCloseMenu: () => void) {
  onCloseMenu();
  if (item.status !== "PUBLISHED") {
    ladiToast.warning({
      message: "Trang chưa xuất bản",
      description: "Hãy mở trình chỉnh sửa và bấm 'Xem và xuất bản' trước khi chia sẻ.",
    });
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
  isLoading?: boolean;
  selectedIds: string[];
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRow: (id: string, checked: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  onEdit?: (page: LandingPageItem) => void;
  onDelete?: (page: LandingPageItem) => void;
  onDeleteSelected?: (ids: string[]) => void;
  /** Mở modal gắn SP online (commerce mock UI). */
  onBindCommerce?: (page: LandingPageItem) => void;
  purposeFilter?: string;
  setPurposeFilter?: (filter: string) => void;
}

export const PagesList: React.FC<PagesListProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredPages,
  isLoading = false,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
  setIsCreateModalOpen,
  onEdit,
  onDelete,
  onDeleteSelected,
  onBindCommerce,
  purposeFilter = "ALL",
  setPurposeFilter,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [labModalItem, setLabModalItem] = useState<LandingPageItem | null>(null);
  // Re-render badges when bindings change
  useLandingCommerceVersion();

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
              onClick={async () => {
                const ok = await ladiConfirm({
                  title: "Xóa landing page đã chọn?",
                  description: `Bạn có chắc chắn muốn xóa ${selectedIds.length} landing page đã chọn? Hành động này không thể hoàn tác.`,
                  confirmLabel: "Xóa",
                  destructive: true,
                });
                if (ok) onDeleteSelected?.(selectedIds);
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

          {/* Purpose filter (commerce UI mock) */}
          {setPurposeFilter && (
            <div className="relative flex-1 md:flex-none">
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="w-full md:w-48 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
              >
                <option value="ALL">Mọi mục đích</option>
                <option value="lead">Lead</option>
                <option value="sales">Bán hàng</option>
                <option value="hybrid_lead_sales">Lead + Bán</option>
                <option value="content">Nội dung</option>
                <option value="HAS_PRODUCT">Đã gắn SP online</option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
          )}
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`landing-page-skeleton-${index}`} className="animate-pulse">
                    <td className="py-4 px-4"><div className="mx-auto h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-2 h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/70" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-10 rounded bg-slate-100 dark:bg-slate-800/70" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-10 rounded bg-slate-100 dark:bg-slate-800/70" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800/70" /></td>
                    <td className="py-4 px-4"><div className="ml-auto h-7 w-7 rounded bg-slate-100 dark:bg-slate-800/70" /></td>
                  </tr>
                ))
              ) : filteredPages.length > 0 ? (
                filteredPages.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const commerceProfile = landingCommerceBindingsStore.getProfile(
                    item.id,
                    item.name,
                  );
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
                              className="text-left text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-lime-600 dark:hover:text-lime-400 transition cursor-pointer"
                            >
                              {item.name}
                            </button>
                            <LandingCommerceSummaryBadges profile={commerceProfile} />
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
                            <span className="px-2.5 py-0.5 text-[10px] font-black text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40 rounded-md tracking-wider">
                              ĐÃ XUẤT BẢN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-gray-800 rounded-md uppercase tracking-wider">
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
                        <div className="flex items-center justify-end gap-2">
                          {/* More options */}
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                              className="text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                              </svg>
                            </button>
                            {openMenuId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-52 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 z-20 py-1.5 animate-fadeIn">
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setLabModalItem(item);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/40 transition flex items-center gap-2.5"
                                  >
                                    <svg className="w-4 h-4 text-lime-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Phân tích hiệu suất
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onBindCommerce?.(item);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition flex items-center gap-2.5"
                                  >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349" />
                                    </svg>
                                    Gắn sản phẩm online
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onEdit?.(item);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition flex items-center gap-2.5"
                                  >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                    Chỉnh sửa
                                  </button>

                                  <button
                                    onClick={() => handleViewPublishedPage(item, () => setOpenMenuId(null))}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition flex items-center gap-2.5 ${
                                      item.status === "PUBLISHED"
                                        ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        : "text-slate-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-750"
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    Xem xuất bản
                                  </button>

                                  <div className="border-t border-gray-100 dark:border-gray-700/60 my-1" />

                                  <button
                                    onClick={async () => {
                                      setOpenMenuId(null);
                                      if (
                                        await ladiConfirm({
                                          title: "Xóa Landing Page",
                                          description: `Bạn có chắc chắn muốn xóa landing page "${item.name}"? Hành động này không thể hoàn tác.`,
                                          confirmLabel: "Xóa trang",
                                          destructive: true,
                                        })
                                      ) {
                                        onDelete?.(item);
                                      }
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-2.5"
                                  >
                                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
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

      {labModalItem && (
        <LandingPageLabModal
          isOpen={!!labModalItem}
          onClose={() => setLabModalItem(null)}
          websitePageId={labModalItem.id}
          pageName={labModalItem.name}
          targetUrl={resolvePublicPageUrl(labModalItem)}
          published={labModalItem.status === "PUBLISHED"}
        />
      )}
    </div>
  );
};
