"use client";

import React, { useEffect, useMemo, useState } from "react";

import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceInventory } from "@/features/commerce/hooks/useCommerceInventory";
import { formatCommerceMoney } from "@/features/commerce/utils/format-money";

const LOW_STOCK_THRESHOLD = 10;

function InventoryRow({
  row,
  canWrite,
  onSave,
}: {
  row: {
    productId: string;
    productTitle: string;
    sku: string;
    price: number;
    currencyCode: string;
    quantity: number;
    locationName: string;
  };
  canWrite: boolean;
  onSave: (productId: string, qty: number) => void;
}) {
  const [value, setValue] = useState(String(row.quantity));
  useEffect(() => {
    setValue(String(row.quantity));
  }, [row.quantity]);

  const dirty = Number(value) !== row.quantity;
  const low = row.quantity <= LOW_STOCK_THRESHOLD;

  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-800 dark:text-slate-100">
          {row.productTitle}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          {row.locationName}
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
        {row.sku}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
        {formatCommerceMoney(row.price, row.currencyCode)}
      </td>
      <td className="px-4 py-3">
        {canWrite ? (
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 px-2 py-1 rounded-md text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
          />
        ) : (
          <span
            className={
              low
                ? "text-rose-600 dark:text-rose-400 font-semibold"
                : "text-slate-600 dark:text-slate-300"
            }
          >
            {row.quantity}
          </span>
        )}
        {low && (
          <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40">
            Sắp hết
          </span>
        )}
      </td>
      {canWrite && (
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            disabled={!dirty}
            onClick={() => onSave(row.productId, Number(value))}
            className={`text-[11px] font-bold cursor-pointer ${
              dirty
                ? "text-[#65a30d] hover:underline"
                : "text-slate-300 cursor-not-allowed"
            }`}
          >
            Lưu
          </button>
        </td>
      )}
    </tr>
  );
}

export function MedusaInventoryList() {
  const { canReadProduct, canWriteProduct } = useCommerceAccess();
  const { inventory, updateStock } = useCommerceInventory();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((r) =>
      q
        ? r.productTitle.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
        : true,
    );
  }, [inventory, search]);

  if (!canReadProduct) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem tồn kho"
          description="Cần quyền commerce:product:read."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Tồn kho cửa hàng online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Mock tồn kho Medusa · 1 kho mặc định
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, SKU…"
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
        />
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {rows.length} mục
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-bold">Sản phẩm</th>
              <th className="px-4 py-3 font-bold">SKU</th>
              <th className="px-4 py-3 font-bold">Giá</th>
              <th className="px-4 py-3 font-bold">Số lượng</th>
              {canWriteProduct && (
                <th className="px-4 py-3 font-bold text-right">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={canWriteProduct ? 5 : 4}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Chưa có tồn kho.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <InventoryRow
                key={r.productId}
                row={r}
                canWrite={canWriteProduct}
                onSave={updateStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
