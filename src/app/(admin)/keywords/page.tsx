"use client";

import React from "react";
import Link from "next/link";

export default function KeywordsPlaceholder() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            Đang hoàn thiện (Partial)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
            Keywords Research
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
            Cơ sở dữ liệu từ khóa chưa được kết nối. Hãy kích hoạt tích hợp dữ liệu để tra cứu Search Volume và Keyword Difficulty.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8">
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl mb-8">
          <svg className="w-16 h-16 mx-auto text-gray-350 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa tra cứu từ khóa nào</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            Nhập từ khóa hoặc cụm từ tìm kiếm để tra cứu thông tin chi tiết độ khó và cơ hội xếp hạng.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="text"
              placeholder="e.g. landing page builder"
              disabled
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm cursor-not-allowed"
            />
            <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-250 dark:border-gray-700 rounded-lg text-xs font-bold pointer-events-none cursor-not-allowed">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Các tính năng đang được phát triển:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Tra cứu dữ liệu từ khóa chi tiết (Search Volume, CPC, Difficulty)",
              "Tạo và quản lý danh sách từ khóa mục tiêu (Keyword Lists)",
              "Phát hiện các cơ hội xếp hạng từ khóa ngách (Ranking Opportunities)",
              "Phân tích đối thủ cạnh tranh đang xếp hạng cho từ khóa đó"
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
