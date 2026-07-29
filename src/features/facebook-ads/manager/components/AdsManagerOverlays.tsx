"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Filter,
  Lightbulb,
  Megaphone,
  Pause,
  Play,
  Rows3,
  ShieldCheck,
} from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsDrawer from "../../shared/components/AdsDrawer";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";
import type {
  AdsManagerEntity,
  AdsManagerFilters,
  AdsTableColumnId,
} from "../types";

export type AdsManagerOverlay =
  | "guide"
  | "notifications"
  | "date"
  | "filters"
  | "columns"
  | "export"
  | "details"
  | "bulk-active"
  | "bulk-paused"
  | null;

type AdsManagerOverlaysProps = {
  activeOverlay: AdsManagerOverlay;
  activeEntity: AdsManagerEntity | null;
  selectedCount: number;
  visibleColumns: AdsTableColumnId[];
  filters: AdsManagerFilters;
  dateRange: { from: string; to: string; label: string };
  onClose: () => void;
  onApplyColumns: (columns: AdsTableColumnId[]) => void;
  onApplyFilters: (filters: AdsManagerFilters) => void;
  onApplyDateRange: (range: { from: string; to: string; label: string }) => void;
  onExport: (scope: "visible" | "selected") => void;
  onApplyBulkStatus: (status: "ACTIVE" | "PAUSED") => void;
};

const columnOptions: Array<{
  id: AdsTableColumnId;
  label: string;
  description: string;
}> = [
  { id: "objective", label: "Mục tiêu/định dạng", description: "Mục tiêu phân phối hoặc loại creative" },
  { id: "budget", label: "Ngân sách", description: "Ngân sách ngày của campaign/ad set" },
  { id: "spend", label: "Chi tiêu", description: "Số tiền đã chi trong khoảng ngày" },
  { id: "results", label: "Kết quả", description: "Kết quả theo mục tiêu quảng cáo" },
  { id: "costPerResult", label: "Chi phí/kết quả", description: "Chi tiêu chia cho số kết quả" },
  { id: "impressions", label: "Lượt hiển thị", description: "Tổng số lần quảng cáo được hiển thị" },
  { id: "ctr", label: "CTR", description: "Tỷ lệ nhấp chuột" },
  { id: "roas", label: "ROAS", description: "Doanh thu trên chi tiêu quảng cáo" },
];

export default function AdsManagerOverlays({
  activeOverlay,
  activeEntity,
  selectedCount,
  visibleColumns,
  filters,
  dateRange,
  onClose,
  onApplyColumns,
  onApplyFilters,
  onApplyDateRange,
  onExport,
  onApplyBulkStatus,
}: AdsManagerOverlaysProps) {
  const [draftColumns, setDraftColumns] = useState(visibleColumns);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [draftDate, setDraftDate] = useState(dateRange);
  const [exportScope, setExportScope] = useState<"visible" | "selected">("visible");

  return (
    <>
      <AdsModal
        open={activeOverlay === "guide"}
        title="Làm quen với Ads Manager"
        description="Bốn bước giúp bạn kiểm tra giao diện trước khi kết nối dữ liệu thật."
        size="lg"
        onClose={onClose}
        footer={<AdsButton variant="primary" onClick={onClose}>Đã hiểu</AdsButton>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Megaphone,
              title: "Chọn tài khoản",
              text: "Mỗi tài khoản có currency, timezone và dữ liệu riêng.",
            },
            {
              icon: Filter,
              title: "Thu hẹp dữ liệu",
              text: "Dùng khoảng ngày, trạng thái, mục tiêu và ROAS để tìm đúng nhóm cần xem.",
            },
            {
              icon: Rows3,
              title: "Chuyển cấp dữ liệu",
              text: "Xem riêng Chiến dịch, Nhóm quảng cáo hoặc Quảng cáo.",
            },
            {
              icon: ShieldCheck,
              title: "Kiểm tra trước khi thay đổi",
              text: "Bulk action và publish thật sẽ luôn có bước xác nhận.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-border p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon size={17} />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-4">
          <MockNotice />
        </div>
      </AdsModal>

      <AdsDrawer
        open={activeOverlay === "notifications"}
        title="Thông báo hiệu suất"
        description="Cảnh báo và cập nhật từ các tài khoản đang theo dõi."
        width="sm"
        onClose={onClose}
      >
        <div className="space-y-3">
          {[
            {
              icon: AlertTriangle,
              color: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
              title: "Chi phí tăng 23% trong 3 giờ",
              detail: "Ecom | Prospecting | Broad audience",
              time: "8 phút trước",
            },
            {
              icon: CircleDollarSign,
              color: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
              title: "ROAS vượt mục tiêu 4.0x",
              detail: "Ecom | Retarget | Website purchase",
              time: "32 phút trước",
            },
            {
              icon: Pause,
              color: "bg-muted text-muted-foreground",
              title: "Một nhóm quảng cáo đã tạm dừng",
              detail: "Add to cart 14 ngày",
              time: "Hôm qua, 17:22",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-border p-3.5">
                <div className="flex gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{item.detail}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </AdsDrawer>

      <AdsModal
        open={activeOverlay === "date"}
        title="Khoảng thời gian báo cáo"
        description="Chọn khoảng ngày dùng cho metrics và bảng dữ liệu."
        onClose={onClose}
        footer={
          <>
            <AdsButton variant="ghost" onClick={onClose}>Hủy</AdsButton>
            <AdsButton
              variant="primary"
              onClick={() => {
                onApplyDateRange({
                  ...draftDate,
                  label: `${draftDate.from.split("-").reverse().join("/")} – ${draftDate.to.split("-").reverse().join("/")}`,
                });
                onClose();
              }}
            >
              Áp dụng
            </AdsButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-medium text-foreground">Từ ngày</span>
            <input
              type="date"
              value={draftDate.from}
              onChange={(event) => setDraftDate((current) => ({ ...current, from: event.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-foreground">Đến ngày</span>
            <input
              type="date"
              value={draftDate.to}
              onChange={(event) => setDraftDate((current) => ({ ...current, to: event.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["7 ngày qua", "2026-07-23", "2026-07-29"],
            ["14 ngày qua", "2026-07-16", "2026-07-29"],
            ["Tháng này", "2026-07-01", "2026-07-29"],
            ["Tháng trước", "2026-06-01", "2026-06-30"],
          ].map(([label, from, to]) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraftDate({ from, to, label })}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
      </AdsModal>

      <AdsModal
        open={activeOverlay === "filters"}
        title="Bộ lọc nâng cao"
        description="Các điều kiện được áp dụng đồng thời lên bảng hiện tại."
        onClose={onClose}
        footer={
          <>
            <AdsButton
              variant="ghost"
              onClick={() =>
                setDraftFilters({
                  status: "ALL",
                  objective: "ALL",
                  minimumRoas: 0,
                  onlyWithSpend: false,
                })
              }
            >
              Đặt lại
            </AdsButton>
            <AdsButton
              variant="primary"
              onClick={() => {
                onApplyFilters(draftFilters);
                onClose();
              }}
            >
              Áp dụng bộ lọc
            </AdsButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-medium text-foreground">Trạng thái</span>
            <select
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value as AdsManagerFilters["status"],
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="PAUSED">Tạm dừng</option>
              <option value="IN_REVIEW">Đang xét duyệt</option>
              <option value="WITH_ISSUES">Có vấn đề</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-foreground">Mục tiêu</span>
            <select
              value={draftFilters.objective}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, objective: event.target.value }))
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả mục tiêu</option>
              <option value="Doanh số">Doanh số</option>
              <option value="Khách hàng tiềm năng">Khách hàng tiềm năng</option>
              <option value="Lưu lượng truy cập">Lưu lượng truy cập</option>
              <option value="Lượt tương tác">Lượt tương tác</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-foreground">ROAS tối thiểu</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={draftFilters.minimumRoas}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  minimumRoas: Number(event.target.value),
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              checked={draftFilters.onlyWithSpend}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  onlyWithSpend: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <span>
              <span className="block text-xs font-medium text-foreground">Chỉ dòng có chi tiêu</span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">Ẩn draft/chưa phân phối</span>
            </span>
          </label>
        </div>
      </AdsModal>

      <AdsModal
        open={activeOverlay === "columns"}
        title="Tùy chỉnh cột"
        description="Tên và trạng thái luôn được giữ cố định để dễ theo dõi."
        onClose={onClose}
        footer={
          <>
            <AdsButton
              variant="ghost"
              onClick={() => setDraftColumns(columnOptions.map((column) => column.id))}
            >
              Chọn tất cả
            </AdsButton>
            <AdsButton
              variant="primary"
              disabled={draftColumns.length === 0}
              onClick={() => {
                onApplyColumns(draftColumns);
                onClose();
              }}
            >
              Lưu cấu hình cột
            </AdsButton>
          </>
        }
      >
        <div className="space-y-2">
          {columnOptions.map((column) => (
            <label
              key={column.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={draftColumns.includes(column.id)}
                onChange={(event) =>
                  setDraftColumns((current) =>
                    event.target.checked
                      ? [...current, column.id]
                      : current.filter((id) => id !== column.id),
                  )
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <span>
                <span className="block text-xs font-medium text-foreground">{column.label}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">{column.description}</span>
              </span>
            </label>
          ))}
        </div>
      </AdsModal>

      <AdsModal
        open={activeOverlay === "export"}
        title="Xuất dữ liệu"
        description="Tạo file CSV UTF-8 từ dữ liệu mẫu đang hiển thị."
        onClose={onClose}
        footer={
          <>
            <AdsButton variant="ghost" onClick={onClose}>Hủy</AdsButton>
            <AdsButton
              variant="primary"
              startIcon={<Download size={15} />}
              disabled={exportScope === "selected" && selectedCount === 0}
              onClick={() => {
                onExport(exportScope);
                onClose();
              }}
            >
              Tải CSV
            </AdsButton>
          </>
        }
      >
        <div className="space-y-3">
          {[
            {
              value: "visible" as const,
              title: "Dữ liệu đang hiển thị",
              description: "Tôn trọng tab, tìm kiếm và bộ lọc hiện tại.",
            },
            {
              value: "selected" as const,
              title: `Các dòng đã chọn (${selectedCount})`,
              description: "Chỉ xuất những campaign/ad set/ad đã chọn.",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setExportScope(option.value)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                exportScope === option.value
                  ? "border-primary bg-accent"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-primary shadow-theme-xs">
                <FileSpreadsheet size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-foreground">{option.title}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{option.description}</span>
              </span>
              {exportScope === option.value && <Check size={17} className="ml-auto text-primary" />}
            </button>
          ))}
        </div>
      </AdsModal>

      <AdsDrawer
        open={activeOverlay === "details" && Boolean(activeEntity)}
        title={activeEntity?.name || "Chi tiết"}
        description={activeEntity ? `${activeEntity.id} · ${activeEntity.updatedAt}` : undefined}
        width="md"
        onClose={onClose}
        footer={
          <>
            <AdsButton variant="ghost" onClick={onClose}>Đóng</AdsButton>
            <AdsButton variant="primary">Chỉnh sửa nhanh</AdsButton>
          </>
        }
      >
        {activeEntity && (
          <div className="space-y-5">
            <MockNotice compact />
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Trạng thái", activeEntity.status],
                ["Mục tiêu", activeEntity.objective],
                ["Chi tiêu", new Intl.NumberFormat("vi-VN").format(activeEntity.spend)],
                ["Kết quả", new Intl.NumberFormat("vi-VN").format(activeEntity.results)],
                ["CTR", `${activeEntity.ctr.toFixed(2)}%`],
                ["ROAS", activeEntity.roas ? `${activeEntity.roas.toFixed(2)}x` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border p-3">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <section>
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-warning-500" />
                <h3 className="text-sm font-semibold text-foreground">Gợi ý theo dữ liệu mẫu</h3>
              </div>
              <div className="mt-3 rounded-xl bg-muted/60 p-4">
                <p className="text-xs leading-5 text-muted-foreground">
                  Theo dõi thêm 24 giờ trước khi thay đổi ngân sách. Đây là gợi ý mô phỏng, không phải cam kết hiệu quả.
                </p>
              </div>
            </section>
          </div>
        )}
      </AdsDrawer>

      <AdsModal
        open={activeOverlay === "bulk-active" || activeOverlay === "bulk-paused"}
        title={activeOverlay === "bulk-active" ? "Bật các mục đã chọn?" : "Tạm dừng các mục đã chọn?"}
        description={`${selectedCount} mục trong bảng hiện tại sẽ thay đổi trạng thái mock.`}
        size="sm"
        onClose={onClose}
        footer={
          <>
            <AdsButton variant="ghost" onClick={onClose}>Hủy</AdsButton>
            <AdsButton
              variant={activeOverlay === "bulk-paused" ? "danger" : "primary"}
              startIcon={activeOverlay === "bulk-active" ? <Play size={15} /> : <Pause size={15} />}
              onClick={() => {
                onApplyBulkStatus(activeOverlay === "bulk-active" ? "ACTIVE" : "PAUSED");
                onClose();
              }}
            >
              Xác nhận
            </AdsButton>
          </>
        }
      >
        <MockNotice />
      </AdsModal>
    </>
  );
}
