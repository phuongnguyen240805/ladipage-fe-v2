"use client";

import React, { useEffect, useMemo, useState } from "react";
import BMsTable from "@/features/facebook-ads/components/tai-khoan-bm/BMsTable";
import ConfigModal from "@/features/facebook-ads/components/tai-khoan-bm/ConfigModal";
import ToolbarHeader from "@/features/facebook-ads/components/tai-khoan-bm/ToolbarHeader";
import UserProfileCard from "@/features/facebook-ads/components/tai-khoan-bm/UserProfileCard";
import UtilitiesPanel from "@/features/facebook-ads/components/tai-khoan-bm/UtilitiesPanel";
import type { BusinessManager, UtilityItem } from "@/features/facebook-ads/components/tai-khoan-bm/types";
import { businessManagersService } from "@/features/facebook-ads/bm/business-managers.service";
import { hideClientLoading, showClientLoading, showClientToast } from "@/features/facebook-ads/shared/client-feedback";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Kích BM3", enabled: true, color: "bg-orange-500" },
  { id: "2", name: "Thêm tài sản cho user", enabled: true, color: "bg-lime-500" },
  { id: "3", name: "Backup BM", enabled: true, color: "bg-emerald-500" },
  { id: "4", name: "Nhóm tài sản BM", enabled: true, color: "bg-purple-500" },
  { id: "5", name: "Hủy lời mời", enabled: true, color: "bg-red-500" },
  { id: "6", name: "Nhét dòng 1 BM", enabled: true, color: "bg-amber-500" },
  { id: "7", name: "Tạo TKQC", enabled: true, color: "bg-sky-500" },
  { id: "8", name: "Tạo ứng dụng", enabled: true, color: "bg-teal-500" },
];

const mockBusinessManagers: BusinessManager[] = [
  {
    id: "mock-bm-1",
    name: "LadiPage Growth Hub",
    bmId: "10084920491834",
    status: "ACTIVE",
    limit: "Không giới hạn",
    pagesCount: 12,
    partnersCount: 4,
    adminsCount: 6,
    instagramCount: 3,
    whatsappCount: 1,
    paymentMethod: "Visa •••• 4821",
  },
  {
    id: "mock-bm-2",
    name: "Ecom Store Việt Nam",
    bmId: "26790184455203",
    status: "ACTIVE",
    limit: "25 tài khoản QC",
    pagesCount: 8,
    partnersCount: 2,
    adminsCount: 5,
    instagramCount: 2,
    whatsappCount: 1,
    paymentMethod: "Mastercard •••• 0932",
  },
  {
    id: "mock-bm-3",
    name: "CloudPhone Agency",
    bmId: "55012390764211",
    status: "PENDING_REVIEW",
    limit: "10 tài khoản QC",
    pagesCount: 5,
    partnersCount: 1,
    adminsCount: 3,
    instagramCount: 1,
    whatsappCount: 0,
    paymentMethod: "Đang xác minh",
  },
  {
    id: "mock-bm-4",
    name: "BM Test - Tạm khóa",
    bmId: "90450128773109",
    status: "DISABLED",
    limit: "0",
    pagesCount: 2,
    partnersCount: 0,
    adminsCount: 2,
    instagramCount: 0,
    whatsappCount: 0,
    paymentMethod: "Không khả dụng",
  },
];

export default function TaiKhoanBM() {
  const [bms, setBms] = useState<BusinessManager[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "by-id">("all");
  const [bmFilter, setBmFilter] = useState<"all" | "active" | "disabled">("all");
  const [limitApi, setLimitApi] = useState(50);
  const [advancedConfig, setAdvancedConfig] = useState(true);

  const [dataOptions, setDataOptions] = useState({
    status: true,
    page: true,
    limit: true,
    bmAccount: true,
    partner: true,
    admin: true,
    instagram: true,
    whatsapp: true,
    share: true,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(0);

  const [utilities, setUtilities] = useState<UtilityItem[]>(initialUtilities);
  const [newUtilityName, setNewUtilityName] = useState("");
  const [isAddUtilityOpen, setIsAddUtilityOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCachedBms = async () => {
      const cachedBms = await businessManagersService.getCachedManagers().catch(() => []);
      if (!isMounted) return;

      setBms(cachedBms.length ? cachedBms : mockBusinessManagers);
      setDataLoaded(true);
      if (!cachedBms.length) {
        setLoadMessage("Đang hiển thị dữ liệu mock vì extension/API chưa kết nối.");
      }
    };

    void loadCachedBms();
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
    showClientLoading("Đang tải Business Manager...", "business-managers");

    const interval = window.setInterval(() => {
      setLoadingProgress((currentProgress) => (currentProgress >= 90 ? 90 : currentProgress + 15));
    }, 120);

    try {
      const refreshedBms = await businessManagersService.refreshManagers({
        sourceType,
        bmFilter,
        limit: limitApi,
        dataOptions,
      });

      const visibleBms = refreshedBms.length ? refreshedBms : mockBusinessManagers;
      const message = refreshedBms.length
        ? `Đã tải ${refreshedBms.length} Business Manager.`
        : "Extension/API chưa trả dữ liệu, đang hiển thị dữ liệu mock để xem UI.";

      setBms(visibleBms);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, refreshedBms.length ? "success" : "info");
      setLoadingProgress(100);
    } catch (error) {
      console.warn("[TaiKhoanBM] Cannot load business managers:", error);
      const cachedBms = await businessManagersService.getCachedManagers().catch(() => []);
      const message = cachedBms.length
        ? "Không tải được dữ liệu mới, đang hiển thị dữ liệu cache."
        : "Chưa có dữ liệu thật, đang hiển thị dữ liệu mock để xem UI.";

      setBms(cachedBms.length ? cachedBms : mockBusinessManagers);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, cachedBms.length ? "warning" : "info");
      setLoadingProgress(100);
    } finally {
      window.clearInterval(interval);
      hideClientLoading("business-managers");
      window.setTimeout(() => setIsLoading(false), 300);
    }
  };

  const filteredBMs = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();

    return bms.filter((bm) => {
      const matchesSearch =
        !normalizedSearch ||
        bm.name.toLowerCase().includes(normalizedSearch) ||
        bm.bmId.includes(normalizedSearch);

      const matchesStatus =
        bmFilter === "all" ||
        (bmFilter === "active" && bm.status === "ACTIVE") ||
        (bmFilter === "disabled" && bm.status === "DISABLED");

      return matchesSearch && matchesStatus;
    });
  }, [bms, searchQuery, bmFilter]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredBMs.map((bm) => bm.id));
      setSelectedRegion(filteredBMs.length > 0 ? 1 : 0);
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

    const colors = ["bg-orange-500", "bg-lime-500", "bg-emerald-500", "bg-purple-500", "bg-red-500"];
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
            bmFilter={bmFilter}
            setBmFilter={setBmFilter}
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

          <BMsTable
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            dataLoaded={dataLoaded}
            filteredBMs={filteredBMs}
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
        advancedConfig={advancedConfig}
        setAdvancedConfig={setAdvancedConfig}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
