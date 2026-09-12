import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/select/Select";
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
    <div className="space-y-4">
      {/* Header Title with Subtitle & Blue Button */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Landing Pages
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Quản lý danh sách Landing Page của bạn dễ dàng hơn với việc gắn Tag, theo dõi hiệu suất của Landing Page.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-600 bg-red-600 px-3.5 text-sm font-semibold text-white shadow-xs outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-red-700 hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-500/15 active:scale-[0.98]"
            >
              <span>Xóa đã chọn ({selectedIds.length})</span>
            </button>
          )}

          <div className="relative inline-flex items-center overflow-visible">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="ladi-create-page-cta inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-lime-600 bg-lime-600 px-3.5 text-sm font-semibold text-white shadow-xs outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-lime-700 hover:bg-lime-700 focus-visible:ring-3 focus-visible:ring-lime-500/15 active:scale-[0.98] dark:border-lime-500 dark:bg-lime-500 dark:text-lime-950"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path d="M10 4.25v11.5M4.25 10h11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Tạo Landing Page</span>
            </button>
            <span
              aria-hidden="true"
              className="ladi-ai-spark-badge pointer-events-none absolute right-7 top-[-9px] inline-flex h-[18px] min-w-[38px] -translate-y-1/2 items-center justify-center gap-0.5 rounded-full px-1.5 text-[8.5px] font-extrabold leading-none tracking-[0.06em] text-white select-none"
            >
              <span>AI</span>
              <span className="ladi-ai-spark-icon">✦</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar (Search, member dropdown, status dropdown) */}
      <div className="ladi-surface flex flex-col items-stretch justify-between gap-2.5 p-2.5 md:flex-row md:items-center">
        {/* Main search box */}
        <div className="relative w-full md:max-w-[420px]">
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
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-lime-500 focus:ring-3 focus:ring-lime-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-lime-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
          {/* Member Dropdown */}
          <CustomSelect
            value="ALL"
            options={[{ value: "ALL", label: "Tất cả thành viên" }]}
            className="flex-1 md:flex-none md:w-44"
          />

          {/* Status Dropdown */}
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "Tất cả trạng thái" },
              { value: "PUBLISHED", label: "Đã xuất bản" },
              { value: "UNPUBLISHED", label: "Chưa xuất bản" },
            ]}
            className="flex-1 md:flex-none md:w-44"
          />

          {/* Purpose filter (commerce UI mock) */}
          {setPurposeFilter && (
            <CustomSelect
              value={purposeFilter}
              onChange={setPurposeFilter}
              options={[
                { value: "ALL", label: "Mọi mục đích" },
                { value: "lead", label: "Lead" },
                { value: "sales", label: "Bán hàng" },
                { value: "hybrid_lead_sales", label: "Lead + Bán" },
                { value: "content", label: "Nội dung" },
                { value: "HAS_PRODUCT", label: "Đã gắn SP online" },
              ]}
              className="flex-1 md:flex-none md:w-44"
            />
          )}
        </div>
      </div>

      {/* Bảng Danh sách Landing Pages */}
      <div className="ladi-surface min-h-[300px] flex-1 overflow-hidden flex flex-col justify-between">

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredPages.length > 0 && selectedIds.length === filteredPages.length}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Landing Page
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Trạng thái
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Truy cập</span>
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Chuyển đổi</span>
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Doanh thu</span>
                </th>
                <th className="w-16 px-4 py-2.5 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`landing-page-skeleton-${index}`} >
                    <td className="py-4 px-4"><div className="ladi-skeleton mx-auto h-4 w-4" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton h-4 w-48" /><div className="ladi-skeleton mt-2 h-3 w-24" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton h-5 w-24" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton h-4 w-10" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton h-4 w-10" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton h-4 w-16" /></td>
                    <td className="py-4 px-4"><div className="ladi-skeleton ml-auto h-7 w-7" /></td>
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
                      className={`ladi-data-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/25 ${
                        isSelected ? "bg-lime-50/55 dark:bg-lime-500/5" : ""
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
                              className="text-left text-sm font-semibold text-slate-900 outline-none transition-colors duration-100 hover:text-lime-700 focus-visible:text-lime-700 dark:text-slate-100 dark:hover:text-lime-400"
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
                                  className="inline-flex h-5 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-ui-caption font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
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
                            <span className="ladi-status-badge ladi-status-badge--published inline-flex items-center rounded-md px-2 py-0.5 text-ui-caption leading-4 font-semibold tracking-normal normal-case whitespace-nowrap">
                              Đã xuất bản
                            </span>
                          ) : (
                            <span className="ladi-status-badge ladi-status-badge--draft inline-flex items-center rounded-md px-2 py-0.5 text-ui-caption leading-4 font-semibold tracking-normal normal-case whitespace-nowrap">
                              Chưa xuất bản
                            </span>
                          )}
                          {/* Device & Timestamp */}
                          <div className="flex items-center gap-1.5 text-ui-caption text-slate-400 dark:text-slate-500 mt-0.5">
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
                              type="button"
                              aria-label={`Mở thao tác cho ${item.name}`}
                              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none transition-[background-color,color] duration-100 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-3 focus-visible:ring-lime-500/15 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                              </svg>
                            </button>
                            {openMenuId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="ladi-popover-enter absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_16px_40px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900">
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/30 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {filteredPages.length} trang
            </span>
            <span>Đang hiển thị toàn bộ kết quả hiện tại</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span>Trang 1</span>
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
