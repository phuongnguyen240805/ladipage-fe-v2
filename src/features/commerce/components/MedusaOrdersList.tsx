"use client";

import React, { useState } from "react";

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

export function MedusaOrdersList() {
  const { canReadOrders } = useCommerceAccess();
  const { orders } = useCommerceOrders();
  const [selected, setSelected] = useState<CommerceOrder | null>(null);

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
            {orders.map((o) => (
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
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${orderStatusStyle(o.status)}`}
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
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Khách
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-white">
                  {selected.customerName}
                </dd>
                <dd className="text-xs text-slate-500">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Sản phẩm
                </dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {selected.itemsSummary}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Landing
                </dt>
                <dd className="font-medium">
                  {selected.landingPageName}{" "}
                  <span className="text-[11px] text-slate-400">
                    ({selected.landingPageId})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">
                  Tổng
                </dt>
                <dd className="text-lg font-bold text-[#65a30d]">
                  {formatCommerceMoney(selected.total, selected.currencyCode)}
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
