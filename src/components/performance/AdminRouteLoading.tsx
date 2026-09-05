import React from "react";

type AdminRouteLoadingProps = {
  label: string;
  variant?: "list" | "workspace" | "canvas";
};

export function AdminRouteLoading({
  label,
  variant = "list",
}: AdminRouteLoadingProps) {
  if (variant === "workspace") {
    return (
      <div
        className="flex min-h-[60vh] w-full animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        aria-busy="true"
        aria-label={label}
      >
        <div className="w-[38%] border-r border-slate-200 p-4 dark:border-slate-800">
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-900" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="h-10 w-48 rounded-lg bg-slate-100 dark:bg-slate-900" />
          <div className="mt-6 flex-1 rounded-2xl bg-slate-50 dark:bg-slate-900/70" />
        </div>
      </div>
    );
  }

  if (variant === "canvas") {
    return (
      <div
        className="min-h-[60vh] w-full animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        aria-busy="true"
        aria-label={label}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="h-9 w-56 rounded-lg bg-slate-100 dark:bg-slate-900" />
          <div className="h-9 w-36 rounded-lg bg-slate-100 dark:bg-slate-900" />
        </div>
        <div className="mt-4 h-[52vh] rounded-xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div
      className="min-h-[60vh] w-full animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-7 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-900" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-slate-100 dark:bg-slate-900" />
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
