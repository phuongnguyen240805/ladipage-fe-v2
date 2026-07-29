import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import SeoAutomationHero from "./SeoAutomationHero";
import SeoProjectList from "./SeoProjectList";
import GscGbpConnectModal from "./GscGbpConnectModal";

function SearchParamsToast() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const successParam = searchParams.get("success");
  const toast = dismissed
    ? null
    : successParam === "gsc_connected"
      ? "Kết nối Google Search Console thành công!"
      : successParam === "gbp_connected"
        ? "Kết nối Google Business Profile thành công!"
        : null;

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500">
        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-100 shrink-0 animate-pulse" />
        <span>{toast}</span>
        <button
          onClick={() => setDismissed(true)}
          className="text-emerald-100 hover:text-white transition ml-1 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function SeoAutomationPage() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-900 min-h-screen text-slate-800 dark:text-gray-100 pb-16 relative">
      {/* Toast Notification wrapped in Suspense for search params */}
      <Suspense fallback={null}>
        <SearchParamsToast />
      </Suspense>

      {/* Hero Header Section */}
      <SeoAutomationHero />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 md:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
          <SeoProjectList />
        </div>
      </div>

      {/* Google Connect OAuth Modal dialog */}
      <GscGbpConnectModal />
    </div>
  );
}
export default SeoAutomationPage;
