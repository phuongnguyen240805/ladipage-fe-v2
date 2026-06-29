import React, { useState, useEffect, useRef } from "react";
import { DeviceData } from "./types";
import PhoneScreenMockup from "./PhoneScreenMockup";

interface ViewportControllerModalProps {
  device: DeviceData | null;
  onClose: () => void;
}

export default function ViewportControllerModal({ device, onClose }: ViewportControllerModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [proxyVal, setProxyVal] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // Initialize logs from device stats when opened
  useEffect(() => {
    if (device) {
      setLogs(device.actionLogs);
      setProxyVal(device.proxyIp);
    }
  }, [device]);

  // Autoscroll active console log panel
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  if (!device) return null;

  const appendLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleSendText = () => {
    if (!inputVal.trim()) return;
    appendLog(`Simulated typing to input field: "${inputVal}"`);
    setInputVal("");
  };

  const handleVirtualKey = (key: string) => {
    appendLog(`Simulated keypress event: KEYCODE_${key}`);
  };

  const handleUpdateProxy = () => {
    appendLog(`Setting proxy profile IP: ${proxyVal}...`);
    appendLog(`Proxy applied successfully! Ping response: 42ms.`);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0c0d14] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 dark:border-slate-850">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📱 Live Viewport Controller - {device.name}</span>
              {device.online ? (
                <span className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[8.5px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[8.5px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  Offline
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SN: {device.serial}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-655 dark:hover:bg-slate-800 transition cursor-pointer">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-850">
          {/* Left Column: Phone mockup display & Virtual Keys */}
          <div className="md:col-span-5 p-6 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-950/5">
            {/* Casing Container */}
            <div className="w-full max-w-[210px] aspect-[9/18.5] rounded-3xl border-[8px] border-slate-850 dark:border-slate-700 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Speaker pill notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-slate-850 rounded-full z-20 flex items-center justify-center">
                <span className="h-1 w-1 bg-slate-900 border border-slate-700/60 rounded-full ml-auto mr-1.5" />
              </div>

              {/* Inside Screen wrapper */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 mt-1 relative">
                {/* Status Bar */}
                <div className="h-5.5 bg-slate-900/90 text-white flex items-center justify-between px-2.5 text-[8.5px] font-bold select-none pt-1 shrink-0">
                  <span>14:32</span>
                  <div className="flex items-center gap-1 font-semibold">
                    <span>📶</span>
                    <span>{device.online ? `${device.battery}%` : "0%"}</span>
                    <span>{device.online ? "🔋" : "🔌"}</span>
                  </div>
                </div>
                {/* Screen graphics viewport */}
                <div className="flex-1 bg-slate-900 overflow-hidden relative">
                  <PhoneScreenMockup state={device.screenState} />
                </div>
                {/* Home Indicator bar */}
                <div className="h-3.5 bg-slate-900/95 flex items-center justify-center shrink-0">
                  <div className="w-16 h-0.5 bg-slate-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Virtual Android Navigation Keys */}
            <div className="mt-4 flex items-center justify-center gap-3 w-full max-w-[210px]">
              <button
                onClick={() => handleVirtualKey("BACK")}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10px] font-black uppercase text-center cursor-pointer transition border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                ◀ Back
              </button>
              <button
                onClick={() => handleVirtualKey("HOME")}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10px] font-black uppercase text-center cursor-pointer transition border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                ● Home
              </button>
              <button
                onClick={() => handleVirtualKey("RECENT")}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10px] font-black uppercase text-center cursor-pointer transition border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                ■ Menu
              </button>
            </div>

            {/* Simulated hardware controls */}
            <div className="mt-2.5 flex items-center justify-center gap-2 w-full max-w-[210px]">
              <button
                onClick={() => handleVirtualKey("POWER")}
                className="flex-1 py-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md text-[9px] font-extrabold uppercase text-center cursor-pointer transition"
              >
                🔌 Power Off
              </button>
              <button
                onClick={() => {
                  appendLog("Sending reboot signal to phone hardware...");
                  setTimeout(() => appendLog("Phone disconnected. Rebooting..."), 400);
                  setTimeout(() => appendLog("System reloading..."), 1500);
                  setTimeout(() => appendLog("Connected successfully. Seeding logs resumed."), 2200);
                }}
                className="flex-1 py-1 px-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md text-[9px] font-extrabold uppercase text-center cursor-pointer transition"
              >
                🔄 Reboot
              </button>
              <button
                onClick={() => handleVirtualKey("UNLOCK")}
                className="flex-1 py-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md text-[9px] font-extrabold uppercase text-center cursor-pointer transition"
              >
                🔓 Unlock
              </button>
            </div>
          </div>

          {/* Right Column: Device metadata details & Live Console Logs */}
          <div className="md:col-span-7 p-6 space-y-4">
            {/* Specs & Hardware indicators */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-4 rounded-xl dark:bg-slate-900/10 border border-slate-150 dark:border-slate-850">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gói đăng ký</span>
                <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">{device.plan}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Hệ điều hành</span>
                <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">{device.os} (Ver. {device.os.includes("9") ? "9.0" : "13.0"})</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Proxy Address</span>
                <span className="text-xs font-mono font-semibold text-[#1877f2] dark:text-[#4299e1] mt-0.5 block">{device.proxyIp}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Performance</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">Ping: 42ms | 30 FPS</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-3">
              {/* Text streamer input */}
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nhập văn bản lên thiết bị (Send Text)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập nội dung cần gõ trên điện thoại..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                    className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-[#11121b] dark:text-white outline-none"
                  />
                  <button onClick={handleSendText} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 rounded-xl cursor-pointer transition shadow-sm">
                    Gửi
                  </button>
                </div>
              </div>

              {/* Set Proxy Panel */}
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gán Proxy riêng cho thiết bị</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SOCKS5://username:password@ip:port"
                    value={proxyVal}
                    onChange={(e) => setProxyVal(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-[#11121b] dark:text-white outline-none"
                  />
                  <button onClick={handleUpdateProxy} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 rounded-xl cursor-pointer transition shadow-sm">
                    Gán Proxy
                  </button>
                </div>
              </div>
            </div>

            {/* Realtime Terminal Action Logs */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Hoạt động thời gian thực (Terminal Live Logs)</span>
              <div
                ref={logRef}
                className="bg-slate-950 text-lime-400 p-3.5 rounded-xl font-mono text-[10px] h-[150px] overflow-y-auto space-y-1 shadow-inner border border-slate-850"
              >
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-850">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-355 dark:hover:bg-slate-800 cursor-pointer transition">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
