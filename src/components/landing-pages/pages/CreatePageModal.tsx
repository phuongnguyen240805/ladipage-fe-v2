import React, { useState, useEffect } from "react";
import { IconX } from "../dung-chung/icons";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onGenerate: (payload: {
    type: "blank" | "ai" | "clone" | "import" | "ppc";
    name: string;
    params: Record<string, any>;
  }) => void;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  onGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<"blank" | "ai" | "clone" | "import" | "ppc">("blank");

  // Common/Blank fields
  const [pageName, setPageName] = useState("");

  // AI fields
  const [aiBusinessName, setAiBusinessName] = useState("");
  const [aiIndustry, setAiIndustry] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiGoal, setAiGoal] = useState("generate_leads");
  const [aiStyle, setAiStyle] = useState("modern");
  const [aiPrompt, setAiPrompt] = useState("");

  // Clone fields
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneMode, setCloneMode] = useState<"visual_clone" | "seo_landing_page">("visual_clone");
  const [cloneKeyword, setCloneKeyword] = useState("");

  // Import fields
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<"preserve" | "convert">("preserve");

  // PPC fields
  const [ppcSource, setPpcSource] = useState("google_ads");
  const [ppcCampaignId, setPpcCampaignId] = useState("");
  const [ppcKeyword, setPpcKeyword] = useState("");
  const [ppcGoal, setPpcGoal] = useState("generate_leads");
  const [ppcOffer, setPpcOffer] = useState("");
  const [ppcCta, setPpcCta] = useState("");

  // Reset all forms when modal opens
  useEffect(() => {
    if (isOpen) {
      setPageName("");
      setAiBusinessName("");
      setAiIndustry("");
      setAiLocation("");
      setAiGoal("generate_leads");
      setAiStyle("modern");
      setAiPrompt("");
      setCloneUrl("");
      setCloneMode("visual_clone");
      setCloneKeyword("");
      setImportFile(null);
      setImportMode("preserve");
      setPpcSource("google_ads");
      setPpcCampaignId("");
      setPpcKeyword("");
      setPpcGoal("generate_leads");
      setPpcOffer("");
      setPpcCta("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = pageName.trim();
    let params: Record<string, any> = {};

    if (activeTab === "blank") {
      if (!targetName) return;
    } else if (activeTab === "ai") {
      if (!targetName) targetName = aiBusinessName || "AI Page";
      params = {
        businessName: aiBusinessName,
        industry: aiIndustry,
        location: aiLocation,
        goal: aiGoal,
        style: aiStyle,
        prompt: aiPrompt,
      };
    } else if (activeTab === "clone") {
      if (!targetName) {
        try {
          const domain = cloneUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
          targetName = `Clone ${domain || "Website"}`;
        } catch {
          targetName = "Cloned Page";
        }
      }
      params = {
        url: cloneUrl,
        cloneMode,
        keyword: cloneKeyword,
      };
    } else if (activeTab === "import") {
      if (!targetName) targetName = importFile?.name.split(".")[0] || "Imported Page";
      params = {
        file: importFile,
        importMode,
      };
    } else if (activeTab === "ppc") {
      if (!targetName) targetName = ppcKeyword ? `PPC ${ppcKeyword}` : "PPC Campaign Page";
      params = {
        source: ppcSource,
        campaignId: ppcCampaignId,
        keyword: ppcKeyword,
        goal: ppcGoal,
        offer: ppcOffer,
        cta: ppcCta,
      };
    }

    onGenerate({
      type: activeTab,
      name: targetName,
      params,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const tabs = [
    { id: "blank" as const, label: "Tạo trống" },
    { id: "ai" as const, label: "AI Generator" },
    { id: "clone" as const, label: "Clone URL" },
    { id: "import" as const, label: "Import ZIP" },
    { id: "ppc" as const, label: "PPC Campaign" },
  ];

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-5 flex-shrink-0 bg-gray-50 dark:bg-gray-950">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>✨ Khởi tạo Landing Page</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-extrabold tracking-widest uppercase">Website Builder</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1 cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-2 py-1 gap-1 flex-shrink-0 select-none">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 text-center py-2 text-xs font-bold transition rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* PAGE NAME FIELD (Visible on standard, clone, import, ppc as editable name) */}
          {activeTab !== "ai" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tên Landing Page
              </label>
              <input
                type="text"
                placeholder={
                  activeTab === "blank"
                    ? "Ví dụ: km-tet-2026, landing-gioithieu"
                    : "Để trống để tự động đặt tên"
                }
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
                required={activeTab === "blank"}
                autoFocus={activeTab === "blank"}
              />
            </div>
          )}

          {/* ── 1. BLANK TAB CONTENT ── */}
          {activeTab === "blank" && (
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Tạo trang trống sạch sẽ để bạn tự do kéo thả các phần tử, hoặc bấm nút &quot;Dùng mẫu&quot; ở thư viện template bên ngoài để thiết kế nhanh hơn.
            </p>
          )}

          {/* ── 2. AI GENERATOR TAB CONTENT ── */}
          {activeTab === "ai" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tên Doanh nghiệp</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lumière Spa, AirFix Service"
                    value={aiBusinessName}
                    onChange={(e) => setAiBusinessName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lĩnh vực hoạt động</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Spa làm đẹp, Sửa điều hòa"
                    value={aiIndustry}
                    onChange={(e) => setAiIndustry(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Khu vực hoạt động</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hà Nội, Toàn quốc"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phong cách giao diện</label>
                  <select
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    <option value="modern">Hiện đại (Sắc sảo, Clean)</option>
                    <option value="premium">Sang trọng (Tối giản, Dark mode)</option>
                    <option value="bold">Nổi bật (Vibrant, Trẻ trung)</option>
                    <option value="friendly">Thân thiện (Organic, Hài hòa)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mục tiêu Landing Page</label>
                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                >
                  <option value="generate_leads">Thu thập thông tin khách hàng (Form leads)</option>
                  <option value="sell_products">Bán sản phẩm trực tiếp (E-commerce)</option>
                  <option value="brand_intro">Giới thiệu dịch vụ & Hẹn lịch tư vấn</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ý tưởng / Yêu cầu chi tiết cho AI</label>
                <textarea
                  required
                  placeholder="Ví dụ: Thiết kế trang web giới thiệu dịch vụ spa thảo mộc dưỡng sinh. Cần có mục giới thiệu dịch vụ, bảng giá, nhận xét khách hàng và form đăng ký tư vấn nhận ưu đãi giảm 20%."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ── 3. CLONE URL TAB CONTENT ── */}
          {activeTab === "clone" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Đường dẫn URL web nguồn</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: https://mypham-spa-beauty.com/page-detail"
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chế độ Clone</label>
                <select
                  value={cloneMode}
                  onChange={(e) => setCloneMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                >
                  <option value="visual_clone">Bản sao Visual (Sao chép hình ảnh và bố cục)</option>
                  <option value="seo_landing_page">Tối ưu hóa SEO (Tái cấu trúc nội dung chuẩn SEO)</option>
                </select>
              </div>

              {cloneMode === "seo_landing_page" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Từ khóa SEO đích</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: spa tri mun uy tin tai ha noi"
                    value={cloneKeyword}
                    onChange={(e) => setCloneKeyword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── 4. IMPORT ZIP TAB CONTENT ── */}
          {activeTab === "import" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tải tệp ZIP / HTML lên</label>
                <div className="border-2 border-dashed border-gray-250 dark:border-gray-700 hover:border-purple-500 transition rounded-xl p-6 text-center bg-gray-50/50 dark:bg-gray-950/20">
                  <input
                    type="file"
                    accept=".zip,.html"
                    onChange={handleFileChange}
                    className="hidden"
                    id="modal-zip-input"
                    required
                  />
                  <label htmlFor="modal-zip-input" className="cursor-pointer block space-y-2">
                    <svg className="w-8 h-8 text-slate-400 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <span className="block text-xs font-bold text-slate-650 dark:text-slate-350">
                      {importFile ? importFile.name : "Chọn file hoặc thả tệp .zip, .html vào đây"}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold">Tối đa 50MB</span>
                  </label>
                </div>
              </div>

              {/* Thêm lựa chọn Import Mode */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                  Chế độ nhập khẩu (Import Mode)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition select-none ${importMode === "preserve" ? "border-purple-650 bg-purple-500/5" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-transparent"}`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="preserve"
                      checked={importMode === "preserve"}
                      onChange={() => setImportMode("preserve")}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
                      <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${importMode === "preserve" ? "border-purple-600" : "border-gray-400"}`}>
                        {importMode === "preserve" && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                      </span>
                      Bảo toàn bố cục (Preserve)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                      Khuyên dùng. Giữ nguyên 100% giao diện, CSS và cấu trúc gốc hiển thị qua Iframe.
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition select-none ${importMode === "convert" ? "border-purple-650 bg-purple-500/5" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-transparent"}`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="convert"
                      checked={importMode === "convert"}
                      onChange={() => setImportMode("convert")}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
                      <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${importMode === "convert" ? "border-purple-600" : "border-gray-400"}`}>
                        {importMode === "convert" && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                      </span>
                      Khối kéo thả (Convert)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                      Thử nghiệm. Phân rã trang thành các khối Text, Image, Button để sửa đổi kéo thả.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── 5. PPC ADS CAMPAIGN TAB CONTENT ── */}
          {activeTab === "ppc" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nguồn Quảng cáo</label>
                  <select
                    value={ppcSource}
                    onChange={(e) => setPpcSource(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    <option value="google_ads">Google Ads (Search/PMax)</option>
                    <option value="facebook_ads">Facebook Ads (Meta)</option>
                    <option value="tiktok_ads">TikTok Ads</option>
                    <option value="manual">Tạo thủ công (Manual campaign)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Campaign ID (Không bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: cmp_9876543"
                    value={ppcCampaignId}
                    onChange={(e) => setPpcCampaignId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Từ khóa quảng cáo chính</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: lắp camera giám sát gia đình"
                    value={ppcKeyword}
                    onChange={(e) => setPpcKeyword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Hành động của Khách hàng</label>
                  <select
                    value={ppcGoal}
                    onChange={(e) => setPpcGoal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    <option value="generate_leads">Điền form nhận tư vấn</option>
                    <option value="call_now">Bấm gọi điện trực tiếp</option>
                    <option value="buy_now">Thanh toán nhận ưu đãi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nội dung Ưu đãi chính</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giảm 35% + Tặng thẻ nhớ 64GB"
                    value={ppcOffer}
                    onChange={(e) => setPpcOffer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nhãn nút CTA</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đăng ký lắp đặt ngay"
                    value={ppcCta}
                    onChange={(e) => setPpcCta(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-gray-150 rounded-lg dark:text-slate-350 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-md transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang khởi tạo…
                </>
              ) : activeTab === "blank" ? (
                "Tạo trang trống"
              ) : (
                "Bắt đầu thiết kế"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
