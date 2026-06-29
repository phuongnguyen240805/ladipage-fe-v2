"use client";
import React from "react";
import { LandingPageItem } from "../../dung-chung/types";

interface PageListingPanelProps {
  page: LandingPageItem;
  pages?: LandingPageItem[];
  onSwitchPage?: (page: LandingPageItem) => void;
  onCreatePage?: (name: string) => LandingPageItem;
  onDeletePage?: (id: string) => void;
}

export const PageListingPanel: React.FC<PageListingPanelProps> = ({
  page,
  pages,
  onSwitchPage,
  onCreatePage,
  onDeletePage,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Danh sách Trang</h3>
        </div>
        <button
          onClick={() => {
            const name = prompt("Nhập tên trang mới:");
            if (name && name.trim()) {
              const newPg = onCreatePage?.(name.trim());
              if (newPg && onSwitchPage) onSwitchPage(newPg);
            }
          }}
          className="cursor-pointer text-xs font-bold text-purple-600 hover:text-purple-700 transition"
        >
          + Mới
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {pages?.map((p) => {
          const isCurrent = p.id === page.id;
          return (
            <div
              key={p.id}
              onClick={() => {
                if (!isCurrent && onSwitchPage) {
                  onSwitchPage(p);
                }
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer border transition-all ${
                isCurrent
                  ? "bg-purple-50 text-purple-700 border-purple-200 font-semibold shadow-sm"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="truncate flex-1 font-medium">{p.name}</span>
              {isCurrent ? (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-sm shadow-purple-600 flex-shrink-0 ml-2" />
              ) : onDeletePage ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Bạn có chắc chắn muốn xóa trang "${p.name}"?`)) {
                      onDeletePage(p.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 p-1 transition ml-2 cursor-pointer"
                  title="Xóa trang"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
