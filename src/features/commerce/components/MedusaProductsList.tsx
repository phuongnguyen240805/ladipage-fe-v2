"use client";

import React, { useMemo, useState } from "react";

import { ChannelHealthBadge } from "@/features/commerce/components/ChannelHealthBadge";
import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { MedusaCreateProductDrawer } from "@/features/commerce/components/MedusaCreateProductDrawer";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceProducts } from "@/features/commerce/hooks/useCommerceProducts";
import { useCommerceStoreLink } from "@/features/commerce/hooks/useCommerceStoreLink";
import type { CommerceProductStatus } from "@/features/commerce/types";
import { formatCommerceMoney } from "@/features/commerce/utils/format-money";

function statusLabel(status: CommerceProductStatus) {
  switch (status) {
    case "published":
      return {
        label: "Đang bán",
        style:
          "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40",
      };
    case "draft":
      return {
        label: "Nháp",
        style:
          "text-slate-700 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800",
      };
    case "archived":
      return {
        label: "Lưu trữ",
        style: "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40",
      };
  }
}

export function MedusaProductsList() {
  const { canReadProduct, canWriteProduct } = useCommerceAccess();
  const { products, createProduct, updateStatus, useApi } = useCommerceProducts();
  const { storeLink } = useCommerceStoreLink();
  const [tab, setTab] = useState<"all" | CommerceProductStatus>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    if (tab === "all") return products;
    return products.filter((p) => p.status === tab);
  }, [products, tab]);

  if (!canReadProduct) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem sản phẩm online"
          description="Cần quyền commerce:product:read. Liên hệ Owner/Admin."
        />
      </div>
    );
  }

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              Sản phẩm cửa hàng online
            </h1>
            <ChannelHealthBadge storeLink={storeLink} />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Channel{" "}
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              {storeLink.salesChannelName}
            </span>{" "}
            · {storeLink.salesChannelId}
          </p>
        </div>
        {canWriteProduct ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-lime-500 hover:bg-brand-600 cursor-pointer shadow-sm"
          >
            + Thêm sản phẩm
          </button>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 self-center">
            Chỉ xem — thiếu commerce:product:write
          </span>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(
          [
            ["all", "Tất cả"],
            ["published", "Đang bán"],
            ["draft", "Nháp"],
            ["archived", "Lưu trữ"],
          ] as const
        ).map(([key, label]) => (
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/40">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Chưa có sản phẩm online
          </p>
          <p className="text-xs text-slate-400 max-w-xs text-center">
            Tạo sản phẩm rồi gắn vào Landing (purpose bán hàng) để khách checkout.
          </p>
          {canWriteProduct && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-lime-500 hover:bg-brand-600 cursor-pointer"
            >
              Tạo sản phẩm đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-bold">Sản phẩm</th>
                  <th className="px-4 py-3 font-bold">SKU</th>
                  <th className="px-4 py-3 font-bold">Giá</th>
                  <th className="px-4 py-3 font-bold">Tồn</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  {canWriteProduct && (
                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = statusLabel(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                            {p.thumbnailUrl ? (
                              <img
                                src={p.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium line-clamp-1">
                              {p.shortDescription || p.handle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                        {formatCommerceMoney(p.price, p.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {p.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${st.style}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      {canWriteProduct && (
                        <td className="px-4 py-3 text-right space-x-2">
                          {p.status !== "published" && (
                            <button
                              type="button"
                              className="text-[11px] font-bold text-[#65a30d] hover:underline cursor-pointer"
                              onClick={() => {
                                void updateStatus(p.id, "published").then(() =>
                                  triggerToast("Đã chuyển sang Đang bán"),
                                );
                              }}
                            >
                              Xuất bản
                            </button>
                          )}
                          {p.status === "published" && (
                            <button
                              type="button"
                              className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                              onClick={() => {
                                void updateStatus(p.id, "draft").then(() =>
                                  triggerToast("Đã chuyển về nháp"),
                                );
                              }}
                            >
                              Ẩn
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-99999 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg">
          {toast}
        </div>
      )}

      <MedusaCreateProductDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={(data) => {
          void (async () => {
            await createProduct(data);
            triggerToast(
              useApi
                ? `Đã tạo “${data.title}” (API)`
                : `Đã tạo “${data.title}” (mock)`,
            );
          })();
        }}
      />
    </div>
  );
}
