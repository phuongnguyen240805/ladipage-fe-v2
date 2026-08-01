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
import { useState } from "react";
import { facebookAdsRepository } from "../../api/facebook-ads.repository";
import { useFacebookAdsRuntime } from "../../runtime/FacebookAdsRuntimeProvider";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import FacebookAdsMockBadge from "../../shared/components/FacebookAdsMockBadge";
import MockNotice from "../../shared/components/MockNotice";

export default function FacebookAdsConnectionsPage() {
  const runtime = useFacebookAdsRuntime();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [modal, setModal] = useState<"connect" | "disconnect" | null>(null);
  const connections = facebookAdsRepository.getConnections();
  const requiredScopes = facebookAdsRepository.getRequiredScopes();

  const startMockSync = (id: string) => {
    setSyncingId(id);
    window.setTimeout(() => setSyncingId(null), 900);
  };

  return (
    <div className="adsmeta-feature-page">
      <header className="adsmeta-feature-title">
        <div>
          <span className="adsmeta-feature-icon"><Link2 size={18} /></span>
          <div>
            <h1>Kết nối Meta</h1>
            <p>Kiểm tra phiên kết nối, phạm vi quyền và tài sản được đồng bộ.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FacebookAdsMockBadge />
          <AdsButton size="sm" variant="primary" startIcon={<Link2 size={14} />} onClick={() => setModal("connect")}>Thêm kết nối</AdsButton>
        </div>
      </header>

      <MockNotice compact />

      <div className="adsmeta-connections-layout">
        <section className="space-y-2">
          {connections.map((connection, index) => {
            const healthy = index === 0 && runtime.connectionStatus === "connected";
            const disconnected = index === 0 && runtime.connectionStatus === "disconnected";
            const statusLabel = disconnected
              ? "Chưa kết nối"
              : healthy
                ? "Đang hoạt động"
                : "Cần cấp lại quyền";
            return (
              <article key={connection.id} className="adsmeta-connection-card">
                <div className="adsmeta-connection-avatar">{connection.owner.split(" ").slice(-1)[0].slice(0, 1)}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2>{connection.owner}</h2>
                    <span className={`adsmeta-connection-status ${healthy ? "is-ok" : "is-warning"}`}>
                      {healthy ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}{statusLabel}
                    </span>
                  </div>
                  <p>Meta user ID · {connection.metaUserId}</p>
                  <div className="adsmeta-connection-metrics">
                    <span><b>{connection.accounts}</b>Tài khoản QC</span>
                    <span><b>{connection.businesses}</b>Business</span>
                    <span><b>{connection.pages}</b>Fanpage</span>
                  </div>
                </div>
                <div className="adsmeta-connection-meta">
                  <span><Clock3 size={11} />{connection.lastSync}</span>
                  <span><KeyRound size={11} />{connection.expires}</span>
                </div>
                <div className="adsmeta-connection-actions">
                  <button type="button" onClick={() => startMockSync(connection.id)} disabled={syncingId === connection.id}>
                    <RefreshCw size={12} className={syncingId === connection.id ? "animate-spin" : ""}/>{syncingId === connection.id ? "Đang đồng bộ" : "Đồng bộ"}
                  </button>
                  {!healthy && <button type="button" className="is-primary" onClick={() => setModal("connect")}>Cấp lại quyền</button>}
                  <button type="button" className="is-danger" onClick={() => setModal("disconnect")}><Unplug size={12} />Ngắt</button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="adsmeta-feature-card adsmeta-scope-card">
          <div className="adsmeta-card-toolbar"><ShieldCheck size={14}/><b>Phạm vi quyền yêu cầu</b><span>4/5 sẵn sàng</span></div>
          <div>
            {requiredScopes.map(([scope, description, granted]) => (
              <div key={scope} className="adsmeta-scope-row">
                <span className={granted ? "is-ok" : "is-warning"}>{granted ? <CheckCircle2 size={13}/> : <AlertTriangle size={13}/>}</span>
                <div><code>{scope}</code><p>{description}</p></div>
                <b>{granted ? "Đã cấp" : "Còn thiếu"}</b>
              </div>
            ))}
          </div>
          <footer><Users size={13}/><span>Quyền thật sẽ được backend xác minh theo từng connection và ad account.</span></footer>
        </aside>
      </div>

      <AdsModal
        open={modal === "connect"}
        title="Mô phỏng kết nối Meta"
        description="Preview chỉ kiểm tra UI của flow OAuth. Không mở Meta OAuth và không nhận access token."
        size="sm"
        onClose={() => setModal(null)}
        footer={<><AdsButton variant="ghost" onClick={() => setModal(null)}>Đóng</AdsButton><AdsButton variant="primary" onClick={() => setModal(null)}>Xác nhận màn hình mock</AdsButton></>}
      >
        <MockNotice />
        <ol className="adsmeta-oauth-steps">
          <li><b>1</b><span>Xác minh workspace và người thực hiện.</span></li>
          <li><b>2</b><span>Mở Meta OAuth trong tab bảo mật riêng.</span></li>
          <li><b>3</b><span>Backend lưu token vào vault; UI chỉ nhận trạng thái.</span></li>
        </ol>
      </AdsModal>

      <AdsModal
        open={modal === "disconnect"}
        title="Ngắt kết nối mock?"
        description="Thao tác chỉ đóng modal trong preview và không thu hồi kết nối thật."
        size="sm"
        onClose={() => setModal(null)}
        footer={<><AdsButton variant="ghost" onClick={() => setModal(null)}>Hủy</AdsButton><AdsButton variant="danger" onClick={() => setModal(null)}>Xác nhận mock</AdsButton></>}
      ><MockNotice /></AdsModal>
    </div>
  );
}
