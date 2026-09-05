"use client";

import {
  Boxes,
  CircleDot,
  Database,
  ImageIcon,
  Instagram,
  PanelsTopLeft,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { facebookAdsRepository } from "../../api/facebook-ads.repository";
import type { FacebookAdsAssetType as AssetType } from "../../dev-fixtures/assets";
import { useFacebookAdsRuntime } from "../../runtime/FacebookAdsRuntimeProvider";
import { FacebookAdsBlockingState, FacebookAdsLoadingState } from "../../shared/components/FacebookAdsDataState";
import FacebookAdsMockBadge from "../../shared/components/FacebookAdsMockBadge";

const assetTabs = [
  ["page", "Fanpage", PanelsTopLeft],
  ["instagram", "Instagram", Instagram],
  ["pixel", "Pixel / Dataset", Database],
  ["audience", "Đối tượng", Users],
  ["media", "Thư viện media", ImageIcon],
] as const;

export default function FacebookAdsAssetsPage() {
  const [assetType, setAssetType] = useState<AssetType>("page");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const runtime = useFacebookAdsRuntime();
  const assets = facebookAdsRepository.getAssets();
  const rows = useMemo(() => assets.filter((asset) => asset.type === assetType && `${asset.name} ${asset.id} ${asset.owner}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi"))), [assetType, assets, query]);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="adsmeta-feature-page">
      <header className="adsmeta-feature-title">
        <div><span className="adsmeta-feature-icon"><Boxes size={18}/></span><div><h1>Thư viện tài sản Meta</h1><p>Duyệt danh tính, nguồn chuyển đổi, audience và media dùng trong chiến dịch.</p></div></div>
        <FacebookAdsMockBadge />
      </header>

      <section className="adsmeta-feature-card adsmeta-assets-card">
        <div className="adsmeta-assets-tabs">
          {assetTabs.map(([id, label, Icon]) => <button key={id} type="button" className={assetType === id ? "is-active" : ""} onClick={() => setAssetType(id)}><Icon size={14}/>{label}<b>{assets.filter((asset) => asset.type === id).length}</b></button>)}
        </div>
        <div className="adsmeta-assets-toolbar">
          <label><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, ID hoặc chủ sở hữu…"/></label>
          <select aria-label="Tài khoản quảng cáo"><option>Tất cả tài khoản quảng cáo</option><option>LadiPage - Chuyển đổi</option><option>Ecom Store</option></select>
          <button type="button" onClick={refresh}><RefreshCw size={13} className={refreshing ? "animate-spin" : ""}/>Đồng bộ mock</button>
        </div>

        {runtime.dataState === "loading" ? <FacebookAdsLoadingState/> : ["disconnected", "permission-denied"].includes(runtime.scenario) ? <FacebookAdsBlockingState scenario={runtime.scenario}/> : (
          <div className="overflow-x-auto">
            <table className="adsmeta-assets-table">
              <thead><tr><th>Tài sản</th><th>ID</th><th>Chủ sở hữu</th><th>Trạng thái</th><th>Chi tiết</th><th>Cập nhật</th></tr></thead>
              <tbody>{rows.map((asset) => <tr key={asset.id}><td><span className="adsmeta-asset-symbol"><CircleDot size={14}/></span><b>{asset.name}</b></td><td><code>{asset.id}</code></td><td>{asset.owner}</td><td><span className={`ladi-status-badge ${asset.status === "Sẵn sàng" || asset.status === "Đang nhận dữ liệu" ? "is-ok" : "is-warning"}`}>{asset.status}</span></td><td>{asset.detail}</td><td>Hôm nay, 21:59</td></tr>)}</tbody>
            </table>
            {rows.length === 0 && <div className="adsmeta-assets-empty">Không có tài sản phù hợp với bộ lọc.</div>}
          </div>
        )}
        <footer className="adsmeta-card-footer">Nguồn: fixture UI · Hiển thị {rows.length} tài sản · Không gọi Meta API</footer>
      </section>
    </div>
  );
}
