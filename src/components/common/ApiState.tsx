"use client";

import type { ReactNode } from "react";

type ApiStateProps = {
  isLoading?: boolean;
  error?: Error | null;
  loadingLabel?: string;
  children: ReactNode;
};

export function ApiState({
  isLoading,
  error,
  loadingLabel = "Đang tải dữ liệu...",
  children,
}: ApiStateProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        {loadingLabel}
      </div>
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
