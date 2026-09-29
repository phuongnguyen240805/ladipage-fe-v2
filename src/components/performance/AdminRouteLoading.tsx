import React from "react";
import { ContentSkeleton } from "@/components/ui/skeleton/ContentSkeleton";
import Skeleton from "@/components/ui/skeleton/Skeleton";

type AdminRouteLoadingProps = {
  label: string;
  variant?: "list" | "workspace" | "canvas" | "dashboard" | "cards" | "form";
};

export function AdminRouteLoading({
  label,
  variant = "list",
}: AdminRouteLoadingProps) {
  if (variant === "workspace") {
    return (
      <div
        className="flex min-h-[60vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <div className="w-[38%] border-r border-slate-200 p-4 dark:border-slate-800">
          <Skeleton className="h-9 w-full" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" rounded="lg" />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-6 min-h-64 flex-1" rounded="lg" />
        </div>
      </div>
    );
  }

  if (variant === "canvas") {
    return (
      <div
        className="min-h-[60vh] w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="mt-4 h-[52vh] w-full" rounded="lg" />
      </div>
    );
  }

  if (variant === "dashboard") {
    return <ContentSkeleton variant="dashboard" label={label} />;
  }

  if (variant === "cards") {
    return <ContentSkeleton variant="cards" label={label} />;
  }

  if (variant === "form") {
    return <ContentSkeleton variant="form" label={label} />;
  }

  return <ContentSkeleton variant="page-list" rows={6} columns={5} label={label} />;
}
