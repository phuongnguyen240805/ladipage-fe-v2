"use client";
import React from "react";
import { EditorData } from "../types";

interface SandboxPanelProps {
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
  sandboxPreviewUrl: string;
  showToast: (msg: string, type?: "success" | "info") => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({
  settings,
  onUpdateSettings,
  sandboxPreviewUrl,
  showToast,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
          </svg>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Môi trường & Sandbox</h3>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${
          settings.sandboxStatus === "ready"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : settings.sandboxStatus === "error"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {settings.sandboxStatus}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Môi trường Xem thử (Preview)</div>
          <select
            value={settings.sandboxProvider}
            onChange={(e) => onUpdateSettings("sandboxProvider", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            <option value="local">Local iframe (Mặc định)</option>
            <option value="codesandbox">CodeSandbox Remote</option>
            <option value="vercel">Vercel Serverless Sandbox</option>
          </select>
          <input
            value={settings.sandboxId}
            onChange={(e) => onUpdateSettings("sandboxId", e.target.value)}
            placeholder="Mã ID CodeSandbox (nếu có)..."
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={settings.sandboxPort}
              onChange={(e) => onUpdateSettings("sandboxPort", Number(e.target.value) || 3000)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
            />
            <input
              value={settings.previewPath}
              onChange={(e) => onUpdateSettings("previewPath", e.target.value)}
              placeholder="/landing-page"
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>
          <div className="rounded bg-white border border-gray-250 p-2 font-mono text-[9px] text-gray-500 break-all select-all shadow-inner">
            {sandboxPreviewUrl}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onUpdateSettings("sandboxStatus", "ready");
                showToast("Sandbox đã sẵn sàng", "success");
              }}
              className="cursor-pointer rounded-lg border border-purple-500/30 bg-purple-50 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-sm"
            >
              Kết nối
            </button>
            <button
              onClick={() => {
                onUpdateSettings("sandboxStatus", "connecting");
                setTimeout(() => onUpdateSettings("sandboxStatus", "ready"), 600);
                showToast("Đang khởi động lại sandbox", "info");
              }}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm"
            >
              Khởi động lại
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tối ưu SEO & Domain</div>
          <input
            value={settings.seoTitle}
            onChange={(e) => onUpdateSettings("seoTitle", e.target.value)}
            placeholder="Nhập tiêu đề SEO của trang..."
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
          <textarea
            value={settings.seoDescription}
            onChange={(e) => onUpdateSettings("seoDescription", e.target.value)}
            placeholder="Nhập mô tả SEO của trang..."
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
          <input
            value={settings.customDomain}
            onChange={(e) => onUpdateSettings("customDomain", e.target.value)}
            placeholder="Nhập tên miền riêng (domain.com)..."
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
          <input
            value={settings.pixelId}
            onChange={(e) => onUpdateSettings("pixelId", e.target.value)}
            placeholder="Mã số Pixel Meta Ads..."
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
