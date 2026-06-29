import React, { useState, useEffect } from "react";
import { mockDevicesData } from "./mockData";
import PhoneScreenMockup from "./PhoneScreenMockup";
import ViewportControllerModal from "./ViewportControllerModal";

export default function DevicesFarmView() {
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // GADS Connection state
  const [gadsUrl, setGadsUrl] = useState("http://localhost:10000");
  const [gadsDevices, setGadsDevices] = useState<any[]>([]);
  const [gadsStatus, setGadsStatus] = useState<"connected" | "disconnected" | "loading">("loading");
  const [showGadsConfig, setShowGadsConfig] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gads_url");
    if (saved) setGadsUrl(saved);
  }, []);

  // Listen to GADS available-devices stream
  useEffect(() => {
    setGadsStatus("loading");
    setGadsDevices([]);

    let eventSource: EventSource | null = null;
    let fallbackTimeout = setTimeout(() => {
      if (gadsStatus === "loading") {
        setGadsStatus("disconnected");
      }
    }, 3000);

    try {
      // Connect to GADS available-devices endpoint via proxy with gadsUrl query param
      const url = `/api/gads/available-devices?workspaceId=default&gadsUrl=${encodeURIComponent(gadsUrl)}`;
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        clearTimeout(fallbackTimeout);
        setGadsStatus("connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const rawList = JSON.parse(event.data);
          if (Array.isArray(rawList)) {
            const mapped = rawList.map((d: any, index: number) => {
              const os = d.info?.os?.toLowerCase() || "android";
              return {
                id: 1000 + index, // avoid conflict with mock id
                no: String(index + 1),
                name: d.info?.name || d.info?.udid || `Device ${index + 1}`,
                serial: d.info?.udid || "",
                plan: d.info?.device_type === "emulator" ? "GADS Emulator" : "GADS Thiết bị thật",
                online: d.connected && d.provider_state === "live",
                proxyIp: d.info?.ip_address || "None",
                proxyName: d.host || "GADS Host",
                note: `OS: ${d.info?.os || "Android"} ${d.info?.os_version || ""}`,
                os: `${d.info?.os || "Android"} ${d.info?.os_version || ""}`,
                battery: d.connected ? 100 : 0,
                appRunning: d.in_use ? `Bận bởi: ${d.in_use_by || d.in_use_by_tenant || "user"}` : "Đang rảnh",
                screenState: os === "ios" ? "fb" : "tiktok", // fallback mockup screens
                actionLogs: [
                  `[GADS] Trạng thái nhà cung cấp: ${d.provider_state || "Unknown"}`,
                  `[GADS] UDID: ${d.info?.udid || ""}`,
                  `[GADS] Địa chỉ IP: ${d.info?.ip_address || ""}`,
                  `[GADS] Trạng thái: ${d.connected ? "Đang kết nối" : "Mất kết nối"}`
                ]
              };
            });
            setGadsDevices(mapped);
            setGadsStatus("connected");
          }
        } catch (err) {
          console.error("Error parsing GADS stream data:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("GADS stream connection error:", err);
        setGadsStatus("disconnected");
        if (eventSource) eventSource.close();
      };
    } catch (err) {
      console.warn("Failed to instantiate EventSource for GADS:", err);
      setGadsStatus("disconnected");
    }

    return () => {
      clearTimeout(fallbackTimeout);
      if (eventSource) eventSource.close();
    };
  }, [gadsUrl]);

  const devicesToUse = gadsStatus === "connected" && gadsDevices.length > 0 ? gadsDevices : mockDevicesData;

  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);

  // Filter devices list based on search bar query
  const filteredDevices = devicesToUse.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.proxyIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = devicesToUse.filter((d) => d.online).length;
  const offlineCount = devicesToUse.length - onlineCount;

  // Handle multi-checkbox events
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeviceIds(filteredDevices.map((d) => d.id));
    } else {
      setSelectedDeviceIds([]);
    }
  };

  const handleSelectDevice = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedDeviceIds((prev) => [...prev, id]);
    } else {
      setSelectedDeviceIds((prev) => prev.filter((dId) => dId !== id));
    }
  };

  return (
    <>
      {/* GADS Connection Status Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 p-4 rounded-2xl shadow-sm select-none gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            gadsStatus === "connected" ? "bg-emerald-500 animate-pulse" :
            gadsStatus === "loading" ? "bg-amber-500 animate-bounce" : "bg-rose-500"
          }`} />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
            Kết nối máy chủ GADS:
          </span>
          <span className={`text-xs font-black uppercase ${
            gadsStatus === "connected" ? "text-emerald-600 dark:text-emerald-450" :
            gadsStatus === "loading" ? "text-amber-500" : "text-rose-600 dark:text-rose-500"
          }`}>
            {gadsStatus === "connected" ? `Đã kết nối (${gadsUrl})` :
             gadsStatus === "loading" ? "Đang dò tìm máy chủ..." : "Chưa kết nối (Chế độ mô phỏng)"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {showGadsConfig ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={gadsUrl}
                onChange={(e) => {
                  setGadsUrl(e.target.value);
                  localStorage.setItem("gads_url", e.target.value);
                }}
                placeholder="http://localhost:10000"
                className="rounded-xl border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-750 dark:text-slate-355 outline-none w-48 focus:border-lime-500"
              />
              <button 
                onClick={() => setShowGadsConfig(false)}
                className="px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Xong
              </button>
            </div>
          ) : (
            <>
              {gadsStatus === "disconnected" && (
                <span className="text-[10px] text-slate-450 max-w-sm text-right hidden lg:inline">
                  Chạy hub GADS (`GADS hub --port=10000`) để đồng bộ thiết bị của bạn.
                </span>
              )}
              <button 
                onClick={() => setShowGadsConfig(true)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cấu hình GADS
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats cards & Token App row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1.8fr]">
        {/* Stat Card 1 */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#11121b]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{mockDevicesData.length}</div>
            <div className="text-xs font-black text-slate-500">Thiết bị</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#11121b]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {onlineCount} | {offlineCount}
            </div>
            <div className="text-xs font-black text-slate-500">Online|Offline</div>
          </div>
        </div>

        {/* Token App Card */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-150 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#11121b]">
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">Token App:</span>
            <input
              type="text"
              value="min_06d9cbd28aad4a82b"
              readOnly
              className="w-full max-w-[260px] rounded-xl border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-gray-800 dark:bg-slate-900 dark:text-slate-300 outline-none"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => alert("Đã làm mới token!")} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500 dark:text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500 dark:text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </button>
              <button onClick={() => { navigator.clipboard.writeText("min_06d9cbd28aad4a82b"); alert("Đã sao chép token!"); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500 dark:text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.675A2.25 2.25 0 0013.5 1.5H7.5A2.25 2.25 0 005.25 3.75m10.5 0A2.25 2.25 0 0118 6v12a2.25 2.25 0 01-2.25 2.25m-10.5-15h10.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Control toolbar */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Search row */}
        <div className="flex max-w-md items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, serial, proxy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-xs font-semibold text-slate-800 dark:border-gray-850 dark:bg-[#11121b] dark:text-white outline-none"
            />
            <svg className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
            </svg>
          </div>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-slate-100 dark:border-gray-850 dark:bg-[#11121b] dark:hover:bg-slate-800 transition cursor-pointer text-slate-500">
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            </svg>
          </button>
        </div>

        {/* Action buttons bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left side actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => alert("Đang tải lại danh sách...")} className="flex h-9 px-3.5 items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition cursor-pointer select-none">
              C
            </button>
            {/* Layout Switcher button */}
            <button
              onClick={() => setIsGridView(!isGridView)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer select-none ${
                isGridView ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-white border border-gray-200 text-slate-500 hover:bg-slate-50 dark:border-gray-800 dark:bg-[#11121b] dark:text-slate-400"
              }`}
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer transition select-none">
              Đã chọn: {selectedDeviceIds.length}
            </button>
            <button onClick={() => alert("Mở trình điều khiển đồng bộ...")} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs cursor-pointer transition select-none dark:bg-slate-800 dark:hover:bg-slate-750">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <span>Điều khiển đồng bộ</span>
            </button>
            <button onClick={() => alert("Gia hạn thiết bị...")} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer transition select-none">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Gia hạn</span>
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => alert("Reset all selected devices")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white font-black transition cursor-pointer select-none">
              ⏸
            </button>
            <button className="flex items-center gap-1 h-9 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-black text-xs cursor-pointer transition select-none">
              <span>Tiện ích</span>
              <span className="text-[10px]">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View of CSS Phone Frame Mockups */}
      {isGridView ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
          {filteredDevices.map((device) => {
            const isChecked = selectedDeviceIds.includes(device.id);
            return (
              <div key={device.id} className="flex flex-col">
                {/* Physical Phone Casing Shape */}
                <div className="relative w-full max-w-[170px] mx-auto aspect-[9/18.5] rounded-2xl border-[6px] border-slate-800 bg-slate-950 shadow-md transition hover:shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col overflow-hidden"
                  onClick={() => setSelectedDevice(device)}
                >
                  {/* Speaker & Front Camera Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-800 rounded-full z-20 flex items-center justify-center shadow-inner">
                    <span className="h-1 w-1 bg-slate-900 border border-slate-700/60 rounded-full ml-auto mr-1" />
                  </div>

                  {/* Floating Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSelectDevice(device.id, e.target.checked)}
                    className="absolute top-7 right-2.5 z-30 h-3.5 w-3.5 rounded border-slate-400 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />

                  {/* Inside Screen Content */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 mt-1 relative">
                    {/* Top Status Bar */}
                    <div className="h-5 bg-slate-900/90 text-white flex items-center justify-between px-2 text-[8px] font-bold select-none pt-1">
                      <span>14:32</span>
                      <div className="flex items-center gap-1 font-semibold">
                        <span>📶</span>
                        <span>{device.online ? `${device.battery}%` : "0%"}</span>
                        <span>{device.online ? "🔋" : "🔋"}</span>
                      </div>
                    </div>
                    {/* Main screen view */}
                    <div className="flex-1 bg-slate-900 overflow-hidden relative">
                      <PhoneScreenMockup state={device.screenState} />
                    </div>
                    {/* Bottom Home indicator line */}
                    <div className="h-3 bg-slate-900/95 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-slate-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Outside Caption */}
                <div className="mt-2 text-center">
                  <div className="text-[10px] font-black text-slate-800 truncate dark:text-white px-1 leading-tight">
                    {device.name}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 truncate dark:text-slate-400 mt-0.5 leading-none">
                    {device.proxyIp}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {device.online ? (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                        Offline
                      </span>
                    )}
                    <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 dark:text-slate-350 text-slate-500 px-1 py-0.5 rounded">
                      {device.plan}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table List Layout */
        <div className="overflow-x-auto rounded-2xl border border-gray-150 bg-white shadow-sm dark:border-gray-800 dark:bg-[#11121b]">
          <table className="w-full min-w-[1200px] border-collapse text-left text-xs font-medium text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/70 text-[10px] font-black uppercase text-slate-500 dark:border-gray-800 dark:bg-slate-900/40">
                <th className="p-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredDevices.length > 0 && selectedDeviceIds.length === filteredDevices.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">N...</th>
                <th className="p-3.5">Tên ↕</th>
                <th className="p-3.5">Serial</th>
                <th className="p-3.5 text-center">Hành ... ↕</th>
                <th className="p-3.5">Gói ↕</th>
                <th className="p-3.5">Online</th>
                <th className="p-3.5">Proxy</th>
                <th className="p-3.5">Proxy Name</th>
                <th className="p-3.5">Ghi chú</th>
                <th className="p-3.5">OS Version ↕</th>
                <th className="p-3.5 text-center">Các hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => {
                const isChecked = selectedDeviceIds.includes(device.id);
                return (
                  <tr key={device.id} className="border-b border-gray-100 hover:bg-slate-50/50 dark:border-gray-800 dark:hover:bg-slate-900/10">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectDevice(device.id, e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 font-bold text-slate-400">{device.no}</td>
                    <td className="p-3.5 font-extrabold text-slate-800 dark:text-white cursor-pointer hover:text-amber-500 transition" onClick={() => setSelectedDevice(device)}>
                      {device.name}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{device.serial}</td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 transition cursor-pointer">
                          ▶
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 transition cursor-pointer">
                          ■
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 transition cursor-pointer">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-355">
                        {device.plan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {device.online ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#1877f2] dark:text-[#4299e1] font-semibold">{device.proxyIp}</td>
                    <td className="p-3.5 text-slate-500 font-semibold">{device.proxyName}</td>
                    <td className="p-3.5 text-slate-500 font-semibold">{device.note}</td>
                    <td className="p-3.5">
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/10 dark:text-amber-500">
                        {device.os}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 hover:bg-slate-100 text-slate-500 dark:border-gray-800 dark:hover:bg-slate-800 transition cursor-pointer">
                          ✏️
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 dark:border-gray-800 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition cursor-pointer">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Live Control Viewport Modal */}
      <ViewportControllerModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </>
  );
}
