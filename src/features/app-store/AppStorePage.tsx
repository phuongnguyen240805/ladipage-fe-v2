import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AppItem } from "./types";
import AppCard from "./components/AppCard";
import { markUninstalledAppId, readInstalledAppIds, saveInstalledAppIds } from "./storage/app-installation";

import { appDetailContent, initialApps } from "./data/app-catalog";

export default function AppStorePage() {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const defaultInstalledAppIds = useMemo(
    () => initialApps.filter((app) => app.status === "INSTALLED").map((app) => app.id),
    []
  );

  useEffect(() => {
    const installedIds = new Set(readInstalledAppIds(defaultInstalledAppIds));

    setApps((prev) =>
      prev.map((app) => ({
        ...app,
        status: installedIds.has(app.id) ? "INSTALLED" : "NOT_INSTALLED",
        price: installedIds.has(app.id) ? "Đã cài đặt" : app.price,
        isPinned: installedIds.has(app.id) ? true : app.isPinned,
      }))
    );
  }, [defaultInstalledAppIds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("app");
    if (appId) {
      setSelectedAppId(appId);
    }
  }, []);

  const syncInstalledApps = (updater: (ids: string[]) => string[]) => {
    const currentIds = readInstalledAppIds(defaultInstalledAppIds);
    const nextIds = updater(currentIds);
    saveInstalledAppIds(nextIds);
    return new Set(nextIds);
  };

  // Handler for installing an app
  const handleInstall = (id: string) => {
    const installedIds = syncInstalledApps((ids) => [...ids, id]);

    setApps((prev) =>
      prev.map((app) =>
        app.id === id || installedIds.has(app.id)
          ? { ...app, status: "INSTALLED", price: "Đã cài đặt", isPinned: true }
          : app
      )
    );
  };

  // Handler for uninstalling an app
  const handleUninstall = (id: string) => {
    markUninstalledAppId(id);
    const installedIds = syncInstalledApps((ids) => ids.filter((installedId) => installedId !== id));

    setApps((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: "NOT_INSTALLED", price: app.price === "Sắp ra mắt" ? app.price : "Miễn phí", isPinned: false }
          : installedIds.has(app.id)
            ? { ...app, status: "INSTALLED", price: "Đã cài đặt", isPinned: true }
            : app
      )
    );
  };

  // Handler for opening an app
  const handleOpen = (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (id === "10") {
      router.push("/facebook-ads/tai-khoan-qc");
    } else if (id === "14") {
      router.push("/cloudphone/cua-hang-cho-thue");
    } else if (id === "15") {
      router.push("/offerkit");
    } else if (id === "1") {
      router.push("/landing-pages");
    } else if (id === "2") {
      router.push("/ban-hang");
    } else if (id === "5") {
      router.push("/automation");
    } else if (id === "6") {
      router.push("/e-learning");
    } else if (id === "17") {
      router.push("/ai-seo");
    } else if (id === "18") {
      router.push("/site-metrics");
    } else if (id === "19") {
      router.push("/local");
    } else if (id === "20") {
      router.push("/content");
    } else if (id === "21") {
      router.push("/keywords");
    } else if (id === "22") {
      router.push("/bao-cao");
    } else if (id === "23") {
      router.push("/authority");
    } else {
      alert(`Mở ứng dụng: ${app?.name}`);
    }
  };

  const handleDetails = (id: string) => {
    setSelectedAppId(id);
    router.push(`/kho-ung-dung?app=${id}`);
  };

  const handleBackToStore = () => {
    setSelectedAppId(null);
    router.push("/kho-ung-dung");
  };

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === selectedAppId) ?? null,
    [apps, selectedAppId]
  );

  // Get tab counts dynamically
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      marketing: 0,
      sales: 0,
      conversion: 0,
      content: 0,
      upcoming: 0,
    };

    apps.forEach((app) => {
      if (app.category !== "upcoming") {
        counts.all += 1;
      }
      counts[app.category] += 1;
    });

    return counts;
  }, [apps]);

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Search filter
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab category filter
      if (activeTab === "all") {
        return app.category !== "upcoming";
      }
      return app.category === activeTab;
    });
  }, [apps, activeTab, searchQuery]);

  // Group filtered apps into Pinned (Đã ghim) vs Recommended (Đề xuất)
  const pinnedApps = useMemo(() => {
    return filteredApps.filter((app) => app.isPinned && app.category !== "upcoming");
  }, [filteredApps]);

  const recommendedApps = useMemo(() => {
    // If it's upcoming, show everything in one list. Otherwise show non-pinned as recommended
    if (activeTab === "upcoming") {
      return filteredApps;
    }
    return filteredApps.filter((app) => !app.isPinned);
  }, [filteredApps, activeTab]);

  const selectedAppDetails = selectedApp
    ? appDetailContent[selectedApp.id] ?? {
        provider: "LadiPage",
        price: selectedApp.price,
        features: ["Quản lý tập trung", "Thiết lập nhanh", "Theo dõi hiệu quả", "Kết nối hệ sinh thái"],
        benefits: [
          { title: "Triển khai nhanh", items: ["Cài đặt và sử dụng ngay trong hệ thống", "Phù hợp cho đội vận hành, marketing và bán hàng"] },
          { title: "Quản lý dễ dàng", items: ["Theo dõi trạng thái cài đặt trong kho ứng dụng", "Mở hoặc gỡ ứng dụng bất cứ lúc nào"] },
          { title: "Tích hợp linh hoạt", items: ["Kết nối cùng các công cụ đang dùng", "Mở rộng theo nhu cầu vận hành"] },
          { title: "Tối ưu quy trình", items: ["Giảm thao tác lặp lại", "Tập trung dữ liệu trong một nơi"] },
        ],
        integrations: selectedApp.tags ?? ["LadiPage", "Automation"],
      }
    : null;

  if (selectedApp && selectedAppDetails) {
    const isInstalled = selectedApp.status === "INSTALLED";

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-gray-800 dark:text-gray-200">
        <button
          type="button"
          onClick={handleBackToStore}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-[#11121e] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19 8 12l7-7" />
          </svg>
          Quay lại kho ứng dụng
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-[#11121e]">
          <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-50 text-2xl font-black text-lime-600 dark:bg-lime-950/30 dark:text-lime-300">
                {selectedApp.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">{selectedApp.name}</h1>
                <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Bởi <span className="text-gray-900 dark:text-white">{selectedAppDetails.provider}</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                    isInstalled
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                  }`}>
                    {isInstalled ? "Đã cài đặt" : "Chưa cài đặt"}
                  </span>
                  <span className="font-black text-blue-700 dark:text-blue-300">{selectedAppDetails.price}</span>
                  {selectedApp.downloads && (
                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {selectedApp.downloads}
                    </span>
                  )}
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">{selectedApp.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {isInstalled ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpen(selectedApp.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white shadow-theme-xs transition hover:bg-blue-800"
                      >
                        Mở ứng dụng
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUninstall(selectedApp.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                      >
                        Gỡ cài đặt
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInstall(selectedApp.id)}
                      className="rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-black text-white shadow-theme-xs transition hover:bg-lime-600"
                    >
                      Cài ứng dụng
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-950/20"
                  >
                    Nâng cấp ngay
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
              {isInstalled && (
                <button type="button" onClick={() => handleUninstall(selectedApp.id)} className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.67.1 1 .16M18.16 19.67A2.25 2.25 0 0 1 15.92 21H8.08a2.25 2.25 0 0 1-2.24-1.33L4.5 6.75m15 0H4.5m3.75 0V4.5A1.5 1.5 0 0 1 9.75 3h4.5a1.5 1.5 0 0 1 1.5 1.5v2.25" />
                  </svg>
                  Gỡ cài đặt
                </button>
              )}
              <span className="text-orange-500">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M12.9 2.1c-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3L9.6 3.8 6.4.6C6-.2 4.8-.2 4 .6l-.3.3c-.8.8-.8 2 0 2.8l3.2 3.2-1.7 1.7c-.5-.2-1.1-.1-1.5.3L2 10.6c-.4.4-.4 1.1 0 1.5l1.6 1.6-3 3c-.4.4-.4 1.1 0 1.5.2.2.5.3.8.3s.6-.1.8-.3l3-3 1.6 1.6c.2.2.5.3.8.3.3 0 .6-.1.8-.3l1.8-1.8c.4-.4.5-1 .3-1.5l1.7-1.7 3.2 3.2c.4.4 1 .4 1.4 0l.3-.3c.8-.8.8-2 0-2.8l-3.2-3.2 1.7-1.7c.2.2.5.3.8.3.3 0 .6-.1.8-.3.4-.4.4-1.1 0-1.5z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6 dark:border-gray-800">
            <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Tính năng nổi bật</h2>
            <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
              {selectedAppDetails.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6">
            <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Lợi ích nổi bật</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedAppDetails.benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-3 text-sm font-black text-gray-900 dark:text-white">{benefit.title}</h3>
                  <div className="space-y-2">
                    {benefit.items.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5 dark:border-gray-800">
            <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">Tích hợp với</h2>
            <div className="flex flex-wrap gap-2">
              {selectedAppDetails.integrations.map((integration) => (
                <span key={integration} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-50 text-xs font-black text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                    {integration.slice(0, 1)}
                  </span>
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-gray-800 dark:text-gray-200">
      {/* Title Header */}
      <div className="flex flex-col text-left">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          Kho ứng dụng
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {apps.length}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
          Khám phá và cài đặt các ứng dụng mở rộng
        </p>
      </div>

      {/* Tabs navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 dark:border-gray-800 pb-px gap-4 select-none">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {[
            { id: "all", label: "Tất cả" },
            { id: "marketing", label: "Marketing" },
            { id: "sales", label: "Bán hàng" },
            { id: "conversion", label: "Chuyển đổi" },
            { id: "content", label: "Nội dung" },
            { id: "upcoming", label: "Sắp ra mắt", isHighlight: true },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`pb-3 px-3 relative font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer hover:text-lime-500 dark:hover:text-lime-300 ${
                  isActive
                    ? "text-lime-500 dark:text-lime-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.isHighlight && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                <span>{tab.label}</span>
                <span className="text-[10px] font-semibold opacity-70">
                  {tabCounts[tab.id]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-500 dark:bg-lime-300 animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all shadow-theme-xs"
          />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>
      </div>

      {/* Main Apps Grid Display */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[350px] text-center bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl">
          <div className="w-16 h-16 bg-lime-50 dark:bg-lime-950/20 text-lime-500 dark:text-lime-300 rounded-full flex items-center justify-center mb-4 border border-lime-50 dark:border-lime-900/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Không tìm thấy ứng dụng</h3>
          <p className="text-xs text-gray-400 max-w-xs">Thử tìm kiếm từ khóa khác hoặc chuyển danh mục tabs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Pinned Apps Category */}
          {pinnedApps.length > 0 && activeTab !== "upcoming" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left">
                Đã ghim
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pinnedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onInstall={handleInstall}
                    onUninstall={handleUninstall}
                    onOpen={handleOpen}
                    onDetails={handleDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended / All remaining Apps Category */}
          {recommendedApps.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left">
                {activeTab === "upcoming" ? "Sắp ra mắt" : "Đề xuất cho bạn"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recommendedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onInstall={handleInstall}
                    onUninstall={handleUninstall}
                    onOpen={handleOpen}
                    onDetails={handleDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-[#11121e]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-lime-500 dark:text-lime-300">
                  Chi tiết sản phẩm
                </div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedApp.name}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{selectedApp.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppId(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                <div className="font-bold text-gray-400">Trạng thái</div>
                <div className="mt-1 font-black text-gray-900 dark:text-white">
                  {selectedApp.status === "INSTALLED" ? "Đã cài đặt" : "Chưa cài đặt"}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                <div className="font-bold text-gray-400">Lượt tải</div>
                <div className="mt-1 font-black text-gray-900 dark:text-white">{selectedApp.downloads ?? "Đang cập nhật"}</div>
              </div>
            </div>

            {selectedApp.tags && selectedApp.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedApp.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-lime-50 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              {selectedApp.status === "INSTALLED" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleUninstall(selectedApp.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                  >
                    Gỡ ứng dụng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpen(selectedApp.id)}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    Mở ứng dụng
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleInstall(selectedApp.id)}
                  className="rounded-xl bg-lime-500 px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-lime-600"
                >
                  Cài ứng dụng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
