"use client";

import React from "react";

type PermissionDeniedStateProps = {
  title?: string;
  description?: string;
};

export function PermissionDeniedState({
  title = "Không có quyền truy cập",
  description = "Bạn không có quyền thực hiện thao tác này. Liên hệ Owner/Admin trong workspace để được cấp quyền commerce.",
}: PermissionDeniedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 select-none space-y-4 px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-850 flex items-center justify-center border border-gray-200 dark:border-gray-800 text-slate-400">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 text-center">
        {title}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm text-center font-medium leading-relaxed">
        {description}
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
        M0: không hiện “Nâng cấp Pro” — chỉ phân quyền staff.
      </p>
    </div>
  );
}
