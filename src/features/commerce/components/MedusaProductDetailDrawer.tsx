"use client";

import React, { useMemo, useState } from "react";

import type {
  CommerceCategory,
  CommerceProduct,
  CommerceProductStatus,
  CommerceProductTag,
} from "@/features/commerce/types";
import {
  formatCommerceDate,
  formatCommerceMoney,
} from "@/features/commerce/utils/format-money";

type DetailTab = "overview" | "variants" | "taxonomy";

function statusMeta(status: CommerceProductStatus) {
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
        style:
          "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40",
      };
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">
        {children}
      </dd>
    </div>
  );
}

export function MedusaProductDetailDrawer({
  product,
  categories,
  tags,
  onClose,
}: {
  product: CommerceProduct | null;
  categories: CommerceCategory[];
  tags: CommerceProductTag[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");

  const category = useMemo(
    () =>
      product?.categoryId
        ? categories.find((c) => c.id === product.categoryId) ?? null
        : null,
    [product?.categoryId, categories],
  );

  const productTags = useMemo(
    () =>
      (product?.tagIds ?? [])
        .map((id) => tags.find((t) => t.id === id))
        .filter((t): t is CommerceProductTag => Boolean(t)),
    [product?.tagIds, tags],
  );

  if (!product) return null;
  const st = statusMeta(product.status);

  return (
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-99999 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
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
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {product.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${st.style}`}
                >
                  {st.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {product.sku}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer text-slate-400"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 px-6">
          {(
            [
              ["overview", "Tổng quan"],
              ["variants", "Biến thể"],
              ["taxonomy", "Danh mục & Tag"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
                tab === key
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Giá bán">
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {formatCommerceMoney(product.price, product.currencyCode)}
                  </span>
                </Field>
                <Field label="Giá gạch">
                  {product.compareAtPrice > 0
                    ? formatCommerceMoney(
                        product.compareAtPrice,
                        product.currencyCode,
                      )
                    : "—"}
                </Field>
                <Field label="Tồn kho">{product.stock}</Field>
                <Field label="Đơn vị">{product.unit || "—"}</Field>
                <Field label="Thương hiệu">{product.brand || "—"}</Field>
                <Field label="Nhãn">{product.badge || "—"}</Field>
              </div>

              {product.shortDescription && (
                <Field label="Mô tả ngắn">{product.shortDescription}</Field>
              )}
              {product.description && (
                <Field label="Mô tả">
                  <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">
                    {product.description}
                  </p>
                </Field>
              )}

              {product.highlights.length > 0 && (
                <Field label="Điểm nổi bật">
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                    {product.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </Field>
              )}

              {product.shippingNote && (
                <Field label="Ghi chú vận chuyển">{product.shippingNote}</Field>
              )}

              {product.images.length > 0 && (
                <Field label={`Thư viện ảnh (${product.images.length})`}>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.images.map((src, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-slate-100 dark:bg-gray-800"
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Field label="Handle">{product.handle}</Field>
                <Field label="Channel">{product.salesChannelId}</Field>
                <Field label="Tạo lúc">
                  {formatCommerceDate(product.createdAt)}
                </Field>
                <Field label="Cập nhật">
                  {formatCommerceDate(product.updatedAt)}
                </Field>
              </div>
            </div>
          )}

          {tab === "variants" && (
            <div>
              {product.variants && product.variants.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="py-2 font-bold">Phiên bản</th>
                      <th className="py-2 font-bold">SKU</th>
                      <th className="py-2 font-bold">Giá</th>
                      <th className="py-2 font-bold">Tồn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-gray-50 dark:border-gray-800/80"
                      >
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-200">
                          {v.title}
                          <div className="text-[11px] text-slate-400">
                            {Object.entries(v.options)
                              .map(([k, val]) => `${k}: ${val}`)
                              .join(" · ")}
                          </div>
                        </td>
                        <td className="py-2 text-slate-600 dark:text-slate-300">
                          {v.sku}
                        </td>
                        <td className="py-2 font-semibold text-slate-800 dark:text-slate-100">
                          {formatCommerceMoney(v.price, product.currencyCode)}
                        </td>
                        <td className="py-2 text-slate-600 dark:text-slate-300">
                          {v.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-400">
                  Sản phẩm chưa có biến thể chi tiết.
                </p>
              )}
            </div>
          )}

          {tab === "taxonomy" && (
            <div className="space-y-5">
              <Field label="Danh mục">
                {category ? (
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200">
                    {category.name}
                  </span>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Tag sản phẩm">
                {productTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {productTags.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: `${t.color}1a`,
                          color: t.color,
                        }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </Field>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
