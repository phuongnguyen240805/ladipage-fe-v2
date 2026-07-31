"use client";

import React, { useEffect, useMemo, useState } from "react";
import AccountsTable from "@/features/facebook-ads/components/tai-khoan-qc/AccountsTable";
import ConfigModal from "@/features/facebook-ads/components/tai-khoan-qc/ConfigModal";
import ToolbarHeader from "@/features/facebook-ads/components/tai-khoan-qc/ToolbarHeader";
import UserProfileCard from "@/features/facebook-ads/components/tai-khoan-qc/UserProfileCard";
import UtilitiesPanel from "@/features/facebook-ads/components/tai-khoan-qc/UtilitiesPanel";
import type { AdsAccount, UtilityItem } from "@/features/facebook-ads/components/tai-khoan-qc/types";
import { adsAccountsService } from "@/features/facebook-ads/ads/ads-accounts.service";
import { hideClientLoading, showClientLoading, showClientToast } from "@/features/facebook-ads/shared/client-feedback";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Kích hoạt trả trước", enabled: true, color: "bg-amber-500" },
  { id: "2", name: "Thêm người", enabled: true, color: "bg-emerald-500" },
  { id: "3", name: "Thoát tài khoản", enabled: true, color: "bg-rose-500" },
  { id: "4", name: "Đóng mở tài khoản", enabled: true, color: "bg-teal-500" },
  { id: "5", name: "Xóa admin", enabled: true, color: "bg-red-500" },
  { id: "6", name: "Xóa đối tác", enabled: true, color: "bg-orange-500" },
  { id: "7", name: "Đổi tên tài khoản", enabled: true, color: "bg-lime-500" },
  { id: "8", name: "Share đối tác BM", enabled: true, color: "bg-sky-500" },
];

const mockAdsAccounts: AdsAccount[] = [
  {
    id: "mock-act-1001",
    name: "LDP - Chuyển đổi Landing Page",
    uid: "act_328194205018734",
    status: "ACTIVE",
    type: "BM",
    balance: "1.240.000đ",
    threshold: "5.000.000đ",
    limit: "2.000.000đ/ngày",
    currency: "VND",
    role: "Admin",
    paymentMethod: "Visa •••• 4821",
  },
  {
    id: "mock-act-1002",
    name: "Ecom Store - Retargeting",
    uid: "act_684920174563201",
    status: "ACTIVE",
    type: "BM",
    balance: "820.500đ",
    threshold: "3.000.000đ",
    limit: "1.500.000đ/ngày",
    currency: "VND",
    role: "Advertiser",
    paymentMethod: "Mastercard •••• 0932",
  },
  {
    id: "mock-act-1003",
    name: "CloudPhone - Lead Gen",
    uid: "act_901238456770112",
    status: "PENDING_REVIEW",
    type: "PERSONAL",
    balance: "0đ",
    threshold: "1.000.000đ",
    limit: "500.000đ/ngày",
    currency: "VND",
    role: "Admin",
    paymentMethod: "Momo Business",
  },
  {
    id: "mock-act-1004",
    name: "Dynamic Ads - Catalog",
    uid: "act_557001238964520",
    status: "ACTIVE",
    type: "BM",
    balance: "3.560.000đ",
    threshold: "10.000.000đ",
    limit: "4.000.000đ/ngày",
    currency: "VND",
    role: "Finance editor",
    paymentMethod: "Visa •••• 7750",
  },
  {
    id: "mock-act-1005",
    name: "Test Account - Tạm dừng",
    uid: "act_119874502330876",
    status: "DISABLED",
    type: "PERSONAL",
    balance: "125.000đ",
    threshold: "1.000.000đ",
    limit: "0đ/ngày",
    currency: "VND",
    role: "Admin",
    paymentMethod: "Chưa xác minh",
  },
];

export default function TaiKhoanQC() {
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "by-id" | "by-bm">("all");
  const [accountFilter, setAccountFilter] = useState<"all" | "personal" | "bm">("all");
  const [limitApi, setLimitApi] = useState(500);

  const [dataOptions, setDataOptions] = useState({
    financial: true,
    insights: true,
    adminRights: true,
    timestamps: true,
    hiddenAccounts: false,
    payments: false,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(0);

  const [utilities, setUtilities] = useState<UtilityItem[]>(initialUtilities);
  const [newUtilityName, setNewUtilityName] = useState("");
  const [isAddUtilityOpen, setIsAddUtilityOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCachedAccounts = async () => {
      const cachedAccounts = await adsAccountsService.getCachedAccounts().catch(() => []);
      if (!isMounted) return;

      setAccounts(cachedAccounts.length ? cachedAccounts : mockAdsAccounts);
      setDataLoaded(true);
      if (!cachedAccounts.length) {
        setLoadMessage("Đang hiển thị dữ liệu mock vì extension/API chưa kết nối.");
      }
    };

    void loadCachedAccounts();
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
    showClientLoading("Đang tải tài khoản quảng cáo...", "ads-accounts");

    const interval = window.setInterval(() => {
      setLoadingProgress((currentProgress) => (currentProgress >= 90 ? 90 : currentProgress + 15));
    }, 120);

    try {
      const refreshedAccounts = await adsAccountsService.refreshAccounts({
        sourceType,
        accountFilter,
        limit: limitApi,
        dataOptions,
      });

      const visibleAccounts = refreshedAccounts.length ? refreshedAccounts : mockAdsAccounts;
      const message = refreshedAccounts.length
        ? `Đã tải ${refreshedAccounts.length} tài khoản quảng cáo.`
        : "Extension/API chưa trả dữ liệu, đang hiển thị dữ liệu mock để xem UI.";

      setAccounts(visibleAccounts);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, refreshedAccounts.length ? "success" : "info");
      setLoadingProgress(100);
    } catch (error) {
      console.warn("[TaiKhoanQC] Cannot load ads accounts:", error);
      const cachedAccounts = await adsAccountsService.getCachedAccounts().catch(() => []);
      const message = cachedAccounts.length
        ? "Không tải được dữ liệu mới, đang hiển thị dữ liệu cache."
        : "Chưa có dữ liệu thật, đang hiển thị dữ liệu mock để xem UI.";

      setAccounts(cachedAccounts.length ? cachedAccounts : mockAdsAccounts);
      setDataLoaded(true);
      setLoadMessage(message);
      showClientToast(message, cachedAccounts.length ? "warning" : "info");
      setLoadingProgress(100);
    } finally {
      window.clearInterval(interval);
      hideClientLoading("ads-accounts");
      window.setTimeout(() => setIsLoading(false), 300);
    }
  };

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();

    return accounts.filter((account) => {
      const matchesSearch =
        !normalizedSearch ||
        account.name.toLowerCase().includes(normalizedSearch) ||
        account.uid.includes(normalizedSearch);

      const matchesType =
        accountFilter === "all" ||
        (accountFilter === "personal" && account.type === "PERSONAL") ||
        (accountFilter === "bm" && account.type === "BM");

      return matchesSearch && matchesType;
    });
  }, [accounts, searchQuery, accountFilter]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredAccounts.map((account) => account.id));
      setSelectedRegion(filteredAccounts.length > 0 ? 1 : 0);
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

    const colors = ["bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-violet-500", "bg-indigo-500"];
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
            accountFilter={accountFilter}
            setAccountFilter={setAccountFilter}
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

          <AccountsTable
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            dataLoaded={dataLoaded}
            filteredAccounts={filteredAccounts}
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
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
