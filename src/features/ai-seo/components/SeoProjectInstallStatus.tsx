import React from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface SeoProjectInstallStatusProps {
  status: "not_installed" | "checking" | "installed" | "failed";
}

export function SeoProjectInstallStatus({
  status,
}: SeoProjectInstallStatusProps) {
  if (status === "installed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Installed
      </span>
    );
  }

  if (status === "checking") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
      <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
      Not Installed
    </span>
  );
}
export default SeoProjectInstallStatus;
