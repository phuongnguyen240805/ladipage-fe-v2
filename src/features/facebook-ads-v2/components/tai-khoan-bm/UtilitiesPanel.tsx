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
    <div className="p-4 flex flex-col gap-4 select-none">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-lime-50 dark:bg-lime-950/20 text-lime-500 dark:text-lime-300 flex items-center justify-center border border-lime-50 dark:border-lime-900/30">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.487-3.487-7.7 7.7a2.25 2.25 0 00-.513.793l-.487 1.904z" />
            </svg>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">Tiện ích đang chạy</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAddUtilityOpen(!isAddUtilityOpen)}
            className="p-1.5 bg-lime-50 hover:bg-lime-50 dark:bg-lime-950/30 dark:hover:bg-lime-900/50 text-lime-500 dark:text-lime-300 rounded-lg transition border border-lime-50/60 dark:border-lime-900/40 text-[10px] sm:text-xs font-bold cursor-pointer"
          >
            + Thêm
          </button>
          <button className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition border border-gray-150 dark:border-gray-800 cursor-pointer" title="Cài đặt">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Utility Inline Box */}
      {isAddUtilityOpen && (
        <form onSubmit={onAddUtility} className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-2.5 flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            placeholder="Tên tiện ích..."
            value={newUtilityName}
            onChange={(e) => setNewUtilityName(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-lime-400 transition"
          />
          <button
            type="submit"
            className="bg-lime-500 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-lime-600 transition cursor-pointer"
          >
            Lưu
          </button>
        </form>
      )}

      {/* Utilities List */}
      <div className="flex flex-col gap-2.5">
        {utilities.map((ut, index) => (
          <div
            key={ut.id}
            className={`flex items-center justify-between border border-gray-150 dark:border-gray-800 rounded-xl p-2 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-200 dark:hover:border-gray-700 transition-all ${
              !ut.enabled ? "opacity-60" : ""
            }`}
          >
            {/* Left Side */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex flex-col gap-0.5 opacity-40 hover:opacity-100 transition flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onMoveUtility(index, "up")}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Di chuyển lên"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onMoveUtility(index, "down")}
                  disabled={index === utilities.length - 1}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Di chuyển xuống"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              <div className={`w-6.5 h-6.5 rounded-lg ${ut.color} text-white flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0`}>
                {ut.name.substring(0, 1).toUpperCase()}
              </div>

              <span className="text-xs font-semibold text-gray-800 dark:text-gray-300 truncate block font-sans" title={ut.name}>
                {ut.name}
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer" title="Thông tin chi tiết">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onToggleUtility(ut.id)}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  ut.enabled ? "bg-lime-500" : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    ut.enabled ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onDeleteUtility(ut.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
                title="Xóa tiện ích"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
