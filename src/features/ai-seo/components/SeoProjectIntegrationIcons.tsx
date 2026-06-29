import React from "react";
import { Globe, Building } from "lucide-react";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";

interface SeoProjectIntegrationIconsProps {
  projectId: string;
  gscConnected: boolean;
  gbpConnected: boolean;
  detectedCms?: string | null;
}

export function SeoProjectIntegrationIcons({
  projectId,
  gscConnected,
  gbpConnected,
  detectedCms,
}: SeoProjectIntegrationIconsProps) {
  const { setGscGbpModal } = useAiSeoDashboardStore();

  return (
    <div className="flex items-center gap-2.5">
      {/* GSC Connection Button */}
      <button
        onClick={() => !gscConnected && setGscGbpModal("gsc", projectId)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition duration-150 ${
          gscConnected
            ? "bg-violet-50 text-violet-700 border-violet-100 cursor-default"
            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
        }`}
        title={
          gscConnected
            ? "Google Search Console connected"
            : "Connect Google Search Console"
        }
        disabled={gscConnected}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span>GSC</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            gscConnected ? "bg-green-500 animate-pulse" : "bg-slate-300"
          }`}
        ></span>
      </button>

      {/* GBP Connection Button */}
      <button
        onClick={() => !gbpConnected && setGscGbpModal("gbp", projectId)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition duration-150 ${
          gbpConnected
            ? "bg-violet-50 text-violet-700 border-violet-100 cursor-default"
            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
        }`}
        title={
          gbpConnected
            ? "Google Business Profile connected"
            : "Connect Google Business Profile"
        }
        disabled={gbpConnected}
      >
        <Building className="w-3.5 h-3.5 shrink-0" />
        <span>GBP</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            gbpConnected ? "bg-green-500 animate-pulse" : "bg-slate-300"
          }`}
        ></span>
      </button>

      {/* Detected CMS label */}
      {detectedCms && (
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-100">
          <span className="uppercase font-extrabold">{detectedCms}</span>
        </div>
      )}
    </div>
  );
}
export default SeoProjectIntegrationIcons;
