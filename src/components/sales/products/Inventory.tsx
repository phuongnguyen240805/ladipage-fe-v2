"use client";

import React, { useMemo, useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import { useProducts } from "@/features/ecom/hooks/useProducts";
import { useUpdateInventory } from "@/features/ecom/hooks/useInventory";

export const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [draftStock, setDraftStock] = useState<Record<string, string>>({});
  const { data, isLoading, error } = useProducts({ pageSize: 100 });
  const updateInventory = useUpdateInventory();
  const products = data?.items ?? [];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleSaveStock = async (productId: string, currentStock: number) => {
    const raw = draftStock[productId];
    if (raw == null || raw === "") return;
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0) return;
    await updateInventory.mutateAsync({
      productId: Number(productId),
      stock: next,
    });
    setDraftStock((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  return (
    <ApiState isLoading={isLoading} error={error}>
      <div className="space-y-5 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý tồn kho</h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Theo dõi số lượng và điều chỉnh tồn kho theo từng SKU.
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px]">
          {filteredProducts.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Sản phẩm</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">SKU</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Giá</th>
                  <th className="py-3.5 px-5 text-xs font-bold text-lime-500">Số lượng</th>
                  <th className="py-3.5 px-5 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 px-5 text-xs font-medium text-slate-800 dark:text-white">{product.name}</td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400">{product.sku}</td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400">
                      {(product.price ?? 0).toLocaleString()}đ
                    </td>
                    <td className="py-4 px-5">
                      <input
                        type="number"
                        min={0}
                        value={draftStock[product.id] ?? String(product.stock ?? 0)}
                        onChange={(e) =>
                          setDraftStock((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        className="w-24 px-2 py-1.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() =>
                          void handleSaveStock(product.id, product.stock ?? 0)
                        }
                        className="text-xs font-bold text-lime-500 hover:underline cursor-pointer"
                      >
                        Lưu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 text-center select-none">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-lime-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có sản phẩm trong kho</h4>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
                  Tạo sản phẩm trong danh sách để bắt đầu theo dõi tồn kho.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ApiState>
  );
};