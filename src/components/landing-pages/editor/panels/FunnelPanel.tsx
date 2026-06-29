"use client";
import React from "react";
import { EditorData } from "../types";
import { FUNNELX_EVENTS, FUNNELX_FLAGS } from "@onlook/funnel";

interface FunnelPanelProps {
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}

export const FunnelPanel: React.FC<FunnelPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h15l-6 7.125v4.875l-3 1.5v-6.375L4.5 5.25z" />
        </svg>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phễu Funnel & Logic</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">GrowthBook Feature</div>
              <div className="mt-1 text-[11px] leading-relaxed text-gray-500">Gắn cờ tính năng vào trang hoặc phễu này.</div>
            </div>
            <button
              onClick={() => onUpdateSettings("funnelEnabled", !settings.funnelEnabled)}
              className={`relative h-5 w-9 rounded-full transition flex-shrink-0 ${settings.funnelEnabled ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition shadow ${settings.funnelEnabled ? "left-4" : "left-0.5"}`} />
            </button>
          </div>

          <select
            value={settings.funnelFeatureFlag}
            onChange={(e) => onUpdateSettings("funnelFeatureFlag", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            {FUNNELX_FLAGS.map((flag) => (
              <option key={flag} value={flag}>{flag}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Điều kiện kích hoạt</div>
          <select
            value={settings.funnelTrigger}
            onChange={(e) => onUpdateSettings("funnelTrigger", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            <option value="immediate">Ngay lập tức (Immediate)</option>
            <option value="time_on_page">Theo thời gian trên trang</option>
            <option value="scroll_progress">Theo phần trăm cuộn trang</option>
            <option value="exit_intent">Khi khách định thoát trang</option>
            <option value="inactivity">Không hoạt động trong thời gian dài</option>
          </select>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Ngưỡng thời gian / cuộn</label>
            <input
              type="number"
              value={settings.funnelTriggerThreshold}
              onChange={(e) => onUpdateSettings("funnelTriggerThreshold", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>
          <select
            value={settings.funnelFrequency}
            onChange={(e) => onUpdateSettings("funnelFrequency", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            <option value="once">Chỉ hiện một lần</option>
            <option value="session">Hiện một lần mỗi phiên</option>
            <option value="always">Luôn luôn hiển thị</option>
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Đo lường PostHog</div>
          <label className="flex items-center justify-between gap-3 text-xs text-gray-700 cursor-pointer">
            Ghi nhận phễu hành vi
            <input
              type="checkbox"
              checked={settings.posthogEnabled}
              onChange={(e) => onUpdateSettings("posthogEnabled", e.target.checked)}
              className="h-4 w-4 accent-purple-650"
            />
          </label>
          <input
            type="text"
            value={settings.posthogProjectKey}
            onChange={(e) => onUpdateSettings("posthogProjectKey", e.target.value)}
            placeholder="PostHog Project Key API..."
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
          />
          <label className="flex items-center justify-between gap-3 text-xs text-gray-700 cursor-pointer">
            Ghi màn hình (Session replay)
            <input
              type="checkbox"
              checked={settings.sessionReplayEnabled}
              onChange={(e) => onUpdateSettings("sessionReplayEnabled", e.target.checked)}
              className="h-4 w-4 accent-purple-650"
            />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Phân loại sự kiện (Taxonomy)</div>
          <div className="space-y-1.5">
            {Object.values(FUNNELX_EVENTS).slice(0, 7).map((eventName) => (
              <div key={eventName} className="rounded border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-[9px] text-gray-500 shadow-sm">
                {eventName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
