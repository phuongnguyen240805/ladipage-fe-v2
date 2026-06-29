import React from "react";
import { BusinessManager } from "./types";

interface BMsTableProps {
  isLoading: boolean;
  loadingProgress: number;
  dataLoaded: boolean;
  filteredBMs: BusinessManager[];
  selectedIds: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  dataOptions: {
    status: boolean;
    page: boolean;
    limit: boolean;
    bmAccount: boolean;
    partner: boolean;
    admin: boolean;
    instagram: boolean;
    whatsapp: boolean;
    share: boolean;
  };
  selectedRegion: number;
  openConfig: () => void;
}

function getStatusProgress(status: BusinessManager["status"]) {
  if (status === "ACTIVE") return "100%";
  if (status === "DISABLED") return "0%";
  return "50%";
}

export default function BMsTable({
  isLoading,
  loadingProgress,
  dataLoaded,
  filteredBMs,
  selectedIds,
  onSelectAll,
  onSelectRow,
  dataOptions,
  selectedRegion,
  openConfig,
}: BMsTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-lime-50 border-t-lime-500" />
        <h3 className="mb-1 text-base font-bold text-gray-800 dark:text-white">Đang quét thông tin Business Manager...</h3>
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
          Hiện chưa có dữ liệu để hiển thị. Thiết lập và nhấn Tải dữ liệu để quét danh sách tài khoản BM của bạn.
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
                  checked={selectedIds.length === filteredBMs.length && filteredBMs.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 cursor-pointer rounded text-lime-500 focus:ring-lime-400"
                />
              </th>
              <th scope="col" className="w-28 px-4 py-3.5 text-center">Trạng thái</th>
              <th scope="col" className="px-5 py-3.5">Doanh nghiệp (BM)</th>
              <th scope="col" className="px-5 py-3.5">Tiến trình</th>
              {dataOptions.limit && <th scope="col" className="px-4 py-3.5 text-right">Limit</th>}
              {dataOptions.page && <th scope="col" className="px-4 py-3.5 text-center">Số Page</th>}
              {dataOptions.partner && <th scope="col" className="px-4 py-3.5 text-center">Đối tác</th>}
              {dataOptions.admin && <th scope="col" className="px-4 py-3.5 text-center">Admin</th>}
              <th scope="col" className="w-12 px-4 py-3.5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-xs text-gray-700 dark:divide-gray-800 dark:text-gray-300">
            {filteredBMs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  Không tìm thấy tài khoản Business Manager nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredBMs.map((bm) => {
                const isSelected = selectedIds.includes(bm.id);
                const progress = getStatusProgress(bm.status);

                return (
                  <tr
                    key={bm.id}
                    className={`transition-all hover:bg-gray-50/50 dark:hover:bg-gray-900/20 ${
                      isSelected ? "bg-lime-50/30 dark:bg-lime-950/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => onSelectRow(bm.id, event.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded text-lime-500 focus:ring-lime-400"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {bm.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-150 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Hoạt động
                        </span>
                      ) : bm.status === "DISABLED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-150 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Bị hạn chế
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
                          {bm.name}
                        </span>
                        <span className="mt-0.5 text-[10px] text-gray-400">BM ID: {bm.bmId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-1.5 rounded-full ${
                              bm.status === "ACTIVE" ? "bg-green-500" : bm.status === "DISABLED" ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: progress }}
                          />
                        </div>
                        <span>{progress}</span>
                      </div>
                    </td>
                    {dataOptions.limit && (
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-900 dark:text-white">{bm.limit}</td>
                    )}
                    {dataOptions.page && <td className="px-4 py-3.5 text-center font-medium">{bm.pagesCount}</td>}
                    {dataOptions.partner && <td className="px-4 py-3.5 text-center font-medium">{bm.partnersCount}</td>}
                    {dataOptions.admin && <td className="px-4 py-3.5 text-center font-medium">{bm.adminsCount}</td>}
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
          <span>TỔNG: <strong className="text-gray-700 dark:text-white">{filteredBMs.length}</strong></span>
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
          Cấu hình tải dữ liệu BM
        </button>
      </div>
    </div>
  );
}
