import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface SeoProjectWarningBannerProps {
  projectId: string;
  pixelTagState: "not_installed" | "checking" | "installed" | "failed";
  atRiskOfWipe: boolean;
  daysUntilWipe?: number | null;
  wipeScheduledAt?: string | null;
}

export function SeoProjectWarningBanner({
  projectId,
  pixelTagState,
  atRiskOfWipe,
  daysUntilWipe,
  wipeScheduledAt,
}: SeoProjectWarningBannerProps) {
  const isInstallationIncomplete = pixelTagState !== "installed";

  if (!isInstallationIncomplete && !atRiskOfWipe) {
    return null;
  }

  let dateStr = "";
  if (wipeScheduledAt) {
    try {
      const d = new Date(wipeScheduledAt);
      dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (_) {}
  }

  return (
    <div className="bg-amber-50/80 border border-amber-250 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800">
      <div className="flex items-start gap-2.5 text-xs font-semibold">
        <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex flex-col text-left">
          {isInstallationIncomplete && (
            <span>Quá trình cài đặt mã nhúng chưa được hoàn tất.</span>
          )}
          {atRiskOfWipe && (
            <span className="font-bold text-amber-900 mt-0.5">
              {daysUntilWipe === 0
                ? "Dự án này sẽ bị xóa trong hôm nay."
                : daysUntilWipe && daysUntilWipe > 0
                ? `Dự án này sẽ bị xóa sau ${daysUntilWipe} ngày nữa.`
                : dateStr
                ? `Dự án này sẽ bị xóa vào ngày ${dateStr}.`
                : "Dự án này đã được lên lịch xóa."}
            </span>
          )}
        </div>
      </div>

      {isInstallationIncomplete && (
        <Link
          href={`/ai-seo/projects/${projectId}/installation`}
          className="inline-flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-900 transition shrink-0 self-end sm:self-center bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm"
        >
          Tiếp tục cài đặt
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
export default SeoProjectWarningBanner;
