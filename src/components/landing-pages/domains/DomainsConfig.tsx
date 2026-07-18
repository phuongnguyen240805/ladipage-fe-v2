"use client";

import React, { useMemo, useState } from "react";
import type { PlanTier } from "@liora/api-types";
import { DomainItem } from "../dung-chung/types";
import { IconSearch } from "../dung-chung/icons";
import { CreateDomainModal, TEST_CUSTOMER_DOMAIN_HINT } from "./CreateDomainModal";

interface DomainsConfigProps {
  domains: DomainItem[];
  domainsUsed: number;
  domainsLimit: number;
  subscriptionTier: PlanTier;
  canCreateDomain: boolean;
  onAddDomain: (name: string, platform: string) => void | Promise<void>;
  onUpgradePlan: () => void;
}

function DomainLockIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function isCustomerDomainEdgeTestEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_LANDING_DOMAIN_BYPASS_QUOTA === "true"
  );
}

function getTestCnameTarget(): string {
  return (
    process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET?.trim() ||
    process.env.NEXT_PUBLIC_FREE_SITE_DOMAIN?.trim() ||
    TEST_CUSTOMER_DOMAIN_HINT
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "VERIFIED" || s === "ACTIVE") {
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-black text-success-700 bg-success-100 dark:text-success-300 dark:bg-success-950/40 rounded-md tracking-wider">
        ĐÃ XÁC THỰC
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-black text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 rounded-md tracking-wider">
        CHỜ DNS / SSL
      </span>
    );
  }
  if (s === "ERROR" || s === "FAILED") {
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-black text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/40 rounded-md tracking-wider">
        LỖI
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-750 bg-slate-100 dark:text-slate-400 dark:bg-gray-800 rounded-md tracking-wider">
      CHƯA XÁC THỰC
    </span>
  );
}

function SslBadge({ sslStatus }: { sslStatus: string }) {
  const s = sslStatus.toUpperCase();
  if (s === "ACTIVE") {
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-black text-lime-600 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/40 rounded-md tracking-wider">
        ĐÃ BẬT
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-black text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 rounded-md tracking-wider">
        CHỜ
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-750 bg-slate-100 dark:text-slate-400 dark:bg-gray-800 rounded-md tracking-wider">
      CHƯA BẬT
    </span>
  );
}

export const DomainsConfig: React.FC<DomainsConfigProps> = ({
  domains,
  domainsUsed,
  domainsLimit,
  subscriptionTier,
  canCreateDomain,
  onAddDomain,
  onUpgradePlan,
}) => {
  const testMode = isCustomerDomainEdgeTestEnabled();
  const testHostname = TEST_CUSTOMER_DOMAIN_HINT;
  const cnameTarget = getTestCnameTarget();

  const isFreePlan = subscriptionTier === "free";
  const isDomainLocked = !canCreateDomain;
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastDnsHint, setLastDnsHint] = useState<string | null>(null);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (canCreateDomain) {
      setCreateError(null);
      setIsModalOpen(true);
      return;
    }
    onUpgradePlan();
  };

  const handleCreateDomain = async (name: string, platform: string) => {
    setIsSubmitting(true);
    setCreateError(null);
    try {
      await onAddDomain(name, platform);
      setLastDnsHint(`CNAME ${name} → ${cnameTarget}`);
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo tên miền.";
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDomains = useMemo(
    () =>
      domains.filter((d) => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = platformFilter === "ALL" || d.platform === platformFilter;
        return matchesSearch && matchesPlatform;
      }),
    [domains, platformFilter, searchQuery],
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredDomains.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const quotaLabel =
    domainsLimit < 0 ? `${domainsUsed}/∞` : `${domainsUsed}/${domainsLimit}`;

  return (
    <div className="space-y-6 relative">
      {lastDnsHint ? (
        <div className="rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-[13px] text-lime-950 dark:border-lime-900 dark:bg-lime-950/30 dark:text-lime-100">
          <strong>DNS:</strong> trỏ{" "}
          <code className="font-mono text-xs">{lastDnsHint}</code> rồi đợi verify (hoặc
          refresh domain).
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Tên miền
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý tên miền tùy chỉnh cho Landing Page (gói Premium). Đã dùng:{" "}
            <strong className="text-slate-700 dark:text-slate-200">{quotaLabel}</strong>
            {isDomainLocked && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400 font-semibold">
                {isFreePlan
                  ? "Gói Free chưa hỗ trợ tên miền tùy chỉnh — nâng cấp để kích hoạt."
                  : "Đã đạt giới hạn tên miền — nâng cấp gói để thêm."}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={handleCreateClick}
              title={canCreateDomain ? "Tạo tên miền mới" : "Nâng cấp gói để thêm tên miền"}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
            >
              <span>+ Tạo tên miền</span>
            </button>
            {isDomainLocked && (
              <span
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-md ring-2 ring-white dark:ring-gray-900"
                aria-hidden
              >
                <DomainLockIcon className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full md:w-36 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
            >
              <option value="ALL">Nền tảng</option>
              <option value="LadiPage">LadiPage</option>
              <option value="WordPress">WordPress</option>
              <option value="Shopify">Shopify</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {filteredDomains.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredDomains.length > 0 && selectedIds.length === filteredDomains.length}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Tên miền
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    DNS / CNAME
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Nền tảng
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    SSL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDomains.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const dns =
                    item.dnsInstruction ||
                    (item.cnameTarget ? `CNAME ${item.name} → ${item.cnameTarget}` : null) ||
                    (testMode ? `CNAME ${item.name} → ${cnameTarget}` : "—");
                  return (
                    <tr
                      key={item.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10 ${
                        isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={String(item.status)} />
                      </td>
                      <td className="py-3.5 px-4 text-[12px] font-mono text-slate-600 dark:text-slate-400 max-w-[220px] truncate" title={dns}>
                        {dns}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.platform}
                      </td>
                      <td className="py-3.5 px-4">
                        <SslBadge sslStatus={String(item.sslStatus)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center space-y-4 select-none">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-lime-400/40 dark:border-lime-300/30 flex items-center justify-center text-lime-400 dark:text-lime-300 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-slate-800 dark:text-gray-300">
            Chưa có tên miền nào
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
            Thêm tên miền tùy chỉnh để publish Landing Page trên domain riêng (gói Premium).
          </p>
          <div className="relative mt-2">
            <button
              type="button"
              onClick={handleCreateClick}
              title={canCreateDomain ? "Tạo tên miền mới" : "Nâng cấp gói để thêm tên miền"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-white hover:bg-lime-600"
            >
              <span>+ Tạo tên miền</span>
            </button>
            {isDomainLocked && (
              <span
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow-md ring-2 ring-white dark:ring-gray-900"
                aria-hidden
              >
                <DomainLockIcon className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      )}

      <CreateDomainModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setCreateError(null);
          }
        }}
        onCreateDomain={handleCreateDomain}
        testHostname={testMode ? testHostname : undefined}
        cnameTarget={cnameTarget}
        isSubmitting={isSubmitting}
        errorMessage={createError}
      />
    </div>
  );
};
