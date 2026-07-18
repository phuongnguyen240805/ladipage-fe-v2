import React, { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useAiSeoProjectMutations } from "../hooks/useAiSeoProjectMutations";
import { useJobPolling } from "../hooks/useJobPolling";

interface SeoProjectScanButtonProps {
  projectId: string;
  taskStatus: "pending" | "started" | "completed" | "failed";
}

export function SeoProjectScanButton({
  projectId,
  taskStatus,
}: SeoProjectScanButtonProps) {
  const { scanMutation } = useAiSeoProjectMutations();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Poll progress in background when jobId is set
  const { job, isPolling } = useJobPolling(currentJobId, "org-1", () => {
    setCurrentJobId(null);
  });

  const handleScan = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPolling || scanMutation.isPending) return;
    setErrorText(null);

    try {
      const res = await scanMutation.mutateAsync(projectId);
      if (res?.jobId) {
        setCurrentJobId(res.jobId);
      }
    } catch (err) {
      console.error("Scan click error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Quét thất bại. Kiểm tra OpenSEO và thử lại.";
      setErrorText(message);
    }
  };

  const isScanning =
    isPolling || taskStatus === "started" || scanMutation.isPending;

  return (
    <div className="flex flex-col items-end gap-1 max-w-[220px]">
      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition duration-150 shrink-0 ${
          isScanning
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm"
        }`}
      >
        {isScanning ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
            <span>
              {typeof job?.progress === "number" && job.progress > 0
                ? `Đang quét ${job.progress}%`
                : "Đang quét..."}
            </span>
          </>
        ) : (
          <>
            <Play className="w-2.5 h-2.5 fill-current text-slate-500" />
            <span>Quét lại</span>
          </>
        )}
      </button>
      {errorText && (
        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 text-right leading-snug">
          {errorText}
        </p>
      )}
    </div>
  );
}
export default SeoProjectScanButton;
