"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Columns3,
  LayoutList,
  ListFilter,
  Menu,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsManagerTable from "./AdsManagerTable";
import AdsMetricsSummary from "./AdsMetricsSummary";
import AdsManagerOverlays, {
  type AdsManagerOverlay,
} from "./AdsManagerOverlays";
import {
  mockAdsAccounts,
  mockAdsEntities,
  mockAdsSummary,
} from "../mock-data";
import type {
  AdsEntityLevel,
  AdsManagerEntity,
  AdsManagerFilters,
  AdsTableColumnId,
} from "../types";

type AdsManagerPageProps = {
  navigationOpen?: boolean;
  onOpenNavigation?: () => void;
};

const levelLabels: Record<AdsEntityLevel, string> = {
  campaign: "Chiến dịch",
  adset: "Nhóm quảng cáo",
  ad: "Quảng cáo",
};

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "IN_REVIEW", label: "Đang xét duyệt" },
  { value: "WITH_ISSUES", label: "Có vấn đề" },
];

export default function AdsManagerPage({
  navigationOpen = false,
  onOpenNavigation,
}: AdsManagerPageProps = {}) {
  const [activeLevel, setActiveLevel] = useState<AdsEntityLevel>("campaign");
  const [activeAccountId, setActiveAccountId] = useState(mockAdsAccounts[0].id);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AdsManagerFilters>({
    status: "ALL",
    objective: "ALL",
    minimumRoas: 0,
    onlyWithSpend: false,
  });
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rows, setRows] = useState(mockAdsEntities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<AdsManagerOverlay>(null);
  const [activeEntity, setActiveEntity] = useState<AdsManagerEntity | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<AdsTableColumnId[]>([
    "objective",
    "budget",
    "spend",
    "results",
    "costPerResult",
    "impressions",
    "ctr",
    "roas",
  ]);
  const [dateRange, setDateRange] = useState({
    from: "2026-07-01",
    to: "2026-07-29",
    label: "01/07 – 29/07/2026",
  });

  const activeAccount =
    mockAdsAccounts.find((account) => account.id === activeAccountId) ||
    mockAdsAccounts[0];

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    return rows.filter((row) => {
      const matchesLevel = row.level === activeLevel;
      const matchesStatus = filters.status === "ALL" || row.status === filters.status;
      const matchesObjective =
        filters.objective === "ALL" || row.objective === filters.objective;
      const matchesRoas = row.roas >= filters.minimumRoas;
      const matchesSpend = !filters.onlyWithSpend || row.spend > 0;
      const matchesSearch =
        !normalizedSearch ||
        row.name.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        row.parentName?.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        row.id.toLocaleLowerCase("vi").includes(normalizedSearch);
      return (
        matchesLevel &&
        matchesStatus &&
        matchesObjective &&
        matchesRoas &&
        matchesSpend &&
        matchesSearch
      );
    });
  }, [activeLevel, filters, rows, search]);

  const handleToggleStatus = (id: string) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              status: row.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
              updatedAt: "Vừa xong",
            }
          : row,
      ),
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 650);
  };

  const handleChangeLevel = (level: AdsEntityLevel) => {
    setActiveLevel(level);
    setSelectedIds([]);
  };

  const handleOpenDetails = (row: AdsManagerEntity) => {
    setActiveEntity(row);
    setActiveOverlay("details");
  };

  const handleApplyBulkStatus = (status: "ACTIVE" | "PAUSED") => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        selectedIds.includes(row.id)
          ? { ...row, status, updatedAt: "Vừa xong" }
          : row,
      ),
    );
    setSelectedIds([]);
  };

  const handleExport = (scope: "visible" | "selected") => {
    const exportRows =
      scope === "selected"
        ? rows.filter((row) => selectedIds.includes(row.id))
        : filteredRows;
    const escapeCell = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const lines = [
      [
        "ID",
        "Tên",
        "Cấp",
        "Trạng thái",
        "Mục tiêu",
        "Ngân sách",
        "Chi tiêu",
        "Kết quả",
        "Hiển thị",
        "CTR",
        "ROAS",
      ].map(escapeCell).join(","),
      ...exportRows.map((row) =>
        [
          row.id,
          row.name,
          row.level,
          row.status,
          row.objective,
          row.budget,
          row.spend,
          row.results,
          row.impressions,
          row.ctr,
          row.roas,
        ].map(escapeCell).join(","),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ads-manager-${dateRange.to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const advancedFilterCount =
    Number(filters.objective !== "ALL") +
    Number(filters.minimumRoas > 0) +
    Number(filters.onlyWithSpend);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {onOpenNavigation && (
              <button
                type="button"
                aria-label="Mở menu Facebook Ads"
                aria-expanded={navigationOpen}
                onClick={onOpenNavigation}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-theme-xs transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu aria-hidden="true" size={18} />
              </button>
            )}
            <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Trình quản lý quảng cáo
              </h1>
              <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
                Dữ liệu mẫu
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Theo dõi hiệu quả và quản lý quảng cáo trong cùng không gian LadiPage.
            </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Hướng dẫn Ads Manager"
              onClick={() => setActiveOverlay("guide")}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <CircleHelp size={17} />
            </button>
            <button
              type="button"
              aria-label="Thông báo"
              onClick={() => setActiveOverlay("notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-card bg-error-500" />
            </button>
            <label className="relative min-w-[260px] flex-1 xl:flex-none">
              <span className="sr-only">Tài khoản quảng cáo</span>
              <select
                value={activeAccountId}
                onChange={(event) => {
                  setActiveAccountId(event.target.value);
                  setSelectedIds([]);
                }}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-xs font-medium text-foreground shadow-theme-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                {mockAdsAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </label>

            <AdsButton
              size="md"
              startIcon={<CalendarDays aria-hidden="true" size={16} />}
              onClick={() => setActiveOverlay("date")}
            >
              {dateRange.label}
            </AdsButton>

            <Link
              href="/facebook-ads/create"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground shadow-theme-xs transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus aria-hidden="true" size={17} />
              Tạo chiến dịch
            </Link>
          </div>
        </header>

        <AdsMetricsSummary summary={mockAdsSummary} currency={activeAccount.currency} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-theme-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1">
                {(Object.keys(levelLabels) as AdsEntityLevel[]).map((level) => {
                  const count = rows.filter((row) => row.level === level).length;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleChangeLevel(level)}
                      className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        activeLevel === level
                          ? "bg-card text-foreground shadow-theme-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {levelLabels[level]}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          activeLevel === level
                            ? "bg-accent text-accent-foreground"
                            : "bg-background/70 text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <AdsButton
                  size="sm"
                  startIcon={
                    <RefreshCw
                      aria-hidden="true"
                      size={15}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                  }
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? "Đang làm mới" : "Làm mới"}
                </AdsButton>
                <AdsButton
                  size="sm"
                  startIcon={<Columns3 aria-hidden="true" size={15} />}
                  onClick={() => setActiveOverlay("columns")}
                >
                  Cột ({visibleColumns.length + 2})
                </AdsButton>
                <AdsButton
                  size="sm"
                  startIcon={<ArrowDownToLine aria-hidden="true" size={15} />}
                  onClick={() => setActiveOverlay("export")}
                >
                  Xuất
                </AdsButton>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <label className="relative min-w-0 flex-1 xl:max-w-md">
                  <span className="sr-only">Tìm kiếm quảng cáo</span>
                  <Search
                    aria-hidden="true"
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Tìm theo tên hoặc ID ${levelLabels[activeLevel].toLowerCase()}…`}
                    className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Xóa từ khóa"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>

                <label className="relative">
                  <span className="sr-only">Lọc theo trạng thái</span>
                  <ListFilter
                    aria-hidden="true"
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        status: event.target.value as AdsManagerFilters["status"],
                      }))
                    }
                    className="h-9 min-w-[180px] appearance-none rounded-lg border border-border bg-background pl-9 pr-8 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </label>

                <AdsButton
                  size="sm"
                  startIcon={<SlidersHorizontal aria-hidden="true" size={15} />}
                  onClick={() => setActiveOverlay("filters")}
                >
                  Bộ lọc{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}
                </AdsButton>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Mật độ
                </span>
                <div className="flex rounded-lg border border-border bg-background p-0.5">
                  <button
                    type="button"
                    aria-label="Mật độ thoải mái"
                    aria-pressed={density === "comfortable"}
                    onClick={() => setDensity("comfortable")}
                    className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                      density === "comfortable"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutList size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Mật độ thu gọn"
                    aria-pressed={density === "compact"}
                    onClick={() => setDensity("compact")}
                    className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                      density === "compact"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Columns3 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent px-4 py-2.5">
              <p className="text-xs font-medium text-accent-foreground">
                Đã chọn {selectedIds.length} {levelLabels[activeLevel].toLowerCase()}
              </p>
              <div className="flex items-center gap-2">
                <AdsButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveOverlay("bulk-active")}
                >
                  Bật
                </AdsButton>
                <AdsButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveOverlay("bulk-paused")}
                >
                  Tạm dừng
                </AdsButton>
                <AdsButton size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                  Bỏ chọn
                </AdsButton>
              </div>
            </div>
          )}

          <AdsManagerTable
            rows={filteredRows}
            selectedIds={selectedIds}
            density={density}
            currency={activeAccount.currency}
            visibleColumns={visibleColumns}
            onSelectionChange={setSelectedIds}
            onToggleStatus={handleToggleStatus}
            onOpenDetails={handleOpenDetails}
          />

          <div className="flex flex-col gap-1 px-1 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Dữ liệu mẫu phục vụ kiểm tra UI/UX, chưa kết nối hoặc thay đổi quảng cáo thật.
            </p>
            <p>
              Tài khoản: {activeAccount.id} · {activeAccount.timezone}
            </p>
          </div>
        </section>
      </div>
      {activeOverlay && (
        <AdsManagerOverlays
          activeOverlay={activeOverlay}
          activeEntity={activeEntity}
          selectedCount={selectedIds.length}
          visibleColumns={visibleColumns}
          filters={filters}
          dateRange={dateRange}
          onClose={() => setActiveOverlay(null)}
          onApplyColumns={setVisibleColumns}
          onApplyFilters={(nextFilters) => {
            setFilters(nextFilters);
            setSelectedIds([]);
          }}
          onApplyDateRange={setDateRange}
          onExport={handleExport}
          onApplyBulkStatus={handleApplyBulkStatus}
        />
      )}
    </div>
  );
}
