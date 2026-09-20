import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Kedi.Media
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Nền tảng marketing & landing page của Kedi.
      </p>
      <a
        href="/"
        className="flex items-center justify-center p-3 font-medium rounded-lg bg-brand-500 text-[#0B2D5B] text-theme-sm hover:bg-brand-600"
      >
        Về trang chủ
      </a>
    </div>
  );
}
