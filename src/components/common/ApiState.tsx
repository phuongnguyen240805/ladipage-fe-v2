"use client";

import type { ReactNode } from "react";
import {
  ContentSkeleton,
  type ContentSkeletonVariant,
} from "@/components/ui/skeleton/ContentSkeleton";

type ApiStateProps = {
  isLoading?: boolean;
  error?: Error | null;
  loadingLabel?: string;
  skeleton?: ReactNode;
  skeletonVariant?: ContentSkeletonVariant;
  skeletonRows?: number;
  skeletonColumns?: number;
  children: ReactNode;
};

export function ApiState({
  isLoading,
  error,
  loadingLabel = "Đang tải dữ liệu...",
  skeleton,
  skeletonVariant = "table",
  skeletonRows = 6,
  skeletonColumns = 5,
  children,
}: ApiStateProps) {
  if (isLoading) {
    return (
      <>
        {skeleton ?? (
          <ContentSkeleton
            variant={skeletonVariant}
            rows={skeletonRows}
            columns={skeletonColumns}
            label={loadingLabel}
          />
        )}
      </>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
        {error.message || "Không tải được dữ liệu."}
      </div>
    );
  }

  return <>{children}</>;
}

export default ApiState;
