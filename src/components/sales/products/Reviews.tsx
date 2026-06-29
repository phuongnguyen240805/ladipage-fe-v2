"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Review = {
  id: string;
  customerName: string;
  avatarUrl: string;
  rating: number;
  content: string;
  productNames: string[];
  createdAt: string;
  imageUrls: string[];
};

// ─── Star Rating Component ────────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean; size?: string }> = ({
  value, onChange, readonly = false, size = "w-6 h-6",
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${size} ${readonly ? "cursor-default" : "cursor-pointer"} transition-transform ${!readonly ? "hover:scale-110" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill={(hovered || value) >= star ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
          </svg>
        </button>
      ))}
    </div>
  );
};

// ─── Create Review Drawer ─────────────────────────────────────────────────────
interface CreateReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Review) => void;
}

const now = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const CreateReviewDrawer: React.FC<CreateReviewDrawerProps> = ({ isOpen, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState(now());
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [products, setProducts] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!customerName.trim() || !content.trim()) return;
    onSave({
      id: String(Date.now()),
      customerName: customerName.trim(),
      avatarUrl: "",
      rating,
      content: content.trim(),
      productNames: products,
      createdAt,
      imageUrls,
    });
    setCustomerName(""); setRating(5); setContent(""); setCreatedAt(now());
    setImageUrls([]); setImageUrlInput(""); setProducts([]);
    onClose();
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && imageUrls.length < 6) {
      setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-99999 flex flex-col w-full max-w-[580px] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tạo đánh giá mới</h3>
            <p className="text-[11px] font-medium text-lime-500 dark:text-lime-300 mt-0.5">Tạo đánh giá thủ công và áp dụng cho một hoặc nhiều sản phẩm.</p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button onClick={onClose} className="px-3 py-1.5 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition">Huỷ</button>
            <button
              onClick={handleSave}
              disabled={!customerName.trim() || !content.trim()}
              className={`px-4 py-1.5 text-sm font-bold text-white rounded-lg shadow-sm transition ${customerName.trim() && content.trim() ? "bg-lime-500 hover:bg-lime-600 cursor-pointer" : "bg-lime-300 opacity-50 cursor-not-allowed"}`}
            >
              Lưu đánh giá
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nội dung đánh giá */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nội dung đánh giá</h4>

            {/* Avatar + Name */}
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800 border-2 border-dashed border-gray-250 dark:border-gray-700 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-lime-300 transition">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên khách hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* Rating + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Điểm đánh giá (tối đa 5 điểm)</label>
                <div className="flex items-center gap-2">
                  <StarRating value={rating} onChange={setRating} size="w-7 h-7" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{rating}/5</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian tạo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="w-full px-3 py-2.5 pr-8 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-lime-400 font-medium"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Review content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nội dung đánh giá <span className="text-red-500">*</span></label>
              <div className="relative">
                <textarea
                  placeholder="Nhập nội dung đánh giá"
                  maxLength={1000}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium resize-y"
                />
                <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400">{content.length}/1000</span>
              </div>
            </div>
          </div>

          {/* Review images */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Hình ảnh đánh giá ({imageUrls.length}/6)
            </h4>
            {/* Uploaded images preview */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Drop zone */}
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-lime-300 hover:bg-lime-50/30 dark:hover:bg-lime-950/10 transition select-none">
              <svg className="w-9 h-9 text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zm10.5-11.25h.008v.008h-.008V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
              </svg>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tải ảnh lên hoặc Thêm từ URL</p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Kích thước khuyến nghị 400×400 (px)</p>
            </div>
            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Dán URL ảnh..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium"
              />
              <button
                type="button"
                onClick={addImageUrl}
                disabled={!imageUrlInput.trim() || imageUrls.length >= 6}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                Thêm từ URL
              </button>
            </div>
          </div>

          {/* Product list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Danh sách sản phẩm áp dụng đánh giá</h4>
              <button
                type="button"
                onClick={() => setProducts((prev) => [...prev, `Sản phẩm ${prev.length + 1}`])}
                className="inline-flex items-center gap-1 text-xs font-bold text-lime-500 hover:text-lime-600 cursor-pointer transition"
              >
                + Thêm sản phẩm
              </button>
            </div>
            {products.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                {products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p}</span>
                    <button type="button" onClick={() => setProducts((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 cursor-pointer transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Chưa có sản phẩm nào được thêm.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Reviews Main Component ───────────────────────────────────────────────────
export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };

  const handleSave = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
    triggerToast(`Đã tạo đánh giá từ "${review.customerName}"`);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const filtered = reviews.filter((r) =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productNames.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý đánh giá</h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Duyệt đánh giá, phản hồi khách hàng và ẩn nội dung{" "}
            <span className="text-orange-500 font-bold">không phù hợp</span>.
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
          </svg>
          Tạo đánh giá
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-theme-xs">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Tổng số đánh giá</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{reviews.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-theme-xs">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Điểm trung bình</p>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-black text-slate-800 dark:text-white">{avgRating ?? "—"}</p>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" placeholder="Tìm trong nội dung, tên sản phẩm hoặc khách hàng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col">
        <table className="w-full text-left border-collapse flex-1">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Nội dung</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Sản phẩm</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Khách hàng</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Điểm đánh giá</th>
              <th className="py-3.5 px-5 text-xs font-bold text-slate-855 dark:text-slate-200">Thời gian</th>
              <th className="py-3.5 px-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition">
                  <td className="py-4 px-5 max-w-[200px]">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{r.content}</p>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {r.productNames.join(", ") || "—"}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{r.customerName}</span>
                  </td>
                  <td className="py-4 px-5">
                    <StarRating value={r.rating} readonly size="w-4 h-4" />
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.createdAt}</td>
                  <td className="py-4 px-5 text-center">
                    <button onClick={() => { setReviews((prev) => prev.filter((x) => x.id !== r.id)); triggerToast("Đã xóa đánh giá"); }}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-24 text-center select-none">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                      <svg className="w-7 h-7 text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.226 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có đánh giá nào</h4>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
                      Đánh giá từ khách hàng sẽ xuất hiện ở đây khi sản phẩm bắt đầu được mua.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateReviewDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSave={handleSave} />
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 rounded-xl shadow-xl px-4 py-3 min-w-[220px] text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
