import React from "react";
import { showClientToast } from "@/features/facebook-ads/shared/client-feedback";

interface ToolbarHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  threads: number;
  setThreads: (threads: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  selectedIdsCount: number;
  dataLoaded: boolean;
  isLoading: boolean;
  handleLoadData: () => void;
}

export default function ToolbarHeader({
  searchQuery,
  setSearchQuery,
  threads,
  setThreads,
  delay,
  setDelay,
  selectedIdsCount,
  dataLoaded,
  isLoading,
  handleLoadData,
}: ToolbarHeaderProps) {
  const handleStart = () => {
    if (selectedIdsCount === 0) {
      showClientToast("Vui lòng chọn ít nhất một Fanpage để bắt đầu.", "warning");
      return;
    }

    showClientToast(`Bắt đầu chạy tiện ích trên ${selectedIdsCount} Fanpage với ${threads} luồng và delay ${delay} giây.`, "success");
  };

  return (
    <div className="w-full">
      <div className="flex w-full flex-wrap items-center gap-2 p-4 sm:gap-2.5">
        <button
          type="button"
          onClick={handleStart}
          className="flex shrink-0 cursor-pointer select-none items-center gap-2 rounded-xl bg-lime-500 px-4.5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-lime-600"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Bắt đầu</span>
        </button>

        <div className="flex shrink-0 items-center rounded-xl border border-gray-150 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-900">
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white" title="Lọc">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </button>
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white" title="Danh sách">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white" title="Tải xuống">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white" title="Layout">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => dataLoaded && handleLoadData()}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white"
            title="Tải lại"
          >
            <svg className={`h-4 w-4 ${isLoading ? "animate-spin text-lime-400" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="relative min-w-[90px] max-w-[200px] flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-gray-150 bg-gray-50 py-2 pl-9 pr-4 text-xs transition focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 dark:border-gray-800 dark:bg-gray-900"
          />
          <svg className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-150 bg-gray-50 px-2.5 py-1 text-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="select-none font-medium text-gray-400">Luồng</span>
          <input
            type="number"
            value={threads}
            onChange={(event) => setThreads(Math.max(1, Number(event.target.value)))}
            className="w-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none dark:text-gray-300"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-150 bg-gray-50 px-2.5 py-1 text-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="select-none font-medium text-gray-400">Delay</span>
          <input
            type="number"
            value={delay}
            onChange={(event) => setDelay(Math.max(0, Number(event.target.value)))}
            className="w-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none dark:text-gray-300"
            placeholder="0"
          />
        </div>

        <button
          type="button"
          onClick={() => showClientToast("Chức năng Tạo Page đã có trong bundle, đang chờ dựng UI điều khiển chi tiết.", "info")}
          className="flex shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-xl border border-lime-400 px-3 py-1.5 text-xs font-semibold text-lime-500 transition hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-950/20"
        >
          <span>+ Tạo Page</span>
        </button>
        <button
          type="button"
          onClick={() => showClientToast("Chức năng Chấp nhận Page đã có trong bundle, đang chờ dựng UI điều khiển chi tiết.", "info")}
          className="flex shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-xl border border-lime-400 px-3 py-1.5 text-xs font-semibold text-lime-500 transition hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-950/20"
        >
          <span>Chấp nhận Page</span>
        </button>
      </div>
    </div>
  );
}
