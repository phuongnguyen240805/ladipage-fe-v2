import React, { useState } from "react";
import Header from "./Header";
import { devices } from "./mockData";

function StatusDot({ status }: { status: string }) {
  const cls = status === "online" ? "bg-emerald-400" : status === "idle" ? "bg-amber-400" : "bg-rose-400";
  return <span className={`h-2 w-2 rounded-full ${cls} shadow-[0_0_16px_currentColor]`} />;
}

export default function DevicesView() {
  const [filter, setFilter] = useState("all");
  const filtered = devices.filter((device) => filter === "all" || device.status === filter);

  return (
    <>
      <Header title="Quản lý thiết bị" subtitle="Theo dõi trạng thái cloud phone, phiên kết nối, pin ảo, khu vực và owner. Dùng để mở máy, reboot, gắn proxy hoặc chuyển nhóm." />
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", "online", "idle", "offline"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
              filter === item ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "border-black/10 text-slate-500 hover:border-cyan-500/30 dark:border-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/5 dark:bg-[#11121b]">
        <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.7fr] border-b border-black/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400 dark:border-white/5">
          <span>Thiết bị</span><span>Trạng thái</span><span>Khu vực</span><span>Pin</span><span>Phiên</span>
        </div>
        {filtered.map((device) => (
          <div key={device.id} className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.7fr] items-center border-b border-black/5 px-4 py-3 text-sm last:border-b-0 dark:border-white/5">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{device.name}</div>
              <div className="font-mono text-xs text-slate-500">{device.id} · {device.owner}</div>
            </div>
            <div className="flex items-center gap-2 capitalize text-slate-600 dark:text-slate-300"><StatusDot status={device.status} />{device.status}</div>
            <div className="font-mono text-xs text-cyan-600 dark:text-cyan-400">{device.region}</div>
            <div className="text-slate-600 dark:text-slate-300">{device.battery}%</div>
            <div className="font-mono text-xs text-slate-500">{device.session}</div>
          </div>
        ))}
      </div>
    </>
  );
}
