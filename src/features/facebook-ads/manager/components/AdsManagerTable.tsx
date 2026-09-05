"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  PauseCircle,
} from "lucide-react";
import type {
  AdsDeliveryStatus,
  AdsManagerEntity,
  AdsTableColumnId,
} from "../types";

type AdsManagerTableProps = {
  rows: AdsManagerEntity[];
  selectedIds: string[];
  density: "compact" | "comfortable";
  currency: "VND" | "USD";
  visibleColumns: AdsTableColumnId[];
  onSelectionChange: (ids: string[]) => void;
  onToggleStatus: (id: string) => void;
  onOpenDetails: (row: AdsManagerEntity) => void;
};

const statusConfig: Record<
  AdsDeliveryStatus,
  {
    label: string;
    className: string;
    icon: typeof CircleCheck;
  }
> = {
  ACTIVE: {
    label: "Đang hoạt động",
    className:
      "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
    icon: CircleCheck,
  },
  PAUSED: {
    label: "Tạm dừng",
    className: "bg-muted text-muted-foreground",
    icon: PauseCircle,
  },
  IN_REVIEW: {
    label: "Đang xét duyệt",
    className:
      "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300",
    icon: Clock3,
  },
  WITH_ISSUES: {
    label: "Có vấn đề",
    className:
      "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
    icon: AlertTriangle,
  },
};

function formatMoney(value: number, currency: "VND" | "USD") {
  if (value === 0) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function formatNumber(value: number) {
  if (value === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function AdsManagerTable({
  rows,
  selectedIds,
  density,
  currency,
  visibleColumns,
  onSelectionChange,
  onToggleStatus,
  onOpenDetails,
}: AdsManagerTableProps) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const someSelected = rows.some((row) => selectedIds.includes(row.id)) && !allSelected;
  const rowClass = density === "compact" ? "h-11" : "h-[52px]";

  const selectedTotal = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)).length,
    [rows, selectedIds],
  );

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !rows.some((row) => row.id === id)));
      return;
    }
    onSelectionChange(Array.from(new Set([...selectedIds, ...rows.map((row) => row.id)])));
  };

  const handleSelectRow = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-theme-xs">
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] w-full border-collapse text-left">
          <thead>
            <tr className="h-10 border-b border-border bg-muted/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="sticky left-0 z-20 w-12 bg-muted px-3 text-center">
                <input
                  aria-label="Chọn tất cả dòng"
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
              </th>
              <th className="w-16 px-3 text-center">Bật/tắt</th>
              <th className="sticky left-12 z-10 min-w-[310px] bg-muted px-4">Tên</th>
              <th className="min-w-[150px] px-4">Phân phối</th>
              {visibleColumns.includes("objective") && (
                <th className="min-w-[170px] px-4">Mục tiêu/định dạng</th>
              )}
              {visibleColumns.includes("budget") && (
                <th className="min-w-[130px] px-4 text-right">Ngân sách</th>
              )}
              {visibleColumns.includes("spend") && (
                <th className="min-w-[130px] px-4 text-right">Chi tiêu</th>
              )}
              {visibleColumns.includes("results") && (
                <th className="min-w-[110px] px-4 text-right">Kết quả</th>
              )}
              {visibleColumns.includes("costPerResult") && (
                <th className="min-w-[130px] px-4 text-right">Chi phí/kết quả</th>
              )}
              {visibleColumns.includes("impressions") && (
                <th className="min-w-[110px] px-4 text-right">Hiển thị</th>
              )}
              {visibleColumns.includes("ctr") && (
                <th className="min-w-[90px] px-4 text-right">CTR</th>
              )}
              {visibleColumns.includes("roas") && (
                <th className="min-w-[90px] px-4 text-right">ROAS</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = statusConfig[row.status];
              const StatusIcon = status.icon;
              const isSelected = selectedIds.includes(row.id);
              const costPerResult = row.results > 0 ? row.spend / row.results : 0;

              return (
                <tr
                  key={row.id}
                  className={`${rowClass} border-b border-border/70 text-xs transition-colors last:border-b-0 ${
                    isSelected ? "bg-accent/70" : "hover:bg-muted/35"
                  }`}
                >
                  <td
                    className={`sticky left-0 z-20 px-3 text-center ${
                      isSelected ? "bg-accent" : "bg-card"
                    }`}
                  >
                    <input
                      aria-label={`Chọn ${row.name}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(row.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                    />
                  </td>
                  <td className="px-3 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.status === "ACTIVE"}
                      aria-label={`${row.status === "ACTIVE" ? "Tạm dừng" : "Bật"} ${row.name}`}
                      onClick={() => onToggleStatus(row.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        row.status === "ACTIVE" ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                          row.status === "ACTIVE" ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </td>
                  <td
                    className={`sticky left-12 z-10 px-4 ${
                      isSelected ? "bg-accent" : "bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenDetails(row)}
                      className="block max-w-[290px] truncate text-left font-semibold text-foreground hover:text-primary hover:underline"
                      title={`Xem chi tiết ${row.name}`}
                    >
                      {row.name}
                    </button>
                    <p className="mt-0.5 max-w-[290px] truncate text-[11px] text-muted-foreground">
                      {row.parentName || `${row.id} · ${row.updatedAt}`}
                    </p>
                  </td>
                  <td className="px-4">
                    <span
                      className={`ladi-status-badge inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${status.className}`}
                    >
                      <StatusIcon aria-hidden="true" size={13} />
                      {status.label}
                    </span>
                  </td>
                  {visibleColumns.includes("objective") && (
                    <td className="px-4 text-muted-foreground">{row.objective}</td>
                  )}
                  {visibleColumns.includes("budget") && (
                    <td className="px-4 text-right font-medium text-foreground">
                      {formatMoney(row.budget, currency)}
                      {row.budget > 0 && (
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          mỗi ngày
                        </span>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes("spend") && (
                    <td className="px-4 text-right font-medium text-foreground">
                      {formatMoney(row.spend, currency)}
                    </td>
                  )}
                  {visibleColumns.includes("results") && (
                    <td className="px-4 text-right">
                      <span className="font-semibold text-foreground">{formatNumber(row.results)}</span>
                      <span className="block max-w-[110px] truncate text-[10px] text-muted-foreground" title={row.resultLabel}>
                        {row.resultLabel}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes("costPerResult") && (
                    <td className="px-4 text-right text-foreground">
                      {formatMoney(costPerResult, currency)}
                    </td>
                  )}
                  {visibleColumns.includes("impressions") && (
                    <td className="px-4 text-right text-foreground">
                      {formatNumber(row.impressions)}
                    </td>
                  )}
                  {visibleColumns.includes("ctr") && (
                    <td className="px-4 text-right text-foreground">
                      {row.ctr > 0 ? `${row.ctr.toFixed(2)}%` : "—"}
                    </td>
                  )}
                  {visibleColumns.includes("roas") && (
                    <td className="px-4 text-right font-semibold text-foreground">
                      {row.roas > 0 ? `${row.roas.toFixed(2)}x` : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold text-foreground">Không tìm thấy dữ liệu phù hợp</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Thử thay đổi từ khóa, trạng thái hoặc cấp quảng cáo đang xem.
          </p>
        </div>
      ) : (
        <div className="flex min-h-12 items-center justify-between gap-3 border-t border-border px-4">
          <p className="text-xs text-muted-foreground">
            {selectedTotal > 0
              ? `Đã chọn ${selectedTotal} trên ${rows.length} dòng`
              : `Hiển thị ${rows.length} dòng dữ liệu mẫu`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <button
              type="button"
              aria-label="Trang sau"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
