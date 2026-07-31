"use client";

import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  ChevronDown,
  Columns3,
  Copy,
  DollarSign,
  EyeOff,
  FilePenLine,
  Filter,
  Globe2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { adAccountRows, bmRows, campaignRows, pageRows, type CampaignLevel, type Workspace } from "../exact-data";

const workspaceTabs: Workspace[] = ["AD", "BM", "PAGE", "CAMP"];
const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const statusClass = (status: string) => {
  if (/hoạt động|đã đăng/i.test(status)) return "is-success";
  if (/đóng|vô hiệu|hạn chế/i.test(status)) return "is-danger";
  if (/duyệt|xem xét/i.test(status)) return "is-info";
  return "is-warning";
};

export type AdsManagerPageProps = { initialWorkspace?: Workspace };

export default function AdsManagerPage({ initialWorkspace = "AD" }: AdsManagerPageProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currencyMode, setCurrencyMode] = useState<"Gốc" | "VND" | "USD">("Gốc");
  const [showColumns, setShowColumns] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignLevel, setCampaignLevel] = useState<CampaignLevel>("campaign");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const normalized = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const source = workspace === "AD" ? adAccountRows : workspace === "BM" ? bmRows : workspace === "PAGE" ? pageRows : campaignRows.filter((row) => row.level === campaignLevel);
    if (!normalized) return source;
    return source.filter((row) => JSON.stringify(row).toLowerCase().includes(normalized));
  }, [workspace, campaignLevel, normalized]);

  const selectedCount = selectedIds.length;
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const selectAll = () => setSelectedIds((current) => current.length === rows.length ? [] : rows.map((row) => String(row.id)));
  const switchWorkspace = (value: Workspace) => { setWorkspace(value); setSelectedIds([]); setQuery(""); };
  const refresh = () => { setRefreshing(true); window.setTimeout(() => setRefreshing(false), 700); };

  return (
    <div className="adsmeta-manager-page">
      <div className="adsmeta-manager-inner">
        <section className="adsmeta-workspace-toolbar">
          <div className="adsmeta-workspace-tabs">
            {workspaceTabs.map((tab) => (
              <button key={tab} type="button" onClick={() => switchWorkspace(tab)} className={workspace === tab ? "is-active" : ""}>
                {tab}{tab !== "AD" && <span>NEW</span>}
              </button>
            ))}
          </div>
          <div className="adsmeta-toolbar-divider" />
          <label className="adsmeta-toolbar-search"><Search size={14} /><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder={workspace === "AD" ? "Tìm TKQC theo tên, ID, chủ sở hữu..." : `Tìm trong ${workspace}...`} />{query && <button type="button" onClick={() => setQuery("")}><X size={12} /></button>}</label>
          <div className="relative">
            <button type="button" className="adsmeta-toolbar-button" onClick={() => setShowAlerts((value) => !value)}><BellRing size={14} /> Cảnh báo <b>3</b></button>
            {showAlerts && <AlertsPopover onClose={() => setShowAlerts(false)} />}
          </div>
          <button type="button" className="adsmeta-toolbar-button"><Globe2 size={14} /> Tiền gốc</button>
          <button type="button" className="adsmeta-toolbar-square" onClick={() => setCurrencyMode((value) => value === "Gốc" ? "VND" : value === "VND" ? "USD" : "Gốc")}>{currencyMode === "Gốc" ? "đ" : currencyMode}</button>
          <button type="button" className="adsmeta-toolbar-button hidden sm:inline-flex">USD <b>26.254đ</b></button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="adsmeta-toolbar-button"><SlidersHorizontal size={14} /> Tối đa <ChevronDown size={12} /></button>
            <div className="relative">
              <button type="button" className="adsmeta-toolbar-button" onClick={() => setShowColumns((value) => !value)}><EyeOff size={14} /> Ẩn cột</button>
              {showColumns && <ColumnsPopover hidden={hiddenColumns} onToggle={(column) => setHiddenColumns((current) => current.includes(column) ? current.filter((value) => value !== column) : [...current, column])} onClose={() => setShowColumns(false)} />}
            </div>
            <button type="button" className="adsmeta-toolbar-icon" onClick={refresh} title="Tải lại"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /></button>
          </div>
        </section>

        {workspace === "CAMP" && <CampaignActionBar level={campaignLevel} selectedCount={selectedCount} onLevelChange={(level) => { setCampaignLevel(level); setSelectedIds([]); }} />}

        <section className="adsmeta-grid-card">
          <div className="adsmeta-grid-scroll">
            {workspace === "AD" && <AdAccountsTable rows={rows as typeof adAccountRows} selectedIds={selectedIds} hiddenColumns={hiddenColumns} onSelect={toggleSelected} onSelectAll={selectAll} />}
            {workspace === "BM" && <BusinessTable rows={rows as typeof bmRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} />}
            {workspace === "PAGE" && <PagesTable rows={rows as typeof pageRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} />}
            {workspace === "CAMP" && <CampaignTable rows={rows as unknown as typeof campaignRows} selectedIds={selectedIds} onSelect={toggleSelected} onSelectAll={selectAll} />}
          </div>
          <ManagerFooter workspace={workspace} rows={rows} selectedCount={selectedCount} />
        </section>
      </div>
    </div>
  );
}

function HeaderCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) { return <input type="checkbox" checked={checked} onChange={onChange} className="adsmeta-checkbox" />; }
function RowCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) { return <input type="checkbox" checked={checked} onChange={onChange} onClick={(event: MouseEvent<HTMLInputElement>) => event.stopPropagation()} className="adsmeta-checkbox" />; }
function StatusBadge({ value }: { value: string }) { return <span className={`adsmeta-status ${statusClass(value)}`}><i />{value}</span>; }

function AdAccountsTable({ rows, selectedIds, hiddenColumns, onSelect, onSelectAll }: { rows: typeof adAccountRows; selectedIds: string[]; hiddenColumns: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  const hidden = (name: string) => hiddenColumns.includes(name);
  return (
    <table className="adsmeta-data-grid min-w-[1780px]">
      <thead><tr>
        <th className="w-10"><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th className="w-12">#</th><th>Trạng thái</th><th>Hành động</th><th>ID Tài khoản</th>{!hidden("Chủ sở hữu") && <th>Chủ sở hữu</th>}<th>Tên tài khoản</th><th className="text-right">Số dư</th>{!hidden("Ngưỡng") && <th className="text-right">Ngưỡng</th>}<th className="text-right">Ngưỡng còn lại</th><th className="text-right">Hạn mức</th><th>Giới hạn chi tiêu</th><th className="text-right">Chi tiêu</th><th>Admin</th><th>Quyền</th><th>Tiền tệ</th><th>Loại</th><th>Thẻ thanh toán</th><th>Bill tiếp</th><th>Múi giờ</th><th>Ngày tạo</th><th>Tạo QC</th><th />
      </tr></thead>
      <tbody>{rows.map((row, index) => {
        const selected = selectedIds.includes(row.id);
        return <tr key={row.id} className={selected ? "is-selected" : ""} onClick={() => onSelect(row.id)}>
          <td><RowCheckbox checked={selected} onChange={() => onSelect(row.id)} /></td><td className="text-slate-400">{index + 1}</td><td><StatusBadge value={row.status} /></td><td><button className="adsmeta-row-icon"><MoreHorizontal size={15} /></button></td><td className="font-mono text-blue-500">{row.id}</td>{!hidden("Chủ sở hữu") && <td className="font-mono text-slate-500">{row.ownerId}</td>}<td className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</td><td className="text-right font-semibold">{money(row.balance)}</td>{!hidden("Ngưỡng") && <td className="text-right">{row.threshold}</td>}<td className="text-right">{row.thresholdRemaining}</td><td className="text-right font-semibold">{money(row.limit)}đ</td><td>{row.spendCap}</td><td className="text-right font-semibold">{money(row.spend)}đ</td><td><button className="adsmeta-admin-pill">{row.admins}</button></td><td>{row.role}</td><td>{row.currency}</td><td><span className="adsmeta-type-pill">{row.type}</span></td><td>{row.card}</td><td>{row.nextBill}</td><td>{row.timezone}</td><td>{row.createdAt}</td><td><button className="adsmeta-boost">Boost</button></td><td><button className="adsmeta-row-icon"><Settings2 size={14} /></button></td>
        </tr>;
      })}</tbody>
      <tfoot><tr><td>∑</td><td colSpan={5}><b>Tổng ({rows.length})</b></td><td className="text-right font-bold">{money(rows.reduce((sum, row) => sum + row.balance, 0))}đ</td><td colSpan={4} /><td className="text-right font-bold">{money(rows.reduce((sum, row) => sum + row.spend, 0))}đ</td><td colSpan={11} /></tr></tfoot>
    </table>
  );
}

function BusinessTable({ rows, selectedIds, onSelect, onSelectAll }: { rows: typeof bmRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  return <table className="adsmeta-data-grid min-w-[1250px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>#</th><th>Trạng thái</th><th>BM ID</th><th>Tên Business Manager</th><th>Cấp độ</th><th className="text-right">TKQC</th><th className="text-right">Fanpage</th><th className="text-right">Admin</th><th>Xác minh</th><th className="text-right">Hạn mức</th><th>Ngày tạo</th><th>Hành động</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""} onClick={() => onSelect(row.id)}><td><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td>{index + 1}</td><td><StatusBadge value={row.status} /></td><td className="font-mono text-blue-500">{row.id}</td><td className="font-semibold">{row.name}</td><td>{row.level}</td><td className="text-right">{row.adAccounts}</td><td className="text-right">{row.pages}</td><td className="text-right">{row.admins}</td><td>{row.verified}</td><td className="text-right">{row.limit}</td><td>{row.createdAt}</td><td><button className="adsmeta-share-button">Chia sẻ</button></td></tr>)}</tbody></table>;
}

function PagesTable({ rows, selectedIds, onSelect, onSelectAll }: { rows: typeof pageRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  return <table className="adsmeta-data-grid min-w-[1250px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>#</th><th>Trạng thái</th><th>Page ID</th><th>Tên Fanpage</th><th>Business Manager</th><th className="text-right">Người theo dõi</th><th>Quảng cáo</th><th>Danh mục</th><th className="text-right">Admin</th><th>Ngày tạo</th><th>Hành động</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""} onClick={() => onSelect(row.id)}><td><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td>{index + 1}</td><td><StatusBadge value={row.status} /></td><td className="font-mono text-blue-500">{row.id}</td><td className="font-semibold">{row.name}</td><td>{row.bm}</td><td className="text-right font-semibold">{money(row.followers)}</td><td>{row.promotable}</td><td>{row.category}</td><td className="text-right">{row.admins}</td><td>{row.createdAt}</td><td><button className="adsmeta-boost">Mở Page</button></td></tr>)}</tbody></table>;
}

function CampaignTable({ rows, selectedIds, onSelect, onSelectAll }: { rows: typeof campaignRows; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void }) {
  return <table className="adsmeta-data-grid min-w-[1450px]"><thead><tr><th><HeaderCheckbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={onSelectAll} /></th><th>Bật/Tắt</th><th>Tên</th><th>ID</th><th>Tài khoản</th><th>Phân phối</th><th>Mục tiêu</th><th className="text-right">Ngân sách</th><th className="text-right">Chi tiêu</th><th className="text-right">Kết quả</th><th className="text-right">Chi phí/KQ</th><th className="text-right">Tiếp cận</th><th className="text-right">CTR</th><th className="text-right">ROAS</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selectedIds.includes(row.id) ? "is-selected" : ""} onClick={() => onSelect(row.id)}><td><RowCheckbox checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} /></td><td><button className={`adsmeta-switch ${row.status === "Hoạt động" ? "is-on" : ""}`}><i /></button></td><td className="font-semibold">{row.name}</td><td className="font-mono text-blue-500">{row.id}</td><td>{row.account}</td><td><StatusBadge value={row.status} /></td><td>{row.objective}</td><td className="text-right">{row.budget ? `${money(row.budget)}đ` : "—"}</td><td className="text-right font-semibold">{money(row.spend)}đ</td><td className="text-right">{row.results}</td><td className="text-right">{row.cpr ? `${money(row.cpr)}đ` : "—"}</td><td className="text-right">{money(row.reach)}</td><td className="text-right">{row.ctr.toFixed(2)}%</td><td className="text-right font-semibold">{row.roas ? `${row.roas.toFixed(2)}x` : "—"}</td></tr>)}</tbody></table>;
}

function CampaignActionBar({ level, selectedCount, onLevelChange }: { level: CampaignLevel; selectedCount: number; onLevelChange: (level: CampaignLevel) => void }) {
  const tabs: Array<[CampaignLevel, string]> = [["campaign", "Chiến dịch"], ["adset", "Nhóm QC"], ["ad", "Quảng cáo"]];
  return <section className="adsmeta-campaign-bar"><div className="adsmeta-campaign-levels">{tabs.map(([value, label]) => <button key={value} type="button" className={level === value ? "is-active" : ""} onClick={() => onLevelChange(value)}>{label} <b>{campaignRows.filter((row) => row.level === value).length}</b></button>)}</div><div className="adsmeta-campaign-actions"><button className="is-create"><Plus size={13} />Tạo</button><button disabled={!selectedCount} className="is-enable"><Play size={12} />Bật ({selectedCount})</button><button disabled={!selectedCount} className="is-pause"><Pause size={12} />Tắt ({selectedCount})</button><button disabled={!selectedCount}><WandSparkles size={13} />Phân tích <span>NEW</span></button><button disabled={!selectedCount}><FilePenLine size={13} />Sửa</button><button disabled={!selectedCount}><CalendarDays size={13} />Hẹn giờ</button><button disabled={!selectedCount}><Copy size={13} />Nhân bản sang TK khác <span>NEW</span></button><button disabled={!selectedCount} className="is-delete"><Trash2 size={13} />Xóa ({selectedCount})</button></div></section>;
}

function ManagerFooter({ workspace, rows, selectedCount }: { workspace: Workspace; rows: readonly unknown[]; selectedCount: number }) {
  const active = workspace === "AD" ? adAccountRows.filter((row) => row.status === "Hoạt động").length : rows.length;
  const dead = workspace === "AD" ? adAccountRows.filter((row) => row.status !== "Hoạt động").length : 0;
  return <footer className="adsmeta-manager-footer"><div className="adsmeta-footer-stat"><span className="bg-emerald-500" />Live <b>{active}</b></div><div className="adsmeta-footer-stat"><span className="bg-red-500" />Die <b>{dead}</b></div><div className="adsmeta-footer-separator" /><span>Hiển thị <b>{rows.length}</b> dòng</span><span>Đã chọn <b className="text-blue-500">{selectedCount}</b></span><span className="ml-auto">Cập nhật lúc <b>21:59:42</b></span></footer>;
}

function AlertsPopover({ onClose }: { onClose: () => void }) { return <div className="adsmeta-popover adsmeta-alerts-popover"><div className="adsmeta-popover-head"><b>Cảnh báo tài khoản</b><button onClick={onClose}><X size={13} /></button></div>{[["Số dư thấp", "1 tài khoản còn dưới 500.000đ", "warning"], ["Tài khoản bị đóng", "1 tài khoản cần kiểm tra", "danger"], ["Gần hạn mức", "1 tài khoản đã dùng trên 70%", "info"]].map(([title, body, type]) => <div key={title} className={`adsmeta-alert-item is-${type}`}><AlertTriangle size={14} /><span><b>{title}</b><small>{body}</small></span></div>)}</div>; }
function ColumnsPopover({ hidden, onToggle, onClose }: { hidden: string[]; onToggle: (column: string) => void; onClose: () => void }) { const columns = ["Chủ sở hữu", "Ngưỡng", "Ngưỡng còn lại", "Hạn mức", "Chi tiêu", "Admin", "Thẻ thanh toán", "Múi giờ", "Ngày tạo"]; return <div className="adsmeta-popover adsmeta-columns-popover"><div className="adsmeta-popover-head"><b><Columns3 size={14} /> Tùy chỉnh cột</b><button onClick={onClose}><X size={13} /></button></div><label className="adsmeta-column-search"><Search size={13} /><input placeholder="Tìm tên cột..." /></label><div>{columns.map((column) => <label key={column}><input type="checkbox" checked={!hidden.includes(column)} onChange={() => onToggle(column)} /><span>{column}</span></label>)}</div><button type="button" className="adsmeta-reset-columns" onClick={() => hidden.forEach(onToggle)}><Filter size={13} /> Khôi phục mặc định</button></div>; }
