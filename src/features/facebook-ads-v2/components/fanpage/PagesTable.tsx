import React from "react";
import { FanpageItem } from "./types";

interface PagesTableProps {
  isLoading: boolean;
  loadingProgress: number;
  dataLoaded: boolean;
  filteredPages: FanpageItem[];
  selectedIds: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  dataOptions: {
    status: boolean;
    badge: boolean;
    likes: boolean;
    posts: boolean;
    live: boolean;
    monetize: boolean;
  };
  selectedRegion: number;
  openConfig: () => void;
}

export default function PagesTable({
  isLoading,
  loadingProgress,
  dataLoaded,
  filteredPages,
  selectedIds,
  onSelectAll,
  onSelectRow,
  dataOptions,
  selectedRegion,
  openConfig,
}: PagesTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-lime-50 border-t-lime-500" />
        <h3 className="mb-1 text-base font-bold text-gray-800 dark:text-white">Đang quét danh sách Fanpage của bạn...</h3>
        <p className="mb-3 max-w-xs text-xs text-gray-400">Vui lòng chờ trong giây lát...</p>
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-1.5 bg-lime-500 transition-all duration-100" style={{ width: `${loadingProgress}%` }} />
        </div>
        <span className="mt-1 text-[10px] font-bold text-lime-400">{loadingProgress}%</span>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-lime-50 bg-lime-50 text-lime-500 dark:border-lime-900/30 dark:bg-lime-950/20 dark:text-lime-300">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">Chưa có dữ liệu</h2>
        <p className="mb-6 max-w-sm text-sm text-gray-400">
          Hiện chưa có dữ liệu để hiển thị. Thiết lập và nhấn Tải dữ liệu để quét danh sách Fanpage của bạn.
        </p>
        <button
          type="button"
          onClick={openConfig}
          className="flex cursor-pointer select-none items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:scale-[1.02] hover:bg-lime-600 active:scale-[0.98]"
        >
          Tải dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-150 dark:divide-gray-800">
          <thead className="bg-gray-50/70 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
            <tr>
              <th scope="col" className="w-10 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredPages.length && filteredPages.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 cursor-pointer rounded text-lime-500 focus:ring-lime-400"
                />
              </th>
              <th scope="col" className="w-28 px-4 py-3.5 text-center">Trạng thái</th>
              <th scope="col" className="px-5 py-3.5">Tên Page</th>
              {dataOptions.likes && <th scope="col" className="px-4 py-3.5 text-center">Người theo dõi</th>}
              {dataOptions.posts && <th scope="col" className="px-4 py-3.5 text-center">Số bài viết</th>}
              {dataOptions.monetize && <th scope="col" className="px-4 py-3.5 text-center">Kiếm tiền</th>}
              {dataOptions.live && <th scope="col" className="px-5 py-3.5">Tiến trình</th>}
              <th scope="col" className="w-12 px-4 py-3.5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-xs text-gray-700 dark:divide-gray-800 dark:text-gray-300">
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  Không tìm thấy Fanpage nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => {
                const isSelected = selectedIds.includes(page.id);
                return (
                  <tr
                    key={page.id}
                    className={`transition-all hover:bg-gray-50/50 dark:hover:bg-gray-900/20 ${
                      isSelected ? "bg-lime-50/30 dark:bg-lime-950/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => onSelectRow(page.id, event.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded text-lime-500 focus:ring-lime-400"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {page.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-150 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Hoạt động
                        </span>
                      ) : page.status === "DISABLED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-150 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Hạn chế quảng cáo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-150 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Xem xét
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col text-left">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                          {page.name}
                          {page.verification === "BLUE" ? (
                            <span className="rounded border border-lime-100 bg-lime-50 px-1 text-[9px] font-extrabold text-lime-600 dark:border-lime-900/30 dark:bg-lime-950/40 dark:text-lime-300">Tích xanh</span>
                          ) : page.verification === "GRAY" ? (
                            <span className="rounded border border-gray-150 bg-gray-50 px-1 text-[9px] font-extrabold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">Tích xám</span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 text-[10px] text-gray-400">Page ID: {page.pageId}</span>
                      </div>
                    </td>
                    {dataOptions.likes && (
                      <td className="px-4 py-3.5 text-center font-semibold text-gray-900 dark:text-white">{page.followers}</td>
                    )}
                    {dataOptions.posts && <td className="px-4 py-3.5 text-center font-medium">{page.postsCount}</td>}
                    {dataOptions.monetize && (
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          {page.monetization}
                        </span>
                      </td>
                    )}
                    {dataOptions.live && (
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{page.distribution}</span>
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-center">
                      <button type="button" className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex select-none items-center justify-between border-t border-gray-150 bg-gray-50/50 px-5 py-3.5 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        <div className="flex gap-4">
          <span>TỔNG: <strong className="text-gray-700 dark:text-white">{filteredPages.length}</strong></span>
          <span>CHỌN: <strong className="text-lime-500 dark:text-lime-300">{selectedIds.length}</strong></span>
          <span>VÙNG: <strong className="text-gray-700 dark:text-white">{selectedRegion}</strong></span>
        </div>
        <button
          type="button"
          onClick={openConfig}
          className="flex cursor-pointer items-center gap-1 font-bold text-lime-500 transition hover:text-lime-600 dark:text-lime-300 dark:hover:text-lime-200"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Cấu hình tải dữ liệu Page
        </button>
      </div>
    </div>
  );
}
