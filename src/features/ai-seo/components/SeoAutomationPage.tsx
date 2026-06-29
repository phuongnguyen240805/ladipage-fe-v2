import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import SeoAutomationHero from "./SeoAutomationHero";
import SeoProjectList from "./SeoProjectList";
import GscGbpConnectModal from "./GscGbpConnectModal";

function SearchParamsToast() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const successParam = searchParams.get("success");
    if (successParam === "gsc_connected") {
      setToast("Kết nối Google Search Console thành công!");
    } else if (successParam === "gbp_connected") {
      setToast("Kết nối Google Business Profile thành công!");
    }
  }, [searchParams]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500">
        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-100 shrink-0 animate-pulse" />
        <span>{toast}</span>
        <button
          onClick={() => setToast(null)}
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

      {/* Overlapping Rounded Projects Panel Container */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-250 dark:border-gray-800 p-6 md:p-8 shadow-theme-xs">
          <SeoProjectList />
        </div>
      </div>

      {/* Google Connect OAuth Modal dialog */}
      <GscGbpConnectModal />
    </div>
  );
}
export default SeoAutomationPage;
