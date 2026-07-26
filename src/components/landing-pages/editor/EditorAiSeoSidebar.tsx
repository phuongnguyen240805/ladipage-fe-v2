"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ShieldCheck, Eye, RefreshCw, Layers } from "lucide-react";

export interface EditorAiSeoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  pageSlug?: string;
  onApplyUiOptimization?: (optimizedState: any) => void;
}

export function EditorAiSeoSidebar({
  isOpen,
  onClose,
  pageName,
  pageSlug,
  onApplyUiOptimization,
}: EditorAiSeoSidebarProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!isOpen) return null;

  const mockTitle = `${pageName} — Giải Pháp Tối Ưu Hàng Đầu`;
  const mockDescription = `Khám phá ngay ${pageName} với tính năng hiện đại, giao diện trực quan và trải nghiệm người dùng mượt mà nhất.`;

  const handleStartUiOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsPreviewOpen(true);
    }, 1500);
  };

  const handleApplyChanges = () => {
    if (onApplyUiOptimization) {
      onApplyUiOptimization({ optimized: true, timestamp: Date.now() });
    }
    setIsPreviewOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-screen shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col z-10 animate-slideOver">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 border border-lime-200/50 dark:border-lime-800/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">AI-SEO Builder Assistant</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Pre-publish Audit & UI Optimizer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-500/10 via-emerald-500/5 to-transparent border border-lime-200/60 dark:border-lime-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-lime-700 dark:text-lime-300">Điểm SEO Dự Kiến</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-800 dark:text-white">88</span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
              </div>
            </div>
            <button
              onClick={handleStartUiOptimization}
              disabled={isOptimizing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-lime-600 hover:bg-lime-700 rounded-xl transition duration-150 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-lime-200" />}
              {isOptimizing ? "Đang xử lý..." : "Tối ưu UI bằng AI"}
            </button>
          </div>

          {/* Checks list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Kiểm tra On-page Real-time</h4>

            {/* Check item 1 */}
            <div className="p-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Thẻ H1 hợp lệ</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Trang đã có 1 thẻ H1 chính xác ở Hero section.</span>
              </div>
            </div>

            {/* Check item 2 */}
            <div className="p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Meta Description hơi ngắn</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Hiện tại: {mockDescription.length} ký tự. Khuyên dùng 120–160 ký tự.</span>
              </div>
            </div>

            {/* Check item 3 */}
            <div className="p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Hình ảnh thiếu thẻ Alt</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Có 2 hình ảnh chưa được gắn từ khóa mô tả Alt.</span>
              </div>
            </div>

            {/* Check item 4 */}
            <div className="p-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Mobile Responsive Layout</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Cỡ chữ và khoảng cách vừa vặn cho các thiết bị di động.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Diff Preview Modal (Before vs After) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Xem Trước Thay Đổi UI do AI Đề Xuất</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before vs After Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BEFORE Column */}
              <div className="p-4 rounded-2xl border border-rose-200/60 bg-rose-50/30 dark:bg-rose-950/10 dark:border-rose-900/30 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Giao diện Hiện tại (Before)</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Hero Section Image:</p>
                  <p className="text-[11px] text-slate-400 font-mono">Aspect-ratio: unconstrained (Dễ vỡ CLS)</p>
                  <p className="font-semibold text-slate-600 dark:text-slate-400 mt-2">Nút CTA Primary:</p>
                  <p className="text-[11px] text-slate-400 font-mono">Color: #94a3b8 (Tương phản thấp)</p>
                </div>
              </div>

              {/* AFTER Column */}
              <div className="p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900/30 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Đã Tối Ưu UI/UX (After)</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Hero Section Image:</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Added: width="1200" height="630" aspect-ratio="16/9"</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-2">Nút CTA Primary:</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Color: #84cc16 (Chuẩn tương phản W3C AAA)</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleApplyChanges}
                className="px-5 py-2 text-xs font-bold text-white bg-lime-600 hover:bg-lime-700 rounded-xl transition shadow-sm cursor-pointer"
              >
                Chấp Nhận & Cập Nhật Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EditorAiSeoSidebar;
