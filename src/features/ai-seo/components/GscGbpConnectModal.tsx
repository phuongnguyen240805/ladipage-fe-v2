import React, { useState } from "react";
import { X, Globe, Building, Loader2 } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";
import { fetchGscConnectUrl, fetchGbpConnectUrl } from "../api/integrations.api";

export function GscGbpConnectModal() {
  const { gscGbpModalType, gscGbpModalProjectId, setGscGbpModal } =
    useAiSeoDashboardStore();
  const [connecting, setConnecting] = useState(false);

  if (!gscGbpModalType || !gscGbpModalProjectId) return null;

  const isGsc = gscGbpModalType === "gsc";

  const handleConnect = async () => {
    try {
      setConnecting(true);
      let res: { url: string };
      if (isGsc) {
        res = await fetchGscConnectUrl(gscGbpModalProjectId);
      } else {
        res = await fetchGbpConnectUrl(gscGbpModalProjectId);
      }
      // Redirect browser to mock Google OAuth url callback
      window.location.href = res.url;
    } catch (err) {
      console.error("Connection error:", err);
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative flex flex-col gap-4 text-left">
        {/* Close Button */}
        <button
          onClick={() => setGscGbpModal(null, null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          disabled={connecting}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            {isGsc ? (
              <Globe className="w-5 h-5" />
            ) : (
              <Building className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-none mb-1">
              {isGsc ? "Google Search Console" : "Google Business Profile"}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
              Tích hợp tài khoản Google OAuth
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          {isGsc
            ? "Kết nối Google Search Console để theo dõi hiệu suất tìm kiếm, trạng thái lập chỉ mục và các chỉ số SEO kỹ thuật."
            : "Kết nối Google Business Profile để quản lý danh sách doanh nghiệp, phản hồi đánh giá và theo dõi hiệu suất SEO địa phương."}
        </p>

        {/* Actions buttons */}
        <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setGscGbpModal(null, null)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
            disabled={connecting}
          >
            Để sau
          </button>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-75"
            disabled={connecting}
          >
            {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isGsc
              ? "Kết nối Google Search Console"
              : "Kết nối Google Business Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default GscGbpConnectModal;
