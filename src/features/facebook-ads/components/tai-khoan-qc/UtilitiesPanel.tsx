import React from "react";
import { UtilityItem } from "./types";

interface UtilitiesPanelProps {
  utilities: UtilityItem[];
  onToggleUtility: (id: string) => void;
  onDeleteUtility: (id: string) => void;
  onMoveUtility: (index: number, direction: "up" | "down") => void;
  newUtilityName: string;
  setNewUtilityName: (name: string) => void;
  isAddUtilityOpen: boolean;
  setIsAddUtilityOpen: (open: boolean) => void;
  onAddUtility: (e: React.FormEvent) => void;
}

export default function UtilitiesPanel({
  utilities,
  onToggleUtility,
  onDeleteUtility,
  onMoveUtility,
  newUtilityName,
  setNewUtilityName,
  isAddUtilityOpen,
  setIsAddUtilityOpen,
  onAddUtility,
}: UtilitiesPanelProps) {
  return (
    <div className="flex select-none flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-lime-50 bg-lime-50 text-lime-500 dark:border-lime-900/30 dark:bg-lime-950/20 dark:text-lime-300">
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.487-3.487-7.7 7.7a2.25 2.25 0 00-.513.793l-.487 1.904z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold text-gray-800 dark:text-white sm:text-sm">Tiện ích đang chạy</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAddUtilityOpen(!isAddUtilityOpen)}
            className="cursor-pointer rounded-lg border border-lime-50/60 bg-lime-50 p-1.5 text-[10px] font-bold text-lime-500 transition hover:bg-lime-50 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-300 dark:hover:bg-lime-900/50 sm:text-xs"
          >
            + Thêm
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-150 bg-gray-50 p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-850 dark:hover:text-white"
            title="Cài đặt"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {isAddUtilityOpen && (
        <form onSubmit={onAddUtility} className="flex animate-fade-in items-center gap-2 rounded-xl border border-gray-150 bg-gray-50 p-2.5 dark:border-gray-800 dark:bg-gray-900">
          <input
            type="text"
            placeholder="Tên tiện ích..."
            value={newUtilityName}
            onChange={(event) => setNewUtilityName(event.target.value)}
            className="flex-1 rounded-lg border border-gray-150 bg-white px-2.5 py-1 text-xs transition focus:border-lime-400 focus:outline-none dark:border-gray-800 dark:bg-gray-850"
          />
          <button type="submit" className="cursor-pointer rounded-lg bg-lime-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-lime-600">
            Lưu
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2.5">
        {utilities.map((utility, index) => (
          <div
            key={utility.id}
            className={`flex items-center justify-between rounded-xl border border-gray-150 bg-gray-50/50 p-2 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-gray-700 ${
              !utility.enabled ? "opacity-60" : ""
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex shrink-0 flex-col gap-0.5 opacity-40 transition hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onMoveUtility(index, "up")}
                  disabled={index === 0}
                  className="cursor-pointer text-gray-400 hover:text-gray-900 disabled:opacity-20 dark:hover:text-white"
                  title="Di chuyển lên"
                >
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onMoveUtility(index, "down")}
                  disabled={index === utilities.length - 1}
                  className="cursor-pointer text-gray-400 hover:text-gray-900 disabled:opacity-20 dark:hover:text-white"
                  title="Di chuyển xuống"
                >
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              <div className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm ${utility.color}`}>
                {utility.name.substring(0, 1).toUpperCase()}
              </div>

              <span className="block truncate font-sans text-xs font-semibold text-gray-800 dark:text-gray-300" title={utility.name}>
                {utility.name}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button type="button" className="cursor-pointer text-gray-400 transition hover:text-gray-600 dark:hover:text-white" title="Thông tin chi tiết">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onToggleUtility(utility.id)}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  utility.enabled ? "bg-lime-500" : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    utility.enabled ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onDeleteUtility(utility.id)}
                className="cursor-pointer text-gray-400 transition hover:text-red-500 dark:hover:text-red-400"
                title="Xóa tiện ích"
              >
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
