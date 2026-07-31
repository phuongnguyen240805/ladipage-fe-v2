"use client";

import React, { useEffect, useMemo, useState } from "react";
import ConfigModal from "@/features/facebook-ads/components/fanpage/ConfigModal";
import PagesTable from "@/features/facebook-ads/components/fanpage/PagesTable";
import ToolbarHeader from "@/features/facebook-ads/components/fanpage/ToolbarHeader";
import UserProfileCard from "@/features/facebook-ads/components/fanpage/UserProfileCard";
import UtilitiesPanel from "@/features/facebook-ads/components/fanpage/UtilitiesPanel";
import type { FanpageItem, UtilityItem } from "@/features/facebook-ads/components/fanpage/types";
import { fanpagesService } from "@/features/facebook-ads/page/fanpages.service";
import { hideClientLoading, showClientLoading, showClientToast } from "@/features/facebook-ads/shared/client-feedback";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Thêm vào nhóm tài sản", enabled: true, color: "bg-orange-500" },
  { id: "2", name: "Chỉ định Page BM", enabled: true, color: "bg-teal-500" },
  { id: "3", name: "Đổi Avatar & Cover", enabled: true, color: "bg-lime-500" },
  { id: "4", name: "Đổi thông tin Page", enabled: true, color: "bg-amber-500" },
  { id: "5", name: "Xóa bài viết", enabled: true, color: "bg-purple-500" },
  { id: "6", name: "Xóa QTV Page", enabled: true, color: "bg-red-500" },
  { id: "7", name: "Xóa Page khỏi BM", enabled: true, color: "bg-rose-500" },
  { id: "8", name: "Đổi tên Page", enabled: true, color: "bg-indigo-500" },
  { id: "9", name: "Share Page", enabled: true, color: "bg-sky-500" },
];

const mockFanpages: FanpageItem[] = [
  {
    id: "mock-page-1",
    name: "LadiPage Việt Nam",
    pageId: "102938475610",
    status: "ACTIVE",
    followers: "248.920",
    postsCount: 1264,
    verification: "BLUE",
    distribution: "Đề xuất tốt",
    monetization: "Đủ điều kiện",
  },
  {
    id: "mock-page-2",
    name: "Ecom Store Demo",
    pageId: "204857392110",
    status: "ACTIVE",
    followers: "86.430",
    postsCount: 642,
    verification: "GRAY",
    distribution: "Ổn định",
    monetization: "Đang xét",
  },
  {
    id: "mock-page-3",
    name: "CloudPhone Automation",
    pageId: "593820147662",
    status: "PENDING_REVIEW",
    followers: "32.110",
    postsCount: 218,
    verification: "NONE",
    distribution: "Giới hạn nhẹ",
    monetization: "Chưa đủ điều kiện",
  },
  {
    id: "mock-page-4",
    name: "Dynamic Ads Lab",
    pageId: "778120034592",
    status: "DISABLED",
    followers: "12.084",
    postsCount: 89,
    verification: "NONE",
    distribution: "Tạm dừng",
    monetization: "Không khả dụng",
  },
];

export default function Fanpage() {
  const [pages, setPages] = useState<FanpageItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "mine" | "by-bm" | "by-id">("all");
  const [pageFilter] = useState<"all" | "active" | "disabled">("all");
  const [limitApi, setLimitApi] = useState(100);

  const [threads, setThreads] = useState(3);
  const [delay, setDelay] = useState(0);

  const [dataOptions, setDataOptions] = useState({
    status: true,
    badge: true,
    likes: true,
    posts: true,
    live: true,
    monetize: true,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(0);

  const [utilities, setUtilities] = useState<UtilityItem[]>(initialUtilities);
  const [newUtilityName, setNewUtilityName] = useState("");
  const [isAddUtilityOpen, setIsAddUtilityOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCachedPages = async () => {
      const cachedPages = await fanpagesService.getCachedPages().catch(() => []);
      if (!isMounted) return;

      setPages(cachedPages.length ? cachedPages : mockFanpages);
      setDataLoaded(true);
      if (!cachedPages.length) {
        setLoadMessage("Đang hiển thị dữ liệu mock vì extension/API chưa kết nối.");
      }
    };

    void loadCachedPages();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadData = async () => {
    setIsConfigModalOpen(false);
    setIsLoading(true);
    setLoadingProgress(0);
    setSelectedIds([]);
    setLoadMessage("");
    showClientLoading("Đang tải danh sách Fanpage...", "fanpages");

    const interval = window.setInterval(() => {
      setLoadingProgress((currentProgress) => (currentProgress >= 90 ? 90 : currentProgress + 15));
    }, 120);

    try {
      const refreshedPages = await fanpagesService.refreshPages({
        sourceType,
        pageFilter,
        limit: limitApi,
        dataOptions,
      });

      const visiblePages = refreshedPages.length ? refreshedPages : mockFanpages;
      const message = refreshedPages.length
        ? `Đã tải ${refreshedPages.length} Fanpage.`
        : "Extension/API chưa trả dữ liệu, đang hiển thị dữ liệu mock để xem UI.";

      setPages(visiblePages);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, refreshedPages.length ? "success" : "info");
      setLoadingProgress(100);
    } catch (error) {
      console.warn("[Fanpage] Cannot load pages:", error);
      const cachedPages = await fanpagesService.getCachedPages().catch(() => []);
      const message = cachedPages.length
        ? "Không tải được dữ liệu mới, đang hiển thị dữ liệu cache."
        : "Chưa có dữ liệu thật, đang hiển thị dữ liệu mock để xem UI.";

      setPages(cachedPages.length ? cachedPages : mockFanpages);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, cachedPages.length ? "warning" : "info");
      setLoadingProgress(100);
    } finally {
      window.clearInterval(interval);
      hideClientLoading("fanpages");
      window.setTimeout(() => setIsLoading(false), 300);
    }
  };

  const filteredPages = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();

    return pages.filter((page) => {
      const matchesSearch =
        !normalizedSearch ||
        page.name.toLowerCase().includes(normalizedSearch) ||
        page.pageId.includes(normalizedSearch);

      const matchesStatus =
        pageFilter === "all" ||
        (pageFilter === "active" && page.status === "ACTIVE") ||
        (pageFilter === "disabled" && page.status === "DISABLED");

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, pageFilter]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredPages.map((page) => page.id));
      setSelectedRegion(filteredPages.length > 0 ? 1 : 0);
      return;
    }

    setSelectedIds([]);
    setSelectedRegion(0);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((currentIds) => [...currentIds, id]);
      if (selectedRegion === 0) setSelectedRegion(1);
      return;
    }

    const updatedIds = selectedIds.filter((item) => item !== id);
    setSelectedIds(updatedIds);
    if (updatedIds.length === 0) setSelectedRegion(0);
  };

  const handleToggleUtility = (id: string) => {
    setUtilities((currentUtilities) =>
      currentUtilities.map((utility) => (utility.id === id ? { ...utility, enabled: !utility.enabled } : utility))
    );
  };

  const handleDeleteUtility = (id: string) => {
    setUtilities((currentUtilities) => currentUtilities.filter((utility) => utility.id !== id));
  };

  const handleAddUtility = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUtilityName.trim()) return;

    const colors = ["bg-orange-500", "bg-teal-500", "bg-lime-500", "bg-amber-500", "bg-purple-500"];
    const nextColor = colors[utilities.length % colors.length];

    setUtilities((currentUtilities) => [
      ...currentUtilities,
      {
        id: String(Date.now()),
        name: newUtilityName.trim(),
        enabled: true,
        color: nextColor,
      },
    ]);
    setNewUtilityName("");
    setIsAddUtilityOpen(false);
  };

  const handleMoveUtility = (index: number, direction: "up" | "down") => {
    const updatedUtilities = [...utilities];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updatedUtilities.length) return;

    const currentUtility = updatedUtilities[index];
    updatedUtilities[index] = updatedUtilities[targetIndex];
    updatedUtilities[targetIndex] = currentUtility;
    setUtilities(updatedUtilities);
  };

  return (
    <div className="flex min-h-[calc(100vh-46px)] w-full flex-col text-gray-800 dark:text-gray-200">
      <div className="flex w-full shrink-0 flex-col justify-between sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <ToolbarHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            threads={threads}
            setThreads={setThreads}
            delay={delay}
            setDelay={setDelay}
            selectedIdsCount={selectedIds.length}
            dataLoaded={dataLoaded}
            isLoading={isLoading}
            handleLoadData={handleLoadData}
          />
        </div>
        <div className="shrink-0">
          <UserProfileCard />
        </div>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-[550px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-150 dark:border-gray-800">
          {loadMessage && (
            <div className="border-b border-gray-150 bg-lime-50 px-4 py-2 text-xs font-semibold text-lime-700 dark:border-gray-800 dark:bg-lime-950/20 dark:text-lime-200">
              {loadMessage}
            </div>
          )}

          <PagesTable
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            dataLoaded={dataLoaded}
            filteredPages={filteredPages}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            dataOptions={dataOptions}
            selectedRegion={selectedRegion}
            openConfig={() => setIsConfigModalOpen(true)}
          />
        </div>

        <div className="flex w-full shrink-0 flex-col bg-gray-50/20 dark:bg-gray-950/10 lg:w-[320px]">
          <UtilitiesPanel
            utilities={utilities}
            onToggleUtility={handleToggleUtility}
            onDeleteUtility={handleDeleteUtility}
            onMoveUtility={handleMoveUtility}
            newUtilityName={newUtilityName}
            setNewUtilityName={setNewUtilityName}
            isAddUtilityOpen={isAddUtilityOpen}
            setIsAddUtilityOpen={setIsAddUtilityOpen}
            onAddUtility={handleAddUtility}
          />
        </div>
      </div>

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        sourceType={sourceType}
        setSourceType={setSourceType}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
