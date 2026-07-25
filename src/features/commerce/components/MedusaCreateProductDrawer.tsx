"use client";

import React, { useState } from "react";

type MedusaCreateProductDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    shortDescription?: string;
    description?: string;
    images?: string[];
    highlights?: string[];
    brand?: string;
    badge?: string;
    unit?: string;
    shippingNote?: string;
  }) => void;
};

export function MedusaCreateProductDrawer({
  isOpen,
  onClose,
  onSave,
}: MedusaCreateProductDrawerProps) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("299000");
  const [compareAtPrice, setCompareAtPrice] = useState("399000");
  const [stock, setStock] = useState("10");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [brand, setBrand] = useState("");
  const [badge, setBadge] = useState("Mới");
  const [unit, setUnit] = useState("chai");
  const [shippingNote, setShippingNote] = useState("Giao 2–4 ngày · Đổi trả 7 ngày");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const priceNum = Number(price.replace(/\D/g, "")) || 0;
    const compareNum = Number(compareAtPrice.replace(/\D/g, "")) || 0;
    const stockNum = Number(stock) || 0;
    const images = imageUrls
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const highlights = highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      sku: sku.trim() || undefined,
      price: priceNum,
      compareAtPrice: compareNum,
      stock: stockNum,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      images,
      highlights,
      brand: brand.trim() || undefined,
      badge: badge.trim() || undefined,
      unit: unit.trim() || undefined,
      shippingNote: shippingNote.trim() || undefined,
    });
    setTitle("");
    setSku("");
    setPrice("299000");
    setCompareAtPrice("399000");
    setStock("10");
    setShortDescription("");
    setDescription("");
    setImageUrls("");
    setHighlightsText("");
    setBrand("");
    setBadge("Mới");
    setUnit("chai");
    setShippingNote("Giao 2–4 ngày · Đổi trả 7 ngày");
    onClose();
  };

  const previewImage = imageUrls
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)[0];

  return (
    <>
      <div
        className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-99999 flex flex-col w-full max-w-[560px] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-150 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Sản phẩm cửa hàng online
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Thông tin đầy đủ để khách hiểu SP (mock → Medusa sau)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Serum Vitamin C 30ml"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SKU</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Tự sinh nếu trống"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thương hiệu</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: Ladi Care"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Giá bán (VND)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Giá gạch</label>
              <input
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="0 = ẩn"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tồn kho</label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Đơn vị</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="chai / hộp / gói"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge</label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Bán chạy / Mới / -30%"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ảnh sản phẩm (URL, mỗi dòng hoặc cách bởi dấu phẩy)
            </label>
            <textarea
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              rows={3}
              placeholder={"/images/product/skincare_product.png\nhttps://..."}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400 resize-none font-mono text-[12px]"
            />
            {previewImage && (
              <div className="flex items-center gap-3 mt-1">
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-[11px] text-slate-400">Ảnh chính (preview)</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mô tả ngắn (thẻ SP / landing)
            </label>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1–2 câu lợi ích chính"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mô tả đầy đủ
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Thành phần, cách dùng, đối tượng…"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Điểm nổi bật (mỗi dòng 1 ý)
            </label>
            <textarea
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              rows={3}
              placeholder={"Không paraben\nThấm nhanh\nPhù hợp da dầu"}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Giao hàng / bảo hành
            </label>
            <input
              value={shippingNote}
              onChange={(e) => setShippingNote(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 font-medium focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-150 dark:border-gray-800">
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
            disabled={!title.trim()}
            className="px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-lime-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </>
  );
}
