import React from "react";

export function SeoProjectSkeleton() {
  return (
    <div className="min-h-[238px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="mt-4 h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
      <div className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto mt-3 h-2 w-12 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mx-auto mt-2 h-4 w-8 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="h-3 w-40 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
export default SeoProjectSkeleton;
