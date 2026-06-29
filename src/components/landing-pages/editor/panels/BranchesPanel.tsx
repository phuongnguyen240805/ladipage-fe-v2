"use client";
import React from "react";

export const BranchesPanel: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M18 15V9a4 4 0 0 0-4-4H9" />
          <line x1="6" y1="9" x2="6" y2="15" />
        </svg>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Git Branches</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-lg text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-purple-700 font-bold">main</span>
          </div>
          <span className="text-[9px] text-purple-700 font-bold bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded uppercase">Active</span>
        </div>

        {["development", "feature-puck-editor", "staging"].map((br) => (
          <div key={br} className="border border-gray-200 p-2.5 bg-gray-50/50 rounded-lg text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition cursor-pointer flex items-center justify-between shadow-sm">
            <span className="font-mono font-medium">{br}</span>
            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded uppercase">Offline</span>
          </div>
        ))}

        <button
          onClick={() => {
            const name = prompt("Nhập tên branch mới:");
            if (name) alert(`Đã tạo branch mới: ${name}`);
          }}
          className="w-full text-center text-xs font-semibold text-purple-650 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 transition mt-2 cursor-pointer shadow-sm bg-white"
        >
          + Tạo Branch Mới
        </button>
      </div>
    </div>
  );
};
