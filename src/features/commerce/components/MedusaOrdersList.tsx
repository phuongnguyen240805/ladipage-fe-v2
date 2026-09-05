"use client";

import React, { useMemo, useState } from "react";

import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceOrders } from "@/features/commerce/hooks/useCommerceOrders";
import type { CommerceOrder, CommerceOrderStatus } from "@/features/commerce/types";
import {
  formatCommerceDate,
  formatCommerceMoney,
} from "@/features/commerce/utils/format-money";

function orderStatusStyle(status: CommerceOrderStatus) {
  switch (status) {
    case "completed":
      return "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40";
    case "pending":
      return "text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40";
    case "canceled":
      return "text-slate-600 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800";
    case "requires_action":
      return "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40";
  }
}

function orderStatusLabel(status: CommerceOrderStatus) {
  const map: Record<CommerceOrderStatus, string> = {
    completed: "Hoàn tất",
    pending: "Chờ xử lý",
    canceled: "Đã hủy",
    requires_action: "Cần xử lý",
  };
  return map[status];
}

const ORDER_TABS: Array<["all" | CommerceOrderStatus, string]> = [
  ["all", "Tất cả"],
  ["pending", "Chờ xử lý"],
  ["completed", "Hoàn tất"],
  ["requires_action", "Cần xử lý"],
  ["canceled", "Đã hủy"],
];

export function MedusaOrdersList() {
  const { canReadOrders } = useCommerceAccess();
  const { orders } = useCommerceOrders();
  const [selected, setSelected] = useState<CommerceOrder | null>(null);
  const [tab, setTab] = useState<"all" | CommerceOrderStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.displayId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.landingPageName ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, tab, search]);

  if (!canReadOrders) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem đơn online"
          description="Cần quyền commerce:order:read."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Đơn hàng online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Mock đơn Medusa · gắn attribution landing page
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {ORDER_TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
              tab === key
                ? "border-lime-500 text-lime-600 dark:text-lime-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn, khách, email, landing…"
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
        />
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {filtered.length} đơn
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-bold">Mã</th>
              <th className="px-4 py-3 font-bold">Khách</th>
              <th className="px-4 py-3 font-bold">Landing</th>
              <th className="px-4 py-3 font-bold">Tổng</th>
              <th className="px-4 py-3 font-bold">Trạng thái</th>
              <th className="px-4 py-3 font-bold">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Không có đơn phù hợp.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] cursor-pointer"
                onClick={() => setSelected(o)}
              >
                <td className="px-4 py-3 font-semibold text-[#65a30d]">
                  {o.displayId}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {o.customerName}
                  </div>
                  <div className="text-[11px] text-slate-400">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  {o.landingPageName ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatCommerceMoney(o.total, o.currencyCode)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`ladi-status-badge inline-flex items-center px-2 py-0.5 rounded-md ${orderStatusStyle(o.status)}`}
                  >
                    {orderStatusLabel(o.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatCommerceDate(o.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-9999 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-y-0 right-0 z-99999 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  {selected.displayId}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{selected.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`ladi-status-badge inline-flex items-center px-2 py-0.5 rounded-md ${orderStatusStyle(selected.status)}`}
                >
                  {orderStatusLabel(selected.status)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatCommerceDate(selected.createdAt)}
                </span>
              </div>

              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Khách
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-white">
                  {selected.customerName}
                </dd>
                <dd className="text-xs text-slate-500">{selected.email}</dd>
                {selected.shippingAddress?.phone && (
                  <dd className="text-xs text-slate-500">
                    {selected.shippingAddress.phone}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                  Sản phẩm
                </dt>
                {selected.items && selected.items.length > 0 ? (
                  <div className="space-y-2">
                    {selected.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-800"
                      >
                        <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                          {it.thumbnailUrl && (
                            <img
                              src={it.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-700 dark:text-slate-200 truncate">
                            {it.productTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {it.sku} · SL {it.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                          {formatCommerceMoney(it.total, selected.currencyCode)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {selected.itemsSummary}
                  </p>
                )}
              </div>

              {selected.shippingAddress && (
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-400">
                    Địa chỉ giao
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-300">
                    {selected.shippingAddress.fullName} ·{" "}
                    {selected.shippingAddress.line1}
                    {selected.shippingAddress.ward
                      ? `, ${selected.shippingAddress.ward}`
                      : ""}
                    {selected.shippingAddress.district
                      ? `, ${selected.shippingAddress.district}`
                      : ""}
                    , {selected.shippingAddress.city}
                  </dd>
                </div>
              )}

              {(selected.paymentMethod || selected.paymentStatus) && (
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-400">
                    Thanh toán
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-300">
                    {selected.paymentMethod === "cod"
                      ? "COD (thu hộ)"
                      : selected.paymentMethod === "bank_transfer"
                        ? "Chuyển khoản"
                        : selected.paymentMethod === "gateway"
                          ? "Cổng thanh toán"
                          : "—"}
                    {selected.paymentStatus
                      ? ` · ${
                          selected.paymentStatus === "captured"
                            ? "Đã thu"
                            : selected.paymentStatus === "awaiting"
                              ? "Chờ thu"
                              : selected.paymentStatus === "refunded"
                                ? "Đã hoàn"
                                : "Thất bại"
                        }`
                      : ""}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Landing
                </dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {selected.landingPageName ?? "—"}{" "}
                  {selected.landingPageId && (
                    <span className="text-[11px] text-slate-400">
                      ({selected.landingPageId})
                    </span>
                  )}
                </dd>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                {selected.subtotal != null && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tạm tính</span>
                    <span>
                      {formatCommerceMoney(
                        selected.subtotal,
                        selected.currencyCode,
                      )}
                    </span>
                  </div>
                )}
                {selected.discountTotal ? (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Giảm giá</span>
                    <span>
                      -
                      {formatCommerceMoney(
                        selected.discountTotal,
                        selected.currencyCode,
                      )}
                    </span>
                  </div>
                ) : null}
                {selected.shippingTotal != null && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Vận chuyển</span>
                    <span>
                      {selected.shippingTotal === 0
                        ? "Miễn phí"
                        : formatCommerceMoney(
                            selected.shippingTotal,
                            selected.currencyCode,
                          )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Tổng
                  </span>
                  <span className="text-lg font-bold text-[#65a30d]">
                    {formatCommerceMoney(selected.total, selected.currencyCode)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
