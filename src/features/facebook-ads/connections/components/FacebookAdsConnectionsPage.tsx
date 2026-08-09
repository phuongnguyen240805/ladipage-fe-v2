"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Link2,
  RefreshCw,
  ShieldCheck,
  Unplug,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { adsPlatformRepository } from "../../../ads-platform/api/ads-platform.repository";
import type { AdsAccount, AdsConnection } from "../../../ads-platform/contracts";
import { facebookAdsRepository } from "../../api/facebook-ads.repository";
import { useFacebookAdsRuntime } from "../../runtime/FacebookAdsRuntimeProvider";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import FacebookAdsMockBadge from "../../shared/components/FacebookAdsMockBadge";
import MockNotice from "../../shared/components/MockNotice";

const REQUIRED_SCOPES = [
  ["ads_management", "Tạo và quản lý chiến dịch quảng cáo"],
  ["ads_read", "Đọc tài khoản, chiến dịch và insights"],
  ["business_management", "Khám phá tài sản Business Manager"],
  ["pages_read_engagement", "Đọc Page được dùng trong creative"],
] as const;

const LIVE_MODE = process.env.NEXT_PUBLIC_ADS_PLATFORM_MODE === "live";

function formatDate(value: string | null): string {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function FacebookAdsConnectionsPage() {
  const runtime = useFacebookAdsRuntime();
  const [connections, setConnections] = useState<AdsConnection[]>([]);
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [loading, setLoading] = useState(LIVE_MODE);
  const [actingId, setActingId] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLiveData = useCallback(async () => {
    if (!LIVE_MODE) return;
    setLoading(true);
    setError(null);
    try {
      const [connectionRows, accountRows] = await Promise.all([
        adsPlatformRepository.listConnections(),
        adsPlatformRepository.listAccounts(),
      ]);
      setConnections(connectionRows.filter((item) => item.provider === "META"));
      setAccounts(accountRows.filter((item) => item.provider === "META"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được kết nối Meta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLiveData();
  }, [loadLiveData]);

  const mockConnections = facebookAdsRepository.getConnections();
  const rows = useMemo(() => {
    if (LIVE_MODE) {
      return connections.map((connection) => ({
        id: connection.id,
        owner: connection.displayName || `Meta user ${connection.externalUserId}`,
        externalUserId: connection.externalUserId,
        status: connection.status,
        accountCount: accounts.filter((account) => account.connectionId === connection.id).length,
        lastSync: formatDate(connection.lastSyncedAt),
        expires: formatDate(connection.tokenExpiresAt),
        scopes: connection.scopes,
      }));
    }
    return mockConnections.map((connection, index) => ({
      id: connection.id,
      owner: connection.owner,
      externalUserId: connection.metaUserId,
      status: index === 0 && runtime.connectionStatus === "connected" ? "CONNECTED" : "REAUTHORIZATION_REQUIRED",
      accountCount: connection.accounts,
      lastSync: connection.lastSync,
      expires: connection.expires,
      scopes: REQUIRED_SCOPES.filter((_, scopeIndex) => scopeIndex < 3).map(([scope]) => scope),
    }));
  }, [accounts, connections, mockConnections, runtime.connectionStatus]);

  const startOAuth = async () => {
    setError(null);
    try {
      const result = await adsPlatformRepository.startOAuth("META", window.location.href);
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không bắt đầu được Meta OAuth");
    }
  };

  const discoverAccounts = async (connectionId: string) => {
    setActingId(connectionId);
    setError(null);
    try {
      await adsPlatformRepository.discoverAccounts(connectionId);
      await loadLiveData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đồng bộ được tài khoản quảng cáo");
    } finally {
      setActingId(null);
    }
  };

  const disconnect = async () => {
    if (!disconnectId) return;
    setActingId(disconnectId);
    setError(null);
    try {
      await adsPlatformRepository.disconnect(disconnectId);
      setDisconnectId(null);
      await loadLiveData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không ngắt được kết nối Meta");
    } finally {
      setActingId(null);
    }
  };

  const grantedScopes = new Set(rows.flatMap((row) => row.scopes));

  return (
    <div className="adsmeta-feature-page">
      <header className="adsmeta-feature-title">
        <div>
          <span className="adsmeta-feature-icon"><Link2 size={18} /></span>
          <div><h1>Kết nối Meta</h1><p>OAuth, phạm vi quyền và tài khoản quảng cáo thuộc workspace hiện tại.</p></div>
        </div>
        <div className="flex items-center gap-2">
          {!LIVE_MODE && <FacebookAdsMockBadge />}
          <AdsButton size="sm" variant="primary" startIcon={<Link2 size={14} />} onClick={() => void startOAuth()} disabled={!LIVE_MODE}>
            Thêm kết nối
          </AdsButton>
        </div>
      </header>

      {!LIVE_MODE && <MockNotice compact />}
      {error && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="adsmeta-connections-layout">
        <section className="space-y-2">
          {loading && <div className="adsmeta-feature-card">Đang tải kết nối Meta…</div>}
          {!loading && LIVE_MODE && rows.length === 0 && (
            <div className="adsmeta-feature-card">Chưa có kết nối Meta. Chọn “Thêm kết nối” để bắt đầu OAuth.</div>
          )}
          {rows.map((connection) => {
            const healthy = connection.status === "CONNECTED";
            return (
              <article key={connection.id} className="adsmeta-connection-card">
                <div className="adsmeta-connection-avatar">{connection.owner.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2>{connection.owner}</h2>
                    <span className={`adsmeta-connection-status ${healthy ? "is-ok" : "is-warning"}`}>
                      {healthy ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                      {healthy ? "Đang hoạt động" : "Cần cấp lại quyền"}
                    </span>
                  </div>
                  <p>Meta user ID · {connection.externalUserId}</p>
                  <div className="adsmeta-connection-metrics"><span><b>{connection.accountCount}</b>Tài khoản QC</span></div>
                </div>
                <div className="adsmeta-connection-meta">
                  <span><Clock3 size={11} />{connection.lastSync}</span>
                  <span><KeyRound size={11} />{connection.expires}</span>
                </div>
                <div className="adsmeta-connection-actions">
                  <button type="button" onClick={() => LIVE_MODE && void discoverAccounts(connection.id)} disabled={!LIVE_MODE || actingId === connection.id}>
                    <RefreshCw size={12} className={actingId === connection.id ? "animate-spin" : ""} />
                    {actingId === connection.id ? "Đang đồng bộ" : "Khám phá tài khoản"}
                  </button>
                  {!healthy && <button type="button" className="is-primary" onClick={() => void startOAuth()} disabled={!LIVE_MODE}>Cấp lại quyền</button>}
                  <button type="button" className="is-danger" onClick={() => LIVE_MODE && setDisconnectId(connection.id)} disabled={!LIVE_MODE}>
                    <Unplug size={12} />Ngắt
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="adsmeta-feature-card adsmeta-scope-card">
          <div className="adsmeta-card-toolbar"><ShieldCheck size={14} /><b>Phạm vi quyền yêu cầu</b></div>
          <div>
            {REQUIRED_SCOPES.map(([scope, description]) => {
              const granted = grantedScopes.has(scope);
              return (
                <div key={scope} className="adsmeta-scope-row">
                  <span className={granted ? "is-ok" : "is-warning"}>{granted ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}</span>
                  <div><code>{scope}</code><p>{description}</p></div><b>{granted ? "Đã cấp" : "Còn thiếu"}</b>
                </div>
              );
            })}
          </div>
          <footer><Users size={13} /><span>Backend kiểm tra quyền theo tenant, connection và ad account.</span></footer>
        </aside>
      </div>

      <AdsModal
        open={Boolean(disconnectId)}
        title="Ngắt kết nối Meta?"
        description="Credential trong vault sẽ bị xóa và các job mới không thể dùng connection này."
        size="sm"
        onClose={() => setDisconnectId(null)}
        footer={<><AdsButton variant="ghost" onClick={() => setDisconnectId(null)}>Hủy</AdsButton><AdsButton variant="danger" onClick={() => void disconnect()}>Xác nhận</AdsButton></>}
      ><p className="text-xs text-muted-foreground">Các campaign đã tạo trước đó không bị xóa.</p></AdsModal>
    </div>
  );
}
