import React from "react";
import Header from "./Header";
import { syncGroups } from "./mockData";

export default function SyncView() {
  return (
    <>
      <Header title="Điều khiển đồng bộ" subtitle="Điều khiển nhiều cloud phone theo nhóm: đồng bộ thao tác, broadcast lệnh, chạy script và xem độ trễ từng nhóm." />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {syncGroups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#11121b]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{group.name}</div>
                <div className="mt-1 text-xs text-slate-500">{group.devices} thiết bị · {group.mode}</div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${group.running ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>{group.running ? "RUNNING" : "PAUSED"}</span>
            </div>
            <div className="mb-4 rounded-xl border border-black/10 bg-slate-950 p-4 font-mono text-xs text-green-400 dark:border-white/5">
              <div>$ cloudphone sync --group {group.id}</div>
              <div className="mt-1 text-cyan-400">latency={group.latency} devices={group.devices}</div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-400">Bắt đầu</button>
              <button className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Cấu hình</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/5 dark:bg-[#11121b]">
        <div className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Bảng điều khiển nhanh</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {["Mirror touch", "Paste clipboard", "Rotate screen", "Install APK"].map((action) => (
            <button key={action} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-bold text-slate-600 transition hover:border-cyan-500/40 hover:text-cyan-600 dark:border-white/10 dark:text-slate-300">
              {action}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
