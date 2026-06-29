import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`mx-auto mb-10 w-full max-w-60 rounded-2xl bg-slate-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white leading-snug">
        #1 Tailwind CSS Dashboard
      </h3>
      <p className="text-theme-sm mb-4 text-slate-500 dark:text-slate-400 leading-relaxed">
        Leading Tailwind CSS Admin Template with 400+ UI Component and Pages.
      </p>
      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="bg-brand-500 text-theme-sm hover:bg-brand-600 flex items-center justify-center rounded-lg p-3 font-medium text-white"
      >
        Upgrade To Pro
      </a>
    </div>
  );
}

