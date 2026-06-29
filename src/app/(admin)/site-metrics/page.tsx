"use client";

import React from "react";
import Link from "next/link";

export default function SiteMetricsPlaceholder() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            Đang hoàn thiện (Partial)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
            Site Metrics
          </h1>
        </div>
        <Link
          href="/apps"
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
        >
          Quay lại App Launcher
        </Link>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 mb-8 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZMM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div>
          <p className="font-semibold">Chưa kết nối dữ liệu (Not Connected)</p>
          <p className="mt-1 opacity-90">
            Hãy liên kết tên miền hoặc tài khoản Google Search Console để đồng bộ chỉ số Traffic, CTR và Technical Audit.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8">
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl mb-8">
          <svg className="w-16 h-16 mx-auto text-gray-350 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253m0 0A17.919 17.919 0 0012 10.5c3.162 0 6.133.815 8.716 2.247m0 0A9.015 9.015 0 0021 12a8.959 8.959 0 00-.284-2.253" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa phân tích tên miền nào</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            Nhập tên miền của bạn để quét toàn bộ chỉ số SEO và hiệu năng tải trang.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="text"
              placeholder="e.g. domain.com"
              disabled
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm cursor-not-allowed"
            />
            <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-250 dark:border-gray-700 rounded-lg text-xs font-bold pointer-events-none cursor-not-allowed">
              Phân tích
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Các tính năng đang được phát triển:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Audit kỹ thuật SEO toàn bộ website tự động hàng tuần",
              "Biểu đồ đo lường lượng truy cập tự nhiên (Organic Traffic)",
              "Giám sát và báo cáo Core Web Vitals (LCP, FID, CLS)",
              "Cảnh báo tự động về lỗi lập chỉ mục và bảo mật index"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
