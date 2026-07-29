import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export function SeoAutomationHero() {
  return (
    <div className="border-b border-gray-200/60 bg-gradient-to-r from-lime-50/60 to-emerald-50/30 px-4 py-6 text-left dark:border-gray-800 dark:from-slate-900/60 dark:to-emerald-950/10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Dashboard AI‑SEO
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tổng quan SEO và traffic của các project trong một màn hình.
          </p>
        </div>

        <Link
          href="/ai-seo/projects/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-lime-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-lime-600"
        >
          <Plus className="w-4 h-4" />
          Tạo project
        </Link>
      </div>
    </div>
  );
}
export default SeoAutomationHero;
