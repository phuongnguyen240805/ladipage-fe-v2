"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreateProductDrawerProps {
  isOpen: boolean;
  productType: string;
  productTypeName: string;
  onClose: () => void;
  onSave: (product: { name: string; sku: string; type: string; typeName: string }) => void;
}

// ─── Rich text toolbar (decorative) ──────────────────────────────────────────
const RichToolbar = () => (
  <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-150 dark:border-gray-800 flex-wrap bg-gray-50/60 dark:bg-gray-900/60">
    <div className="relative flex-shrink-0">
      <select className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer pr-5 focus:outline-none">
        <option>Paragraph</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
      </select>
      <span className="absolute inset-y-0 right-1 flex items-center pointer-events-none text-slate-400">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
      </span>
    </div>
    <div className="relative flex-shrink-0 ml-1">
      <select className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer pr-5 focus:outline-none">
        <option>16px</option><option>14px</option><option>18px</option>
      </select>
      <span className="absolute inset-y-0 right-1 flex items-center pointer-events-none text-slate-400">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
      </span>
    </div>
    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
    {[{l:"B",t:"In đậm",c:"font-black"},{l:"I",t:"In nghiêng",c:"italic"},{l:"U",t:"Gạch dưới",c:"underline"},{l:"S",t:"Gạch ngang",c:"line-through"}].map((btn) => (
      <button key={btn.l} type="button" title={btn.t} className={`w-6 h-6 flex items-center justify-center rounded text-[11px] ${btn.c} text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition`}>{btn.l}</button>
    ))}
    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
    {["left","center","right"].map((align) => (
      <button key={align} type="button" className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          {align==="left"&&<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></>}
          {align==="center"&&<><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
          {align==="right"&&<><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></>}
        </svg>
      </button>
    ))}
  </div>
);

// ─── Type badge ───────────────────────────────────────────────────────────────
const getTypeBadge = (typeId: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    physical: { bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300" },
    digital:  { bg: "bg-lime-50 dark:bg-lime-950/40",    text: "text-lime-600 dark:text-lime-200" },
    event:    { bg: "bg-rose-100 dark:bg-rose-950/40",    text: "text-rose-700 dark:text-rose-300" },
    service:  { bg: "bg-green-100 dark:bg-green-950/40",  text: "text-green-700 dark:text-green-300" },
    combo:    { bg: "bg-violet-100 dark:bg-violet-950/40",text: "text-violet-700 dark:text-violet-300" },
  };
  return map[typeId] ?? map["digital"];
};

// ─── Drawer Component ─────────────────────────────────────────────────────────
export const CreateProductDrawer: React.FC<CreateProductDrawerProps> = ({
  isOpen,
  productType,
  productTypeName,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Overview tab state
  const [productName, setProductName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [store, setStore] = useState("");
  const [skuMode, setSkuMode] = useState("Không tạo mã");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  // Phiên bản tab state
  type Variant = { id: string; name: string; price: number; downloads: number };
  const [variants, setVariants] = useState<Variant[]>([]);

  // SEO tab state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Up-Sell tab state
  const [upsellProducts, setUpsellProducts] = useState<string[]>([]);

  // Highlight tab state
  const [soldCount, setSoldCount] = useState(0);

  const tabs = [
    { key: "overview",  label: "Tổng quan" },
    { key: "variants",  label: "Phiên bản" },
    { key: "seo",       label: "SEO" },
    { key: "upsell",    label: "Up Sell" },
    { key: "highlight", label: "Highlight" },
  ];

  const typeBadge = getTypeBadge(productType);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!productName.trim()) return;
    onSave({
      name: productName.trim(),
      sku: "SKU-" + Date.now().toString().slice(-6),
      type: productType,
      typeName: productTypeName,
    });
    // Reset
    setProductName(""); setShortDesc(""); setFullDesc("");
    setVariants([]); setSeoTitle(""); setSeoDesc(""); setSeoKeywords([]); setSeoKeywordInput("");
    setFaviconUrl(""); setOgImageUrl(""); setUpsellProducts([]); setSoldCount(0);
    setActiveTab("overview");
    onClose();
  };

  const addSeoKeyword = () => {
    const kw = seoKeywordInput.trim().replace(/,$/, "");
    if (kw && !seoKeywords.includes(kw)) setSeoKeywords((prev) => [...prev, kw]);
    setSeoKeywordInput("");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-99999 flex flex-col w-full max-w-[900px] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-in-right">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {productName || "Sản phẩm mới"}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${typeBadge.bg} ${typeBadge.text}`}>
              Hiển thị
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">SKU –</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex items-center border-b border-gray-150 dark:border-gray-850 px-6 flex-shrink-0 bg-white dark:bg-gray-900">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive ? "border-lime-500 text-lime-500" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Tổng quan ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
              {/* LEFT */}
              <div className="lg:col-span-7 p-6 space-y-6 border-r border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">Tên & Mô tả</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tên hiển thị và phần mô tả khách hàng thấy ở trang chi tiết.</p>
                </div>
                {/* Product name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="VD: Áo thun LadiPage – Size M"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-50 font-medium"
                    required
                  />
                </div>
                {/* Short desc */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả ngắn</label>
                  <div className="relative">
                    <textarea placeholder="1-2 câu tóm tắt sản phẩm..." maxLength={180} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={3}
                      className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium resize-none" />
                    <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400">{shortDesc.length}/180</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Tối đa ~180 ký tự. Nếu để trống, hệ thống dùng đoạn đầu của mô tả chi tiết.</p>
                </div>
                {/* Full desc */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả</label>
                  <div className="border border-gray-250 dark:border-gray-800 rounded-lg overflow-hidden">
                    <RichToolbar />
                    <textarea value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} placeholder="Nhập mô tả chi tiết sản phẩm..." rows={8}
                      className="w-full px-4 py-3 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none font-medium resize-none" />
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-5 p-6 space-y-6 bg-slate-50/40 dark:bg-gray-950/20">
                {/* Định danh */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-gray-800">Định danh</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cửa hàng</label>
                    <div className="relative">
                      <select value={store} onChange={(e) => setStore(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-600 dark:text-slate-350 focus:outline-none focus:border-lime-400 cursor-pointer">
                        <option value="">Chọn hoặc thêm cửa hàng...</option>
                        <option>Cửa hàng chính</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></span>
                    </div>
                  </div>
                </div>
                {/* Hình thức tạo mã */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-gray-800">Hình thức tạo mã</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chọn hình thức tạo mã</label>
                    <div className="relative">
                      <select value={skuMode} onChange={(e) => setSkuMode(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-600 dark:text-slate-350 focus:outline-none focus:border-lime-400 cursor-pointer">
                        <option>Không tạo mã</option>
                        <option>Tự động sinh SKU</option>
                        <option>Nhập thủ công</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></span>
                    </div>
                  </div>
                </div>
                {/* Tổ chức */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-gray-800">Tổ chức</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại sản phẩm</label>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border border-gray-250 dark:border-gray-800 ${typeBadge.bg}`}>
                      <span className={`text-xs font-bold ${typeBadge.text}`}>{productTypeName}</span>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Không đổi được sau khi tạo.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                    <div className="relative">
                      <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-500 focus:outline-none focus:border-lime-400 cursor-pointer">
                        <option value="">Chọn một hoặc nhiều danh mục...</option>
                        <option>Áo quần</option><option>Điện tử</option><option>Sức khỏe</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Một sản phẩm có thể thuộc nhiều danh mục.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tag</label>
                    <div className="relative">
                      <select value={tags} onChange={(e) => setTags(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-500 focus:outline-none focus:border-lime-400 cursor-pointer">
                        <option value="">Chọn hoặc tạo tag...</option>
                        <option>VIP</option><option>Giao gấp</option><option>Khách quen</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Phiên bản ── */}
          {activeTab === "variants" && (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Phiên bản</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Mỗi phiên bản là một lựa chọn tải về của sản phẩm số.</p>
                </div>
                <button
                  onClick={() => setVariants((prev) => [...prev, { id: String(Date.now()), name: `${productName || "s"}-Phiên bản mẫu`, price: 0, downloads: 1 }])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-lime-500 border border-lime-100 dark:border-lime-900 bg-lime-50 dark:bg-lime-950/30 hover:bg-lime-50 rounded-lg cursor-pointer transition whitespace-nowrap"
                >
                  + Thêm phiên bản
                </button>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/60 dark:bg-gray-800/10">
                      <th className="py-3 px-4 text-xs font-bold text-slate-800 dark:text-slate-200">Tên phiên bản</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-800 dark:text-slate-200">Giá phiên bản</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-800 dark:text-slate-200">Số lượt tải</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-800 dark:text-slate-200">ID</th>
                      <th className="py-3 px-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {variants.length > 0 ? (
                      variants.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition">
                          <td className="py-3.5 px-4">
                            <input type="text" value={v.name}
                              onChange={(e) => setVariants((prev) => prev.map((x) => x.id === v.id ? { ...x, name: e.target.value } : x))}
                              className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:outline-none focus:border-lime-400 w-full"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input type="number" value={v.price}
                              onChange={(e) => setVariants((prev) => prev.map((x) => x.id === v.id ? { ...x, price: Number(e.target.value) } : x))}
                              className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:outline-none focus:border-lime-400 w-24"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">{v.downloads}</td>
                          <td className="py-3.5 px-4"><span className="text-[11px] font-mono text-lime-400 dark:text-lime-300">#{v.id.slice(-6)}</span></td>
                          <td className="py-3.5 px-4 text-center">
                            <button onClick={() => setVariants((prev) => prev.filter((x) => x.id !== v.id))} className="text-red-400 hover:text-red-600 p-1 rounded transition cursor-pointer">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-10 text-center text-xs font-medium text-slate-400 dark:text-slate-500">Chưa có phiên bản nào. Bấm "+ Thêm phiên bản" để tạo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SEO ── */}
          {activeTab === "seo" && (
            <div className="p-6 space-y-6 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tối ưu công cụ tìm kiếm</h4>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Tỳnh chỉnh slug và meta tags để sản phẩm hiển thị tốt trên Google.</p>
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Favicon</label>
                <div className="flex items-stretch gap-3">
                  <div className="w-24 h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-lime-300 hover:bg-lime-50/40 transition select-none text-slate-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zm10.5-11.25h.008v.008h-.008V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                    <span className="text-[9px] font-medium text-center leading-tight px-1">Kéo favicon vào đây</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="url" placeholder="https://..." value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                      Tải ảnh từ máy
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Icon hiển thị trên tab trình duyệt và breadcrumb Google. Khuyến nghị PNG/SVG vuông, ≤ 64×64.</p>
              </div>

              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề SEO</label>
                <div className="relative">
                  <input type="text" maxLength={60} value={seoTitle || productName} onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-none focus:border-lime-400 font-medium" />
                  <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400">{(seoTitle || productName).length}/60</span>
                </div>
              </div>

              {/* SEO Desc */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả SEO</label>
                <div className="relative">
                  <textarea placeholder="Tóm tắt 1-2 câu giúp khách click vào kết quả tìm kiếm." maxLength={180} rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium resize-none" />
                  <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400">{seoDesc.length}/180</span>
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Từ khoá SEO</label>
                {seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {seoKeywords.map((kw) => (
                      <span key={kw} className="flex items-center gap-1 px-2.5 py-0.5 bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-200 rounded-full text-[11px] font-bold">
                        {kw}
                        <button onClick={() => setSeoKeywords((prev) => prev.filter((k) => k !== kw))} className="hover:text-red-500 cursor-pointer transition">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {seoKeywords.length === 0 && <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Chưa có từ khoá nào</p>}
                <div className="flex gap-2">
                  <input type="text" placeholder="Nhập từ khoá rồi Enter hoặc dấu phẩy" value={seoKeywordInput} onChange={(e) => setSeoKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === ",") && seoKeywordInput.trim()) { e.preventDefault(); addSeoKeyword(); } }}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
                  <button onClick={addSeoKeyword} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-lime-500 border border-lime-100 dark:border-lime-900 bg-lime-50 dark:bg-lime-950/30 hover:bg-lime-50 rounded-lg cursor-pointer transition">
                    + Thêm
                  </button>
                </div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Từ khoá liên quan tới sản phẩm, mỗi từ một chip. Hỗ trợ một số crawler legacy và Bing.</p>
              </div>

              {/* Open Graph */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh Open Graph</label>
                <div className="flex items-stretch gap-3">
                  <div className="w-24 h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-lime-300 hover:bg-lime-50/40 transition select-none text-slate-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zm10.5-11.25h.008v.008h-.008V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                    <span className="text-[9px] font-medium text-center leading-tight px-1">Kéo ảnh vào đây</span>
                  </div>
                  <input type="url" placeholder="https://..." value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 placeholder-slate-400 focus:outline-none focus:border-lime-400 font-medium" />
                </div>
              </div>
            </div>
          )}

          {/* ── Up Sell ── */}
          {activeTab === "upsell" && (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Sản phẩm Up-Sell</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Gợi ý sản phẩm cao cấp hơn / mua thêm hiển thị tại trang chi tiết sản phẩm.</p>
                </div>
                <button
                  onClick={() => setUpsellProducts((prev) => [...prev, `Sản phẩm gợi ý ${prev.length + 1}`])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-lime-500 border border-lime-100 dark:border-lime-900 bg-lime-50 dark:bg-lime-950/30 hover:bg-lime-50 rounded-lg cursor-pointer transition whitespace-nowrap"
                >
                  + Thêm sản phẩm
                </button>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                {upsellProducts.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {upsellProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p}</span>
                        <button onClick={() => setUpsellProducts((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1 rounded transition cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3 select-none">
                    <div className="w-14 h-14 rounded-full bg-lime-50 dark:bg-lime-950/30 flex items-center justify-center">
                      <svg className="w-7 h-7 text-lime-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có sản phẩm Up-Sell</h4>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">
                      Up-Sell ở trang chi tiết giúp giới thiệu phân cao cấp hơn hoặc sản phẩm bổ trợ, tăng giá trị trung bình của đơn hàng.
                    </p>
                    <button
                      onClick={() => setUpsellProducts((prev) => [...prev, `Sản phẩm gợi ý ${prev.length + 1}`])}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      + Thêm sản phẩm
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Highlight ── */}
          {activeTab === "highlight" && (
            <div className="p-6 space-y-5 max-w-xl">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Highlight</h4>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Cấu hình số lượng đã bán và vị trí hiển thị nổi bật trên trang bán hàng.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số lượng đã bán</label>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <input
                      type="number" min={0} value={soldCount}
                      onChange={(e) => setSoldCount(Number(e.target.value))}
                      className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none"
                    />
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                      Số lượng sản phẩm đã bán sẽ hiển thị trên trang bán hàng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Mọi thay đổi đã được lưu</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg cursor-pointer transition">
              Huỷ
            </button>
            <button
              onClick={handleSave}
              disabled={!productName.trim()}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition ${
                productName.trim() ? "bg-violet-600 hover:bg-violet-700 cursor-pointer" : "bg-violet-400 opacity-50 cursor-not-allowed"
              }`}
            >
              {productName.trim() ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
