"use client";

import React, { useEffect, useMemo, useState } from "react";

import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceProducts } from "@/features/commerce/hooks/useCommerceProducts";
import {
  createBindingFromProduct,
  landingCommerceBindingsStore,
} from "@/features/commerce/mock/landing-commerce-bindings-store";
import type {
  CommerceCtaMode,
  LandingPagePurpose,
  PageCommerceBinding,
} from "@/features/commerce/types";
import { mergeCommerceBindingsIntoEditorData } from "@/features/commerce/utils/inject-commerce-to-editor";
import { formatCommerceMoney } from "@/features/commerce/utils/format-money";
import {
  createDefaultPageSettings,
  type EditorData,
} from "@/components/landing-pages/editor/types";
import {
  loadLandingPage,
  saveLandingPage,
} from "@/components/landing-pages/editor/core/editor-supabase-storage";
import { CURRENT_EDITOR_SCHEMA_VERSION } from "@/components/landing-pages/editor/core/editor-migration";

export type BindLandingTarget = {
  pageId: string;
  pageName: string;
};

type LandingProductBindModalProps = {
  isOpen: boolean;
  target: BindLandingTarget | null;
  onClose: () => void;
  onSaved?: () => void;
};

const PURPOSES: {
  id: LandingPagePurpose;
  title: string;
  desc: string;
  needsProduct: boolean;
}[] = [
  {
    id: "lead",
    title: "Thu lead (CRM)",
    desc: "Form / tư vấn — không checkout Medusa",
    needsProduct: false,
  },
  {
    id: "sales",
    title: "Bán sản phẩm",
    desc: "Gắn SP online + CTA Mua ngay (H3)",
    needsProduct: true,
  },
  {
    id: "hybrid_lead_sales",
    title: "Lead + Bán",
    desc: "Form lead và bán SP cùng trang",
    needsProduct: true,
  },
  {
    id: "content",
    title: "Nội dung / SEO",
    desc: "Không commerce",
    needsProduct: false,
  },
];

export function LandingProductBindModal({
  isOpen,
  target,
  onClose,
  onSaved,
}: LandingProductBindModalProps) {
  const { canBindPage, canReadProduct } = useCommerceAccess();
  const { products } = useCommerceProducts();
  const published = useMemo(
    () => products.filter((p) => p.status === "published"),
    [products],
  );

  const [purpose, setPurpose] = useState<LandingPagePurpose>("sales");
  const [ctaMode, setCtaMode] = useState<CommerceCtaMode>("buy_now");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isOpen || !target) return;
    const existing = landingCommerceBindingsStore.getProfile(
      target.pageId,
      target.pageName,
    );
    setPurpose(existing.purpose === "lead" && existing.bindings.length === 0
      ? "sales"
      : existing.purpose);
    setSelectedIds(existing.bindings.map((b) => b.productId));
    setCtaMode(existing.bindings[0]?.ctaMode ?? "buy_now");
    setSearch("");
    setError("");
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const needsProduct =
    purpose === "sales" || purpose === "hybrid_lead_sales";

  const filtered = published.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!canBindPage) {
      setError("Thiếu quyền commerce:page:bind");
      return;
    }

    if (needsProduct && selectedIds.length === 0) {
      setError("Chọn ít nhất 1 sản phẩm online đang bán.");
      return;
    }

    const bindings: PageCommerceBinding[] = needsProduct
      ? selectedIds
          .map((id) => published.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) =>
            createBindingFromProduct({
              productId: p.id,
              productTitle: p.title,
              productSku: p.sku,
              price: p.price,
              currencyCode: p.currencyCode,
              ctaMode,
              placement: "product_card",
            }),
          )
      : [];

    const profile = landingCommerceBindingsStore.saveProfile({
      pageId: target.pageId,
      pageName: target.pageName,
      purpose,
      bindings,
      primaryConversion:
        purpose === "sales"
          ? "purchase"
          : purpose === "hybrid_lead_sales"
            ? "purchase"
            : "lead",
    });

    // Đẩy SP vào editor_data để visual editor hiển thị / chỉnh sửa được
    try {
      let editorData = await loadLandingPage(target.pageId);
      if (!editorData) {
        editorData = {
          pageId: target.pageId,
          pageName: target.pageName,
          sections: [],
          pageSettings: createDefaultPageSettings(target.pageName),
          schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
        } as EditorData;
      }
      const merged = mergeCommerceBindingsIntoEditorData(editorData, profile);
      await saveLandingPage(target.pageId, merged);
    } catch (err) {
      console.warn("[LandingProductBind] inject editor failed (UI still saved):", err);
    }

    setToast("Đã gắn SP — mở Chỉnh sửa để xem trên canvas");
    onSaved?.();
    setTimeout(() => {
      setToast("");
      onClose();
    }, 700);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Gắn sản phẩm online
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {target.pageName}{" "}
                <span className="font-mono text-[10px] opacity-70">
                  ({target.pageId.slice(0, 8)}…)
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {!canBindPage ? (
              <PermissionDeniedState
                title="Không có quyền gắn sản phẩm"
                description="Cần commerce:page:bind. Đổi Mock role sang Owner/Editor trong Bán hàng → Cửa hàng online, hoặc nhờ Owner cấp quyền."
              />
            ) : (
              <>
                <section className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    1. Mục đích trang
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PURPOSES.map((p) => {
                      const active = purpose === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPurpose(p.id)}
                          className={`text-left rounded-xl border px-3 py-2.5 transition cursor-pointer ${
                            active
                              ? "border-lime-400 bg-[#e5ecff] dark:bg-lime-950/30 dark:border-lime-700"
                              : "border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div
                            className={`text-sm font-bold ${
                              active
                                ? "text-[#65a30d] dark:text-lime-300"
                                : "text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {p.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {needsProduct && (
                  <>
                    <section className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        2. Kiểu CTA (checkout H3)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ["buy_now", "Mua ngay → redirect"],
                            ["add_to_cart", "Thêm giỏ (sau)"],
                            ["redirect", "Link checkout"],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setCtaMode(id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition ${
                              ctaMode === id
                                ? "bg-lime-500 text-white border-lime-500"
                                : "border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          3. Chọn sản phẩm online ({selectedIds.length})
                        </h3>
                        {!canReadProduct && (
                          <span className="text-[10px] text-rose-500 font-bold">
                            Thiếu product:read
                          </span>
                        )}
                      </div>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên / SKU…"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:outline-none focus:border-lime-400"
                      />
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        {filtered.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 font-medium">
                            Không có SP đang bán. Tạo tại Bán hàng → Sản phẩm
                            online.
                          </div>
                        ) : (
                          filtered.map((p) => {
                            const checked = selectedIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${
                                  checked
                                    ? "bg-[#f4f7ff] dark:bg-lime-950/20"
                                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProduct(p.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-lime-500 focus:ring-lime-400"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {p.title}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">
                                    {p.sku} · tồn {p.stock}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-[#65a30d] whitespace-nowrap">
                                  {formatCommerceMoney(p.price, p.currencyCode)}
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </section>
                  </>
                )}

                {!needsProduct && (
                  <p className="text-xs text-slate-500 font-medium rounded-lg bg-slate-50 dark:bg-gray-800/50 px-3 py-2">
                    Mục đích này không gắn SP online. Binding hiện có sẽ bị xóa
                    khi lưu.
                  </p>
                )}

                {error && (
                  <p className="text-xs font-bold text-rose-600">{error}</p>
                )}
              </>
            )}
          </div>

          {canBindPage && (
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-lime-500 hover:bg-brand-600 cursor-pointer"
              >
                Lưu gắn SP
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100000] px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
