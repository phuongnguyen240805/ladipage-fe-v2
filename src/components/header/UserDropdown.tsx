"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Modal } from "../ui/modal";

type UpgradeStep = 1 | 2 | 3 | 4;
type PlanId = "core" | "grow" | "max";
type AddonCategoryId = "storage" | "orders" | "customers" | "products";

type AddonOption = {
  id: string;
  label: string;
  price: number;
  billing: "Theo chu kỳ gói" | "Hàng tháng";
};

const steps: Array<{ id: UpgradeStep; label: string }> = [
  { id: 1, label: "Chọn gói" },
  { id: 2, label: "Addons" },
  { id: 3, label: "Xem lại & thanh toán" },
  { id: 4, label: "Xác nhận" },
];

const upgradePlans = [
  {
    id: "core" as const,
    name: "CORE",
    price: 3360000,
    description: "Dành cho cá nhân, nhà quảng cáo",
    monthlyLabel: "280.000 đ / tháng quy đổi",
    features: [
      "100 Landing page",
      "10 Tên miền tùy chỉnh",
      "100.000 Lượt truy cập/tháng",
      "10 Tích hợp tài khoản liên kết",
      "100 Đơn hàng/tháng",
      "10 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
  {
    id: "grow" as const,
    name: "GROW",
    price: 5400000,
    description: "Dành cho doanh nghiệp đang phát triển",
    monthlyLabel: "450.000 đ / tháng quy đổi",
    badge: "Best value",
    popular: true,
    features: [
      "1.000 Landing page",
      "50 Tên miền tùy chỉnh",
      "500.000 Lượt truy cập/tháng",
      "30 Tích hợp tài khoản liên kết",
      "250 Đơn hàng/tháng",
      "50 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
  {
    id: "max" as const,
    name: "MAX",
    price: 7200000,
    description: "Gói cao cấp không giới hạn tính năng",
    monthlyLabel: "600.000 đ / tháng quy đổi",
    features: [
      "Không giới hạn Landing page",
      "300 Tên miền tùy chỉnh",
      "Không giới hạn Lượt truy cập/tháng",
      "Không giới hạn Tích hợp tài khoản liên kết",
      "500 Đơn hàng/tháng",
      "300 Sản phẩm",
      "Xác nhận tự động đơn hàng chuyển khoản",
    ],
  },
];

const addonGroups: Array<{
  id: AddonCategoryId;
  title: string;
  subtitle: string;
  badge: AddonOption["billing"];
  icon: "storage" | "orders" | "customers" | "products";
  options: AddonOption[];
}> = [
  {
    id: "storage",
    title: "Dung lượng lưu trữ",
    subtitle: "Mua thêm dung lượng lưu trữ cho tài khoản",
    badge: "Theo chu kỳ gói",
    icon: "storage",
    options: [
      { id: "storage-10", label: "10 GB", price: 120000, billing: "Theo chu kỳ gói" },
      { id: "storage-50", label: "50 GB", price: 420000, billing: "Theo chu kỳ gói" },
      { id: "storage-100", label: "100 GB", price: 720000, billing: "Theo chu kỳ gói" },
    ],
  },
  {
    id: "orders",
    title: "Đơn hàng",
    subtitle: "Nâng giới hạn đơn hàng hàng tháng",
    badge: "Hàng tháng",
    icon: "orders",
    options: [
      { id: "orders-100", label: "100 đơn hàng", price: 0, billing: "Hàng tháng" },
      { id: "orders-200", label: "200 đơn hàng", price: 90000, billing: "Hàng tháng" },
      { id: "orders-500", label: "500 đơn hàng", price: 150000, billing: "Hàng tháng" },
      { id: "orders-1000", label: "1.000 đơn hàng", price: 250000, billing: "Hàng tháng" },
      { id: "orders-2000", label: "2.000 đơn hàng", price: 420000, billing: "Hàng tháng" },
      { id: "orders-3000", label: "3.000 đơn hàng", price: 560000, billing: "Hàng tháng" },
      { id: "orders-5000", label: "5.000 đơn hàng", price: 860000, billing: "Hàng tháng" },
    ],
  },
  {
    id: "customers",
    title: "Khách hàng",
    subtitle: "Mở rộng thêm số khách hàng lưu trữ",
    badge: "Theo chu kỳ gói",
    icon: "customers",
    options: [
      { id: "customers-25k", label: "25.000 khách hàng", price: 360000, billing: "Theo chu kỳ gói" },
      { id: "customers-50k", label: "50.000 khách hàng", price: 720000, billing: "Theo chu kỳ gói" },
      { id: "customers-100k", label: "100.000 khách hàng", price: 1180000, billing: "Theo chu kỳ gói" },
      { id: "customers-125k", label: "125.000 khách hàng", price: 1450000, billing: "Theo chu kỳ gói" },
    ],
  },
  {
    id: "products",
    title: "Sản phẩm",
    subtitle: "Mở rộng số lượng sản phẩm",
    badge: "Theo chu kỳ gói",
    icon: "products",
    options: [
      { id: "products-10", label: "10 sản phẩm", price: 0, billing: "Theo chu kỳ gói" },
      { id: "products-20", label: "20 sản phẩm", price: 160000, billing: "Theo chu kỳ gói" },
      { id: "products-50", label: "50 sản phẩm", price: 320000, billing: "Theo chu kỳ gói" },
      { id: "products-100", label: "100 sản phẩm", price: 520000, billing: "Theo chu kỳ gói" },
    ],
  },
];

const initialSelectedAddons: Record<AddonCategoryId, string | null> = {
  storage: null,
  orders: "orders-500",
  customers: "customers-50k",
  products: null,
};

const qrCells = Array.from({ length: 289 }, (_, index) => {
  const x = index % 17;
  const y = Math.floor(index / 17);
  const finder =
    (x < 5 && y < 5) ||
    (x > 11 && y < 5) ||
    (x < 5 && y > 11);
  return finder || (x * 7 + y * 11 + x * y) % 5 < 2;
});

function formatVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

function CheckMark() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2010d8]">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      </svg>
    </span>
  );
}

function MenuIcon({ type }: { type: "profile" | "settings" | "support" | "verify" | "upgrade" | "signout" }) {
  const common = "h-5 w-5";
  if (type === "upgrade") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16 3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5Zm0 0h14v3H5v-3Z" />
      </svg>
    );
  }
  if (type === "verify") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M12 3l7.5 3v5.25c0 4.5-3.12 8.7-7.5 9.75-4.38-1.05-7.5-5.25-7.5-9.75V6L12 3Z" />
      </svg>
    );
  }
  if (type === "signout") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17.5 20.5 12 15 6.5M20 12H9M12 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H12" />
      </svg>
    );
  }
  const path =
    type === "profile"
      ? "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
      : type === "settings"
        ? "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm0-13v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        : "M12 20a8 8 0 1 0-8-8m8 8a8 8 0 0 1-8-8m8 8c2-2.2 3-4.8 3-8s-1-5.8-3-8m0 16c-2-2.2-3-4.8-3-8s1-5.8 3-8m-7 8h14";
  return (
    <svg className={common} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

function AddonIcon({ icon }: { icon: "storage" | "orders" | "customers" | "products" }) {
  const paths = {
    storage: "M5 8h14l-1 11H6L5 8Zm3-4h8l2 4H6l2-4Zm2 9h4",
    orders: "M7 7h14l-2 8H9L7 7ZM7 7 6 4H3m7 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
    customers: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 3c2.2 0 4 1.3 4 3v1M4 19v-1c0-1.7 1.8-3 4-3s4 1.3 4 3v1",
    products: "m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5m8 4.5v9",
  };
  return (
    <span className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d={paths[icon]} />
      </svg>
    </span>
  );
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<UpgradeStep>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("core");
  const [selectedAddons, setSelectedAddons] = useState(initialSelectedAddons);

  const selectedPlan = upgradePlans.find((plan) => plan.id === selectedPlanId) ?? upgradePlans[0];
  const selectedAddonItems = useMemo(
    () =>
      addonGroups.flatMap((group) => {
        const optionId = selectedAddons[group.id];
        const option = group.options.find((item) => item.id === optionId);
        return option ? [{ group, option }] : [];
      }),
    [selectedAddons],
  );
  const addonsTotal = selectedAddonItems.reduce((sum, item) => sum + item.option.price, 0);
  const total = selectedPlan.price + addonsTotal;

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function openUpgrade() {
    setIsOpen(false);
    setIsUpgradeOpen(true);
    setUpgradeStep(1);
  }

  function closeUpgrade() {
    setIsUpgradeOpen(false);
  }

  function goNext() {
    setUpgradeStep((current) => Math.min(4, current + 1) as UpgradeStep);
  }

  function goBack() {
    setUpgradeStep((current) => Math.max(1, current - 1) as UpgradeStep);
  }

  function setAddon(groupId: AddonCategoryId, optionId: string) {
    setSelectedAddons((current) => ({
      ...current,
      [groupId]: current[groupId] === optionId ? null : optionId,
    }));
  }

  return (
    <div className="relative flex h-full items-center">
      <button
        onClick={toggleDropdown}
        className="flex cursor-pointer items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="flex h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <Image width={28} height={28} src="/images/user/owner.jpg" alt="User" />
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 top-full mt-2 flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            Cong
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            cong@ladipage.vn
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <MenuIcon type="profile" />
              Hồ sơ
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <MenuIcon type="settings" />
              Cài đặt tài khoản
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <MenuIcon type="support" />
              Hỗ trợ
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-orange-600 text-theme-sm hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
            >
              <MenuIcon type="verify" />
              Xác thực ngay
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onClick={openUpgrade}
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-[#2010d8] text-theme-sm hover:bg-blue-50 hover:text-[#2010d8]"
            >
              <MenuIcon type="upgrade" />
              Nâng cấp ngay
            </DropdownItem>
          </li>
        </ul>

        <Link
          href="/signin"
          className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <MenuIcon type="signout" />
          Đăng xuất
        </Link>
      </Dropdown>

      <Modal
        isOpen={isUpgradeOpen}
        onClose={closeUpgrade}
        className="mx-3 max-w-[1560px] overflow-hidden !rounded-[18px] bg-white"
      >
        <div className="flex max-h-[calc(100vh-88px)] min-h-[720px] bg-white text-slate-900">
          <aside className="hidden w-[390px] shrink-0 flex-col border-r border-slate-200 bg-gradient-to-b from-blue-50 to-white px-10 py-12 lg:flex">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-[#2010d8] text-lg font-black text-white">
                L
              </span>
              <span className="text-2xl font-black tracking-[-0.02em] text-slate-800">
                ladipage
              </span>
            </div>

            <div className="mt-16">
              <p className="text-[13px] font-black uppercase tracking-[0.14em] text-[#2010d8]">
                Nâng cấp & gia hạn
              </p>
              <h2 className="mt-5 max-w-[280px] text-[30px] font-black leading-[1.18] tracking-[-0.03em] text-slate-950">
                Tùy chỉnh gói cho đội ngũ của bạn
              </h2>
              <p className="mt-5 max-w-[295px] text-[17px] font-medium leading-8 text-slate-500">
                Hoàn tất 4 bước để kích hoạt gói mới, bạn có thể quay lại bất cứ lúc nào.
              </p>
            </div>

            <div className="mt-12 space-y-0">
              {steps.map((step, index) => {
                const isDone = upgradeStep > step.id;
                const isActive = upgradeStep === step.id;
                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-base font-black ${
                          isDone || isActive
                            ? "border-[#2010d8] bg-[#2010d8] text-white shadow-[0_0_0_7px_rgba(32,16,216,0.14)]"
                            : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {isDone ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </span>
                      {index < steps.length - 1 && <span className="h-8 w-px bg-slate-200" />}
                    </div>
                    <span
                      className={`pt-2 text-[18px] font-bold ${
                        isActive || isDone ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center gap-2 text-[15px] font-semibold text-slate-400">
              <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-3Zm-3 9 2 2 4-5" />
              </svg>
              Phiên bảo mật - PCI DSS
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
              {upgradeStep === 1 && (
                <div className="grid gap-6 xl:grid-cols-3">
                  {upgradePlans.map((plan) => {
                    const selected = selectedPlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative flex min-h-[620px] flex-col rounded-[26px] border bg-white p-8 text-left transition ${
                          selected
                            ? "border-[#1b67ff] shadow-[0_0_0_2px_rgba(27,103,255,0.18)]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-2xl bg-[#2010d8] px-8 py-2 text-[14px] font-black uppercase tracking-wide text-white shadow-lg shadow-blue-700/25">
                            Phổ biến
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <h3 className="text-[32px] font-black tracking-[-0.04em] text-slate-950">{plan.name}</h3>
                          {plan.badge && (
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[14px] font-black text-[#2010d8]">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-4 min-h-[64px] text-[18px] font-medium leading-8 text-slate-500">
                          {plan.description}
                        </p>
                        <div className="mt-6">
                          <div className="text-[42px] font-black tracking-[-0.05em] text-slate-950">
                            {formatVnd(plan.price)}
                          </div>
                          <p className="mt-1 text-[19px] font-medium text-slate-400">/ năm</p>
                          <p className="mt-2 text-[17px] font-semibold text-slate-400">{plan.monthlyLabel}</p>
                        </div>
                        <div className="my-7 h-px bg-slate-100" />
                        <ul className="space-y-5">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex gap-4 text-[18px] font-medium leading-7 text-slate-700">
                              <CheckMark />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              )}

              {upgradeStep === 2 && (
                <div className="grid gap-6 xl:grid-cols-2">
                  {addonGroups.map((group) => (
                    <div key={group.id} className="min-h-[315px] rounded-[26px] border border-slate-200 bg-white p-8">
                      <div className="flex items-start gap-5">
                        <AddonIcon icon={group.icon} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[24px] font-black tracking-[-0.02em] text-slate-950">{group.title}</h3>
                            <span
                              className={`rounded-lg px-2.5 py-1 text-[14px] font-black ${
                                group.badge === "Hàng tháng"
                                  ? "bg-orange-50 text-orange-500"
                                  : "bg-blue-50 text-[#2010d8]"
                              }`}
                            >
                              {group.badge}
                            </span>
                          </div>
                          <p className="mt-2 text-[18px] font-medium text-slate-500">{group.subtitle}</p>
                        </div>
                      </div>
                      <div className="mt-7 flex flex-wrap gap-3">
                        {group.options.map((option) => {
                          const selected = selectedAddons[group.id] === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setAddon(group.id, option.id)}
                              className={`rounded-xl border px-5 py-3 text-[17px] font-bold transition ${
                                selected
                                  ? "border-[#2010d8] bg-[#2010d8] text-white shadow-lg shadow-blue-700/20"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {upgradeStep === 3 && (
                <div className="mx-auto max-w-[1040px] space-y-8">
                  <div className="rounded-[26px] border border-slate-200 bg-white">
                    <div className="p-8">
                      <p className="text-[17px] font-black text-slate-500">Thông tin gói dịch vụ</p>
                      <div className="mt-6 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <span className="flex h-15 w-15 items-center justify-center rounded-2xl bg-blue-50 text-[#2010d8]">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 16 3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5Zm0 0h14v3H5v-3Z" />
                            </svg>
                          </span>
                          <div>
                            <h3 className="text-[24px] font-black text-slate-950">{selectedPlan.name}</h3>
                            <p className="text-[18px] font-medium text-slate-500">{selectedPlan.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[24px] font-black text-slate-950">{formatVnd(selectedPlan.price)}</p>
                          <p className="mt-1 text-[16px] font-bold text-slate-400">/ 12 tháng</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 p-8">
                      <p className="text-[17px] font-black text-slate-500">Các gói mở rộng</p>
                      <div className="mt-5 space-y-5">
                        {selectedAddonItems.length === 0 ? (
                          <p className="text-[17px] font-medium text-slate-400">Chưa chọn addon nào.</p>
                        ) : (
                          selectedAddonItems.map(({ group, option }) => (
                            <div key={option.id} className="flex items-start justify-between gap-6">
                              <div>
                                <p className="text-[19px] font-semibold text-slate-800">{group.title}</p>
                                <p className="mt-1 text-[16px] font-medium text-slate-400">
                                  {option.label} - {option.billing}
                                </p>
                              </div>
                              <p className="text-[19px] font-black text-slate-950">{formatVnd(option.price)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50/70 p-8">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[19px] font-medium text-slate-500">
                          <span>Tổng giá trị đơn hàng</span>
                          <span className="font-black text-slate-900">{formatVnd(total)}</span>
                        </div>
                        <div className="flex justify-between text-[19px] font-medium text-slate-500">
                          <span>Thuế VAT (10%)</span>
                          <span>0 đ</span>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="flex justify-between text-[23px] font-black text-slate-950">
                          <span>Tổng thanh toán</span>
                          <span className="text-[#2010d8]">{formatVnd(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[17px] font-black uppercase tracking-wide text-slate-400">
                      Mã khuyến mãi
                    </label>
                    <div className="mt-4 flex gap-3">
                      <div className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-5 text-[19px] font-medium text-slate-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4 12 8-8h7v7l-8 8a2 2 0 0 1-2.8 0L4 14.8a2 2 0 0 1 0-2.8Zm11-4h.01" />
                        </svg>
                        Nhập mã chương trình
                      </div>
                      <button type="button" className="rounded-xl border border-slate-200 px-8 text-[18px] font-bold text-slate-400">
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {upgradeStep === 4 && (
                <div className="mx-auto max-w-[1080px]">
                  <h2 className="text-[34px] font-black tracking-[-0.03em] text-slate-950">Xác nhận thanh toán</h2>
                  <p className="mt-4 text-[20px] font-medium text-slate-500">
                    Hoàn tất chuyển khoản theo thông tin bên dưới để kích hoạt gói.
                  </p>

                  <div className="mt-10 rounded-[22px] border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <span className="flex h-15 w-15 items-center justify-center rounded-2xl bg-pink-500 text-white">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm12 0h1.5v2H20m-6 0h2v4m2-2h2" />
                          </svg>
                        </span>
                        <div>
                          <h3 className="text-[22px] font-black text-slate-950">Chuyển khoản VietQR</h3>
                          <p className="mt-1 text-[18px] font-medium text-slate-500">Quét QR ngân hàng nội địa</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-black uppercase tracking-wide text-slate-400">Thanh toán</p>
                        <p className="mt-1 text-[22px] font-black text-slate-950">{formatVnd(total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-8 rounded-[26px] border border-slate-200 bg-white p-8 lg:grid-cols-[340px_1fr]">
                    <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_24px_80px_rgba(244,63,94,0.16)]">
                      <div className="grid grid-cols-[repeat(17,minmax(0,1fr))] gap-1">
                        {qrCells.map((filled, index) => (
                          <span
                            key={index}
                            className={`aspect-square rounded-[1px] ${filled ? "bg-slate-950" : "bg-white"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[15px] font-black uppercase tracking-wide text-[#2010d8]">Bước 1 / 2</p>
                      <h3 className="mt-4 text-[28px] font-black tracking-[-0.03em] text-slate-950">
                        Mở app Chuyển khoản VietQR & quét QR
                      </h3>
                      <p className="mt-5 max-w-[560px] text-[19px] font-medium leading-8 text-slate-500">
                        Hệ thống sẽ tự cập nhật trạng thái ngay khi nhận được khoản chuyển.
                      </p>
                      <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 text-[18px] font-bold text-orange-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Mã QR hết hạn sau 09:58
                      </div>

                      <dl className="mt-7 grid gap-3 text-[18px]">
                        {[
                          ["Số tài khoản", "19036184902015"],
                          ["Chủ tài khoản", "CTCP CN LADIPAGE VIET NAM"],
                          ["Ngân hàng", "Ngân hàng TMCP Kỹ thương Việt Nam"],
                          ["Nội dung chuyển khoản", "LDPQR22331558A8YXMF"],
                        ].map(([label, value]) => (
                          <div key={label} className="grid gap-2 sm:grid-cols-[220px_1fr]">
                            <dt className="font-bold text-slate-400">{label}</dt>
                            <dd className={`font-bold ${label === "Nội dung chuyển khoản" ? "text-[#2010d8]" : "text-slate-800"}`}>
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-h-[114px] flex-col gap-4 border-t border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <button
                type="button"
                onClick={goBack}
                disabled={upgradeStep === 1}
                className="inline-flex items-center gap-3 text-[17px] font-bold text-slate-500 transition hover:text-slate-900 disabled:pointer-events-none disabled:opacity-0"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                Quay lại
              </button>

              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                {upgradeStep > 1 && (
                  <div className="text-left sm:text-right">
                    <p className="text-[24px] font-black text-slate-950">{formatVnd(total)}</p>
                    <p className="text-[14px] font-medium text-slate-400">Tổng tạm tính</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={upgradeStep === 4 ? undefined : goNext}
                  disabled={upgradeStep === 4}
                  className={`inline-flex min-h-15 items-center justify-center gap-3 rounded-2xl px-8 text-[20px] font-black text-white shadow-lg transition ${
                    upgradeStep === 4
                      ? "bg-[#7f6ee8] shadow-purple-500/20"
                      : "bg-[#2010d8] shadow-blue-700/25 hover:bg-[#180bad]"
                  }`}
                >
                  {upgradeStep === 3 ? "Xác nhận thanh toán" : upgradeStep === 4 ? "Đang chờ thanh toán..." : "Tiếp tục"}
                  {upgradeStep === 4 ? (
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}
