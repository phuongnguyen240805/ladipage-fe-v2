"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BarChart2,
  BellRing,
  CalendarDays,
  ChevronDown,
  Coins,
  Columns3,
  Copy,
  EyeOff,
  FilePenLine,
  FileText,
  Filter,
  Globe2,
  Info,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  SlidersHorizontal,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { facebookAdsRepository } from "../../api/facebook-ads.repository";
import { useFacebookAdsRuntime } from "../../runtime/FacebookAdsRuntimeProvider";
import {
  FacebookAdsBlockingState,
  FacebookAdsInlineState,
  FacebookAdsLoadingState,
} from "../../shared/components/FacebookAdsDataState";
import FacebookAdsMockBadge from "../../shared/components/FacebookAdsMockBadge";
import { adAccountRows, bmRows, campaignRows, pageRows, type CampaignLevel, type Workspace } from "../exact-data";
import { adsPlatformRepository } from "../../../ads-platform/api/ads-platform.repository";
import type { AdsAccount } from "../../../ads-platform/contracts";

const LIVE_MODE = process.env.NEXT_PUBLIC_ADS_PLATFORM_MODE === "live";

const workspaceTabs: Workspace[] = ["AD", "BM", "PAGE", "CAMP"];
const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const statusClass = (status: string) => {
  if (/hoạt động|đã đăng/i.test(status)) return "is-success";
  if (/đóng|vô hiệu|hạn chế/i.test(status)) return "is-danger";
  if (/duyệt|xem xét/i.test(status)) return "is-info";
  return "is-warning";
};

export type AdsManagerPageProps = {
  initialWorkspace?: Workspace;
  navigationOpen?: boolean;
  onOpenNavigation?: () => void;
};

export default function AdsManagerPage({
  initialWorkspace = "AD",
  navigationOpen = false,
  onOpenNavigation,
}: AdsManagerPageProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currencyMode, setCurrencyMode] = useState<"Gốc" | "VND" | "USD">("Gốc");
  const [usdRate, setUsdRate] = useState(26254);
  const [clientMargin, setClientMargin] = useState("0");
  const [showUsdPopover, setShowUsdPopover] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignLevel, setCampaignLevel] = useState<CampaignLevel>("campaign");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("7d");
  const [savedView, setSavedView] = useState("performance");
  const [compare, setCompare] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const runtime = useFacebookAdsRuntime();
  const [liveFixture, setLiveFixture] = useState({
    adAccounts: [] as typeof adAccountRows,
    businesses: [] as typeof bmRows,
    pages: [] as typeof pageRows,
    campaigns: [] as typeof campaignRows,
  });
  const [liveAccounts, setLiveAccounts] = useState<AdsAccount[]>([]);
  useEffect(() => {
    if (!LIVE_MODE) return;
    void adsPlatformRepository.listAccounts()
      .then(async (accounts) => {
        const metaAccounts = accounts.filter((account) => account.provider === "META");
        setLiveAccounts(metaAccounts);
        const snapshotGroups = await Promise.all(
          metaAccounts.map((account) => adsPlatformRepository.listSnapshots("META", account.externalId, 20)),
        );
        const campaignData = snapshotGroups.flatMap((snapshots, accountIndex) =>
          snapshots
            .filter((snapshot) => snapshot.source === "OFFICIAL_API" && snapshot.payload.resource === "CAMPAIGNS")
            .flatMap((snapshot) => Array.isArray(snapshot.payload.rows) ? snapshot.payload.rows : [])
            .map((raw) => {
              const row = raw as Record<string, unknown>;
              return {
                id: String(row.id ?? ""),
                level: "campaign" as const,
                name: String(row.name ?? row.id ?? "Campaign"),
                account: metaAccounts[accountIndex]?.name ?? "Meta account",
                status: String(row.effective_status ?? row.status) === "ACTIVE" ? "Hoạt động" : "Tạm dừng",
                objective: String(row.objective ?? "—"),
                budget: Number(row.daily_budget ?? row.lifetime_budget ?? 0),
                spend: 0,
                results: 0,
                cpr: 0,
                reach: 0,
                ctr: 0,
                roas: 0,
              };
            }),
        );
        setLiveFixture({
          adAccounts: metaAccounts.map((account) => ({
            id: account.externalId,
            status: account.status === "1" ? "Hoạt động" : "Đang duyệt",
            ownerId: account.connectionId,
            name: account.name,
            balance: 0,
            threshold: "—",
            thresholdRemaining: "—",
            limit: 0,
            spendCap: "—",
            spend: 0,
            admins: "—",
            role: "OAuth",
            currency: account.currency ?? "—",
            type: "Business",
            card: "—",
            nextBill: "—",
            timezone: account.timezone ?? "UTC",
            createdAt: "—",
          })) as typeof adAccountRows,
          businesses: [] as unknown as typeof bmRows,
          pages: [] as unknown as typeof pageRows,
          campaigns: campaignData as unknown as typeof campaignRows,
        });
      })
      .catch(() => setLiveFixture({ adAccounts: [], businesses: [], pages: [], campaigns: [] }));
  }, []);
  const fixture = useMemo(
    () => LIVE_MODE ? liveFixture : facebookAdsRepository.getManagerSnapshot(runtime.scenario),
    [liveFixture, runtime.scenario],
  );

  const normalized = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const campaignSource = fixture.campaigns
      .filter((row) => row.level === campaignLevel)
      .map((row) => ({ ...row, status: statusOverrides[row.id] ?? row.status }));
    const source = workspace === "AD" ? fixture.adAccounts : workspace === "BM" ? fixture.businesses : workspace === "PAGE" ? fixture.pages : campaignSource;
    if (!normalized) return source;
    return source.filter((row) => JSON.stringify(row).toLowerCase().includes(normalized));
  }, [workspace, campaignLevel, fixture, normalized, statusOverrides]);

  const selectedCount = selectedIds.length;
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const selectAll = () => setSelectedIds((current) => current.length === rows.length ? [] : rows.map((row) => String(row.id)));
  const switchWorkspace = (value: Workspace) => { setWorkspace(value); setSelectedIds([]); setQuery(""); };
  const refresh = () => {
    setRefreshing(true);
    if (!LIVE_MODE) {
      window.setTimeout(() => setRefreshing(false), 700);
      return;
    }
    const account = liveAccounts[0];
    if (!account) {
      setRefreshing(false);
      return;
    }
    void adsPlatformRepository.createSyncJob({
      provider: "META",
      connectionId: account.connectionId,
      externalAccountId: account.externalId,
      resource: "CAMPAIGNS",
      idempotencyKey: `meta-sync:${account.externalId}:${new Date().toISOString().slice(0, 16)}`,
    }).then(async (job) => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const current = await adsPlatformRepository.getJob(job.id);
        if (["SUCCEEDED", "PARTIAL", "FAILED", "CANCELLED"].includes(current.state)) break;
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }
      window.location.reload();
    }).catch(() => setRefreshing(false));
  };
  const setCampaignStatus = (id: string, status: string) => {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  };
  const setSelectedCampaignStatus = (status: string) => {
    setStatusOverrides((current) => ({
      ...current,
      ...Object.fromEntries(selectedIds.map((id) => [id, status])),
    }));
  };
  const showBlockingState = ["disconnected", "permission-denied"].includes(runtime.scenario);

  return (
    <div className="adsmeta-manager-page">
      <div className="adsmeta-manager-inner">
        <section className="adsmeta-workspace-toolbar">
          {onOpenNavigation && (
            <button
              type="button"
              className="adsmeta-navigation-trigger"
              aria-label="Mở menu Facebook Ads"
              aria-expanded={navigationOpen}
              onClick={onOpenNavigation}
            >
              <Menu aria-hidden="true" size={17} />
            </button>
          )}
          <div className="adsmeta-workspace-tabs">
            {workspaceTabs.map((tab) => (
              <button key={tab} type="button" onClick={() => switchWorkspace(tab)} className={workspace === tab ? "is-active" : ""}>
                {tab}{tab !== "AD" && <span>NEW</span>}
              </button>
            ))}
          </div>
          <FacebookAdsMockBadge />
          <div className="adsmeta-toolbar-divider" />
          <label className="adsmeta-toolbar-search"><Search size={14} /><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder={workspace === "AD" ? "Tìm TKQC theo tên, ID, chủ sở hữu..." : `Tìm trong ${workspace}...`} />{query && <button type="button" onClick={() => setQuery("")}><X size={12} /></button>}</label>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-500 hover:bg-lime-600 text-white rounded-full text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <span>✓ {selectedCount} đã chọn</span>
              <X size={12} className="opacity-80 hover:opacity-100" />
            </button>
          )}
          <div className="relative">
            <button type="button" className="adsmeta-toolbar-button" onClick={() => setShowAlerts((value) => !value)}><BellRing size={14} /> Cảnh báo <b>3</b></button>
            {showAlerts && <AlertsPopover onClose={() => setShowAlerts(false)} />}
          </div>
          <button type="button" className="adsmeta-toolbar-button"><Globe2 size={14} /> Tiền gốc</button>
          <button type="button" className="adsmeta-toolbar-square" onClick={() => setCurrencyMode((value) => value === "Gốc" ? "VND" : value === "VND" ? "USD" : "Gốc")}>{currencyMode === "Gốc" ? "đ" : currencyMode}</button>
          <div className="relative">
            <button
              type="button"
              className="adsmeta-toolbar-button hidden sm:inline-flex"
              onClick={() => setShowUsdPopover((value) => !value)}
            >
              USD <b>{usdRate.toLocaleString("vi-VN")}đ</b>
            </button>
            {showUsdPopover && (
              <UsdRatePopover
                rate={usdRate}
                margin={clientMargin}
                onApplyRate={(rate) => setUsdRate(rate)}
                onApplyMargin={(margin) => setClientMargin(margin)}
                onClose={() => setShowUsdPopover(false)}
              />
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="adsmeta-toolbar-button"><SlidersHorizontal size={14} /> Tối đa <ChevronDown size={12} /></button>
            <div className="relative">
              <button type="button" className="adsmeta-toolbar-button" onClick={() => setShowColumns((value) => !value)}><EyeOff size={14} /> Ẩn cột</button>
              {showColumns && <ColumnsPopover hidden={hiddenColumns} onToggle={(column) => setHiddenColumns((current) => current.includes(column) ? current.filter((value) => value !== column) : [...current, column])} onClose={() => setShowColumns(false)} />}
            </div>
            <button type="button" className="adsmeta-toolbar-icon" onClick={refresh} title="Tải lại"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /></button>
          </div>
        </section>

        {workspace === "CAMP" && (
          <>
            <CampaignActionBar
              level={campaignLevel}
              selectedCount={selectedCount}
              campaignSource={fixture.campaigns}
              onLevelChange={(level) => { setCampaignLevel(level); setSelectedIds([]); }}
              onBulkStatus={setSelectedCampaignStatus}
            />
            <CampaignViewBar
              dateRange={dateRange}
              savedView={savedView}
              compare={compare}
              onDateRangeChange={setDateRange}
              onSavedViewChange={setSavedView}
              onCompareChange={setCompare}
            />
          </>
        )}

        <section className="adsmeta-grid-card">
          <FacebookAdsInlineState scenario={runtime.scenario} />
          {runtime.dataState === "loading" ? (
            <FacebookAdsLoadingState />
          ) : showBlockingState || runtime.dataState === "empty" ? (
            <FacebookAdsBlockingState scenario={runtime.scenario} />
          ) : (
            <>
              <div className="adsmeta-grid-scroll">
                {workspace === "AD" && <AdAccountsTable rows={rows as typeof adAccountRows} selectedIds={selectedIds} hiddenColumns={hiddenColumns} onSelect={toggleSelected} onSelectAll={selectAll} onOpenUsdPopover={() => setShowUsdPopover(true)} />}
                {workspace === "BM" && <BusinessTable rows={rows as typeof bmRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} />}
                {workspace === "PAGE" && <PagesTable rows={rows as typeof pageRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} />}
                {workspace === "CAMP" && <CampaignTable rows={rows as unknown as typeof campaignRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} onToggleStatus={(id, active) => setCampaignStatus(id, active ? "Tạm dừng" : "Hoạt động")} />}
              </div>
              <ManagerFooter workspace={workspace} rows={rows} selectedCount={selectedCount} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function HeaderCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) { return <input type="checkbox" checked={checked} onChange={onChange} className="adsmeta-checkbox cursor-pointer" />; }
function RowCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) { return <input type="checkbox" checked={checked} onChange={onChange} onClick={(event: MouseEvent<HTMLInputElement>) => event.stopPropagation()} className="adsmeta-checkbox cursor-pointer" />; }
function StatusBadge({ value }: { value: string }) { return <span className={`ladi-status-badge adsmeta-status ${statusClass(value)}`}><i />{value}</span>; }

function ActionColumnGroup({
  onAnalytics,
  onBilling,
  onShare,
}: {
  onAnalytics?: () => void;
  onBilling?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="Xem báo cáo & hiệu suất"
        className="w-5.5 h-5.5 inline-flex items-center justify-center rounded-md bg-[#18233a] hover:bg-[#233355] text-blue-400 transition-colors border-0"
        onClick={(e) => {
          e.stopPropagation();
          onAnalytics?.();
        }}
      >
        <BarChart2 size={12} />
      </button>
      <button
        type="button"
        title="Tỷ giá & tài chính"
        className="w-5.5 h-5.5 inline-flex items-center justify-center rounded-md bg-[#2a1d13] hover:bg-[#3d2a1b] text-amber-400 transition-colors border-0"
        onClick={(e) => {
          e.stopPropagation();
          onBilling?.();
        }}
      >
        <Coins size={12} />
      </button>
      <button
        type="button"
        title="Chia sẻ & phân quyền"
        className="w-5.5 h-5.5 inline-flex items-center justify-center rounded-md bg-[#11261d] hover:bg-[#1a3a2c] text-emerald-400 transition-colors border-0"
        onClick={(e) => {
          e.stopPropagation();
          onShare?.();
        }}
      >
        <Share2 size={12} />
      </button>
    </div>
  );
}

function AdAccountsTable({
  rows,
  selectedIds,
  hiddenColumns,
  onSelect,
  onSelectAll,
  onOpenUsdPopover,
}: {
  rows: typeof adAccountRows;
  selectedIds: string[];
  hiddenColumns: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onOpenUsdPopover: () => void;
}) {
  const hidden = (name: string) => hiddenColumns.includes(name);

  return (
    <table className="adsmeta-data-grid min-w-[1780px]">
      <thead><tr>
        <th className="w-10"><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th className="w-12">#</th><th>Trạng thái</th><th>Hành động</th><th>ID Tài khoản</th>{!hidden("Chủ sở hữu") && <th>Chủ sở hữu</th>}<th>Tên tài khoản</th><th className="text-right">Số dư</th>{!hidden("Ngưỡng") && <th className="text-right">Ngưỡng</th>}<th className="text-right">Ngưỡng còn lại</th><th className="text-right">Hạn mức</th><th>Giới hạn chi tiêu</th><th className="text-right">Chi tiêu</th><th>Admin</th><th>Quyền</th><th>Tiền tệ</th><th>Loại</th><th>Thẻ thanh toán</th><th>Bill tiếp</th><th>Múi giờ</th><th>Ngày tạo</th><th>Tạo QC</th><th />
      </tr></thead>
      <tbody>{rows.map((row, index) => {
        const selected = selectedIds.includes(row.id);
        return <tr key={row.id} className={selected ? "is-selected" : ""}>
          <td className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(row.id); }}><RowCheckbox checked={selected} onChange={() => onSelect(row.id)} /></td><td className="text-slate-400">{index + 1}</td><td><StatusBadge value={row.status} /></td><td><ActionColumnGroup onAnalytics={() => alert(`Hiệu suất TK: ${row.name}`)} onBilling={onOpenUsdPopover} onShare={() => alert(`Chia sẻ TK: ${row.name}`)} /></td><td className="font-mono text-blue-500">{row.id}</td>{!hidden("Chủ sở hữu") && <td className="font-mono text-slate-500">{row.ownerId}</td>}<td className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</td><td className="text-right font-semibold">{money(row.balance)}</td>{!hidden("Ngưỡng") && <td className="text-right">{row.threshold}</td>}<td className="text-right">{row.thresholdRemaining}</td><td className="text-right font-semibold">{money(row.limit)}đ</td><td>{row.spendCap}</td><td className="text-right font-semibold">{money(row.spend)}đ</td><td><button className="adsmeta-admin-pill" onClick={(e) => e.stopPropagation()}>{row.admins}</button></td><td>{row.role}</td><td>{row.currency}</td><td><span className="adsmeta-type-pill">{row.type}</span></td><td>{row.card}</td><td>{row.nextBill}</td><td>{row.timezone}</td><td>{row.createdAt}</td><td><button className="adsmeta-boost" onClick={(e) => e.stopPropagation()}>Boost</button></td><td><button className="adsmeta-row-icon" onClick={(e) => e.stopPropagation()}><Settings2 size={14} /></button></td>
        </tr>;
      })}</tbody>
      <tfoot><tr><td>∑</td><td colSpan={5}><b>Tổng ({rows.length})</b></td><td className="text-right font-bold">{money(rows.reduce((sum, row) => sum + row.balance, 0))}đ</td><td colSpan={4} /><td className="text-right font-bold">{money(rows.reduce((sum, row) => sum + row.spend, 0))}đ</td><td colSpan={11} /></tr></tfoot>
    </table>
  );
}

function BusinessTable({ rows, selectedIds, onSelect, onSelectAll }: { rows: typeof bmRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  return <table className="adsmeta-data-grid min-w-[1250px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>#</th><th>Trạng thái</th><th>BM ID</th><th>Tên Business Manager</th><th>Cấp độ</th><th className="text-right">TKQC</th><th className="text-right">Fanpage</th><th className="text-right">Admin</th><th>Xác minh</th><th className="text-right">Hạn mức</th><th>Ngày tạo</th><th>Hành động</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""}><td className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(row.id); }}><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td>{index + 1}</td><td><StatusBadge value={row.status} /></td><td className="font-mono text-blue-500">{row.id}</td><td className="font-semibold">{row.name}</td><td>{row.level}</td><td className="text-right">{row.adAccounts}</td><td className="text-right">{row.pages}</td><td className="text-right">{row.admins}</td><td>{row.verified}</td><td className="text-right">{row.limit}</td><td>{row.createdAt}</td><td><ActionColumnGroup onAnalytics={() => alert(`Báo cáo BM: ${row.name}`)} onBilling={() => alert(`Tài chính BM: ${row.name}`)} onShare={() => alert(`Chia sẻ BM: ${row.name}`)} /></td></tr>)}</tbody></table>;
}

function PagesTable({ rows, selectedIds, onSelect, onSelectAll }: { rows: typeof pageRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  return <table className="adsmeta-data-grid min-w-[1250px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>#</th><th>Trạng thái</th><th>Page ID</th><th>Tên Fanpage</th><th>Business Manager</th><th className="text-right">Người theo dõi</th><th>Quảng cáo</th><th>Danh mục</th><th className="text-right">Admin</th><th>Ngày tạo</th><th>Hành động</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""}><td className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(row.id); }}><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td>{index + 1}</td><td><StatusBadge value={row.status} /></td><td className="font-mono text-blue-500">{row.id}</td><td className="font-semibold">{row.name}</td><td>{row.bm}</td><td className="text-right font-semibold">{money(row.followers)}</td><td>{row.promotable}</td><td>{row.category}</td><td className="text-right">{row.admins}</td><td>{row.createdAt}</td><td><ActionColumnGroup onAnalytics={() => alert(`Báo cáo Page: ${row.name}`)} onBilling={() => alert(`Quảng cáo Page: ${row.name}`)} onShare={() => alert(`Quản lý Page: ${row.name}`)} /></td></tr>)}</tbody></table>;
}

function CampaignTable({ rows, selectedIds, onSelect, onSelectAll, onToggleStatus }: { rows: typeof campaignRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void; onToggleStatus: (id: string, active: boolean) => void }) {
  return <table className="adsmeta-data-grid min-w-[1450px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>Bật/Tắt</th><th>Tên</th><th>ID</th><th>Tài khoản</th><th>Phân phối</th><th>Mục tiêu</th><th className="text-right">Ngân sách</th><th className="text-right">Chi tiêu</th><th className="text-right">Kết quả</th><th className="text-right">Chi phí/KQ</th><th className="text-right">Tiếp cận</th><th className="text-right">CTR</th><th className="text-right">ROAS</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""}><td className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(row.id); }}><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td><button type="button" aria-label={`${row.status === "Hoạt động" ? "Tắt" : "Bật"} ${row.name}`} className={`adsmeta-switch ${row.status === "Hoạt động" ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); onToggleStatus(row.id, row.status === "Hoạt động"); }}><i /></button></td><td className="font-semibold">{row.name}</td><td className="font-mono text-blue-500">{row.id}</td><td>{row.account}</td><td><StatusBadge value={row.status} /></td><td>{row.objective}</td><td className="text-right">{row.budget ? `${money(row.budget)}đ` : "—"}</td><td className="text-right font-semibold">{money(row.spend)}đ</td><td className="text-right">{row.results}</td><td className="text-right">{row.cpr ? `${money(row.cpr)}đ` : "—"}</td><td className="text-right">{money(row.reach)}</td><td className="text-right">{row.ctr.toFixed(2)}%</td><td className="text-right font-semibold">{row.roas ? `${row.roas.toFixed(2)}x` : "—"}</td></tr>)}</tbody></table>;
}

function CampaignActionBar({ level, selectedCount, campaignSource, onLevelChange, onBulkStatus }: { level: CampaignLevel; selectedCount: number; campaignSource: typeof campaignRows; onLevelChange: (level: CampaignLevel) => void; onBulkStatus: (status: string) => void }) {
  const tabs: Array<[CampaignLevel, string]> = [["campaign", "Chiến dịch"], ["adset", "Nhóm QC"], ["ad", "Quảng cáo"]];
  return <section className="adsmeta-campaign-bar"><div className="adsmeta-campaign-levels">{tabs.map(([value, label]) => <button key={value} type="button" className={level === value ? "is-active" : ""} onClick={() => onLevelChange(value)}>{label} <b>{campaignSource.filter((row) => row.level === value).length}</b></button>)}</div><div className="adsmeta-campaign-actions"><Link href="/facebook-ads/create" className="is-create"><Plus size={13} />Tạo</Link><button disabled={!selectedCount} className="is-enable" onClick={() => onBulkStatus("Hoạt động")}><Play size={12} />Bật ({selectedCount})</button><button disabled={!selectedCount} className="is-pause" onClick={() => onBulkStatus("Tạm dừng")}><Pause size={12} />Tắt ({selectedCount})</button><button disabled={!selectedCount}><WandSparkles size={13} />Phân tích <span>NEW</span></button><button disabled={!selectedCount}><FilePenLine size={13} />Sửa</button><button disabled={!selectedCount}><CalendarDays size={13} />Hẹn giờ</button><button disabled={!selectedCount}><Copy size={13} />Nhân bản sang TK khác <span>NEW</span></button><button disabled={!selectedCount} className="is-delete"><Trash2 size={13} />Xóa ({selectedCount})</button></div></section>;
}

function CampaignViewBar({ dateRange, savedView, compare, onDateRangeChange, onSavedViewChange, onCompareChange }: { dateRange: string; savedView: string; compare: boolean; onDateRangeChange: (value: string) => void; onSavedViewChange: (value: string) => void; onCompareChange: (value: boolean) => void }) {
  return <section className="adsmeta-campaign-viewbar"><label><span>Chế độ xem</span><select value={savedView} onChange={(event) => onSavedViewChange(event.target.value)}><option value="performance">Hiệu suất</option><option value="delivery">Phân phối</option><option value="creative">Nội dung</option></select></label><label><CalendarDays size={12}/><select aria-label="Khoảng ngày" value={dateRange} onChange={(event) => onDateRangeChange(event.target.value)}><option value="today">Hôm nay</option><option value="7d">7 ngày qua</option><option value="30d">30 ngày qua</option></select></label><label className="is-check"><input type="checkbox" checked={compare} onChange={(event) => onCompareChange(event.target.checked)}/><span>So sánh kỳ trước</span></label><button type="button"><Filter size={12}/>Bộ lọc: Đang phân phối</button><button type="button"><Columns3 size={12}/>Cột tùy chỉnh</button><span className="ml-auto">Mô hình phân bổ: <b>7 ngày nhấp · 1 ngày xem</b></span></section>;
}

function ManagerFooter({ workspace, rows, selectedCount }: { workspace: Workspace; rows: readonly unknown[]; selectedCount: number }) {
  const active = workspace === "AD" ? (rows as typeof adAccountRows).filter((row) => row.status === "Hoạt động").length : rows.length;
  const dead = workspace === "AD" ? (rows as typeof adAccountRows).filter((row) => row.status !== "Hoạt động").length : 0;
  return <footer className="adsmeta-manager-footer"><div className="adsmeta-footer-stat"><span className="bg-emerald-500" />Live <b>{active}</b></div><div className="adsmeta-footer-stat"><span className="bg-red-500" />Die <b>{dead}</b></div><div className="adsmeta-footer-separator" /><span>Hiển thị <b>{rows.length}</b> dòng</span><span>Đã chọn <b className="text-lime-500">{selectedCount}</b></span><span className="ml-auto">Cập nhật lúc <b>21:59:42</b></span></footer>;
}

function AlertsPopover({ onClose }: { onClose: () => void }) { return <div className="adsmeta-popover adsmeta-alerts-popover"><div className="adsmeta-popover-head"><b>Cảnh báo tài khoản</b><button onClick={onClose}><X size={13} /></button></div>{[["Số dư thấp", "1 tài khoản còn dưới 500.000đ", "warning"], ["Tài khoản bị đóng", "1 tài khoản cần kiểm tra", "danger"], ["Gần hạn mức", "1 tài khoản đã dùng trên 70%", "info"]].map(([title, body, type]) => <div key={title} className={`adsmeta-alert-item is-${type}`}><AlertTriangle size={14} /><span><b>{title}</b><small>{body}</small></span></div>)}</div>; }
function ColumnsPopover({ hidden, onToggle, onClose }: { hidden: string[]; onToggle: (column: string) => void; onClose: () => void }) { const columns = ["Chủ sở hữu", "Ngưỡng", "Ngưỡng còn lại", "Hạn mức", "Chi tiêu", "Admin", "Thẻ thanh toán", "Múi giờ", "Ngày tạo"]; return <div className="adsmeta-popover adsmeta-columns-popover"><div className="adsmeta-popover-head"><b><Columns3 size={14} /> Tùy chỉnh cột</b><button onClick={onClose}><X size={13} /></button></div><label className="adsmeta-column-search"><Search size={13} /><input placeholder="Tìm tên cột..." /></label><div>{columns.map((column) => <label key={column}><input type="checkbox" checked={!hidden.includes(column)} onChange={() => onToggle(column)} /><span>{column}</span></label>)}</div><button type="button" className="adsmeta-reset-columns" onClick={() => hidden.forEach(onToggle)}><Filter size={13} /> Khôi phục mặc định</button></div>; }

function UsdRatePopover({
  rate,
  margin,
  onApplyRate,
  onApplyMargin,
  onClose,
}: {
  rate: number;
  margin: string;
  onApplyRate: (rate: number) => void;
  onApplyMargin: (margin: string) => void;
  onClose: () => void;
}) {
  const [inputRate, setInputRate] = useState(String(rate));
  const [inputMargin, setInputMargin] = useState(margin);

  return (
    <div className="absolute right-0 top-full mt-2 z-[300] w-[340px] rounded-2xl bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#374151] shadow-2xl p-4 font-sans text-left">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tỷ giá USD tự đặt</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            Số VND cho 1 USD. Chỉ ảnh hưởng <b className="text-slate-800 dark:text-slate-200">hiển thị</b> — không ảnh hưởng tiền nạp/nâng cấp.
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1">
          <X size={15} />
        </button>
      </div>

      <div className="mt-3 flex items-center border border-slate-200 dark:border-[#374151] rounded-xl bg-slate-50 dark:bg-[#1f2937] px-3 py-2 focus-within:border-lime-500">
        <input
          type="number"
          value={inputRate}
          onChange={(e) => setInputRate(e.target.value)}
          className="w-full bg-transparent text-slate-900 dark:text-white font-mono font-bold text-base outline-none"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold ml-2 shrink-0">đ/USD</span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            onApplyRate(Number(inputRate) || 26254);
            onClose();
          }}
          className="flex-1 bg-lime-500 hover:bg-lime-600 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
        >
          Áp dụng
        </button>
        <button
          type="button"
          onClick={() => {
            setInputRate("26254");
            onApplyRate(26254);
          }}
          className="flex-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold py-2 transition-colors cursor-pointer"
        >
          Tỷ giá live
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151] rounded-xl p-3 mt-3 text-xs">
        <div className="flex items-start gap-2">
          <Info size={15} className="text-lime-400 shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-300 leading-normal">
            Chỉ đổi cột <b>đ (VND)</b> của tài khoản <b>tiền USD</b>. Tài khoản gốc VND xem ở "Tiền gốc" sẽ không đổi.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-lime-400 hover:underline font-semibold mt-2 block text-xs cursor-pointer"
        >
          → Xem theo đ (VND) để thấy quy đổi
        </button>
      </div>

      <div className="border-b border-slate-200 dark:border-[#374151] my-3.5" />

      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <FileText size={14} className="text-slate-500 dark:text-slate-400" /> Báo khách (cộng biên)
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
          Rồi chọn "Báo khách (đ)" ở menu tiền tệ. USD dùng tỷ giá phía trên (nâng lên để cộng biên).
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">+% biên (TK gốc đ)</span>
          <div className="flex items-center border border-slate-200 dark:border-[#374151] rounded-lg bg-slate-50 dark:bg-[#1f2937] px-2.5 py-1 w-24">
            <input
              type="number"
              value={inputMargin}
              onChange={(e) => setInputMargin(e.target.value)}
              className="w-full bg-transparent text-slate-900 dark:text-white font-mono text-xs text-right outline-none"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onApplyMargin(inputMargin);
          onClose();
        }}
        className="w-full mt-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
      >
        Lưu & xem Báo khách
      </button>
    </div>
  );
}
