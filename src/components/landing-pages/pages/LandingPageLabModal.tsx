"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, Loader2, RefreshCw, X, CheckCircle2, AlertTriangle, ExternalLink, Zap, ShieldCheck, Accessibility, Sparkles } from "lucide-react";
import { aiSeoApi } from "@/lib/endpoints/ai-seo.api";

export interface UnlighthouseMetrics {
  speedIndex?: { displayValue?: string | null; numericValue?: number | null };
  totalBlockingTime?: { displayValue?: string | null; numericValue?: number | null };
  serverResponseTime?: { displayValue?: string | null; numericValue?: number | null };
  firstContentfulPaint?: { displayValue?: string | null; numericValue?: number | null };
  cumulativeLayoutShift?: { displayValue?: string | null; numericValue?: number | null };
  largestContentfulPaint?: { displayValue?: string | null; numericValue?: number | null };
}

export interface UnlighthouseScores {
  seo?: number | null;
  performance?: number | null;
  accessibility?: number | null;
  "best-practices"?: number | null;
}

export interface UnlighthousePage {
  url?: string;
  device?: string;
  issues?: unknown[];
  scores?: UnlighthouseScores;
  metrics?: UnlighthouseMetrics;
  finalUrl?: string;
}

export interface UnlighthouseResultData {
  jobId?: string;
  status?: string;
  targetUrl?: string;
  phase?: string;
  trigger?: string;
  result?: {
    phase?: string;
    scores?: UnlighthouseScores;
    source?: string;
    metrics?: UnlighthouseMetrics;
    trigger?: string;
    targetUrl?: string;
    lighthouse?: {
      mock?: boolean;
      pages?: UnlighthousePage[];
      source?: string;
      version?: number;
      aggregate?: {
        worstPages?: Array<{ url: string; lcpMs?: number; performance?: number }>;
        pagesFailed?: number;
        pagesScanned?: number;
        avgPerformance?: number;
      };
      fetchedAt?: string;
      lighthouseVersion?: string | null;
    };
    error?: string;
    hint?: string;
  };
  error?: string;
  hint?: string;
}

interface LandingPageLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  websitePageId: string;
  pageName: string;
  targetUrl: string;
  published?: boolean;
}

function isLocalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return false;
  }
}

function getScoreColor(score: number | null | undefined): {
  text: string;
  bg: string;
  border: string;
  stroke: string;
  badge: string;
} {
  if (score == null) {
    return {
      text: "text-slate-400 dark:text-slate-500",
      bg: "bg-slate-50 dark:bg-slate-900",
      border: "border-slate-200 dark:border-slate-800",
      stroke: "#94a3b8",
      badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };
  }
  if (score >= 90) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/60",
      stroke: "#10b981",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/70 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/60",
      stroke: "#f59e0b",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    };
  }
  return {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50/70 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/60",
    stroke: "#f43f5e",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
  };
}

function CircularScoreRing({ score, label, icon }: { score: number | null | undefined; label: string; icon: React.ReactNode }) {
  const color = getScoreColor(score);
  const displayScore = score != null ? Math.round(score) : "--";
  const strokeDashoffset = score != null ? 220 - (220 * Math.min(100, Math.max(0, score))) / 100 : 220;

  return (
    <div className={`flex flex-col items-center justify-between p-4 rounded-2xl border ${color.border} ${color.bg} transition-all duration-200 shadow-xs`}>
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <span className={color.text}>{icon}</span>
        <span>{label}</span>
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-200 dark:text-gray-800"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke={color.stroke}
            strokeWidth="6"
            strokeDasharray="220"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${color.text} tracking-tight`}>
            {displayScore}
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">/100</span>
        </div>
      </div>

      <div className="mt-3">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color.badge}`}>
          {score == null ? "Không có dữ liệu" : score >= 90 ? "Tốt" : score >= 50 ? "Cần cải thiện" : "Kém"}
        </span>
      </div>
    </div>
  );
}

export const LandingPageLabModal: React.FC<LandingPageLabModalProps> = ({
  isOpen,
  onClose,
  websitePageId,
  pageName,
  targetUrl,
  published = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [data, setData] = useState<UnlighthouseResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("Đang chuẩn bị phân tích...");
  // Run-token: the latest scan wins. StrictMode double-mounts the modal, and any
  // remount/close bumps the token so a stale in-flight scan can never set state
  // (the old AbortController pattern discarded the ONLY scan and hung on loading).
  const runIdRef = useRef(0);
  // Fire the auto-scan exactly once per open. StrictMode double-invokes effects
  // (setup → cleanup → setup) on the same fiber, so without this guard BOTH
  // invocations POST a scan. The backend cooldown can't dedupe them because the
  // two requests race before either commits its task row → two Unlighthouse CLI
  // runs (double the scan time).
  const startedRef = useRef(false);

  const runScan = useCallback(async () => {
    const runId = ++runIdRef.current;
    const isCurrent = () => runIdRef.current === runId;

    setLoading(true);
    setStatus("scanning");
    setErrorMessage(null);
    setProgressText("Đang khởi động trình phân tích hiệu suất...");

    try {
      const scanTarget = targetUrl?.trim() || `http://localhost:3000/p/${encodeURIComponent(pageName)}`;

      setProgressText("Đang kết nối và tải trang để đo lường...");

      const start = await aiSeoApi.startLabScan({
        websitePageId,
        targetUrl: scanTarget,
        trigger: "list",
        depth: "quick",
        allowLocal: isLocalUrl(scanTarget),
      });

      if (!isCurrent()) return;

      if (start.status === "success" && start.result) {
        setData({
          jobId: start.jobId,
          status: start.status,
          targetUrl: start.targetUrl || scanTarget,
          phase: start.phase,
          trigger: start.trigger,
          result: start.result as UnlighthouseResultData["result"],
        });
        setStatus("success");
        return;
      }

      if (start.status === "failed") {
        const err = (start.result as any)?.error || (start.result as any)?.hint || "Phân tích không thành công.";
        setErrorMessage(err);
        setStatus("failed");
        return;
      }

      // Polling loop with progressive backoff
      setProgressText("Đang phân tích tốc độ tải & trải nghiệm trang...");
      for (let i = 0; i < 45; i++) {
        if (!isCurrent()) return;

        const delay = i < 5 ? 2000 : i < 15 ? 3000 : 5000;
        await new Promise<void>((resolve) => setTimeout(resolve, delay));

        if (!isCurrent()) return;

        if (i % 3 === 0) {
          setProgressText("Đang thu thập các chỉ số FCP, LCP, TBT, CLS...");
        }

        const job = await aiSeoApi.getLabScan(start.jobId);
        if (!isCurrent()) return;

        if (job.status === "queued") continue;

        if (job.status === "success" && job.result) {
          setData({
            jobId: job.jobId,
            status: job.status,
            targetUrl: scanTarget,
            result: job.result as UnlighthouseResultData["result"],
          });
          setStatus("success");
          return;
        }

        if (job.status === "failed") {
          const err = (job.result as any)?.error || job.error || job.hint || "Phân tích không thành công.";
          setErrorMessage(err);
          setStatus("failed");
          return;
        }
      }

      setErrorMessage("Quá trình phân tích mất nhiều thời gian hơn dự kiến. Vui lòng thử lại.");
      setStatus("failed");
    } catch (err) {
      if (!isCurrent()) return;
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi khi phân tích trang.");
      setStatus("failed");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [websitePageId, pageName, targetUrl]);

  useEffect(() => {
    if (!isOpen) return;
    // Guard against StrictMode's double setup: only the first invocation scans.
    if (startedRef.current) return;
    startedRef.current = true;
    runScan();
  }, [isOpen, runScan]);

  useEffect(() => {
    if (!isOpen) {
      runIdRef.current++;
      startedRef.current = false;
      setStatus("idle");
      setData(null);
      setErrorMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const result = data?.result;
  const lighthouse = result?.lighthouse;
  const firstPage = lighthouse?.pages?.[0];
  const scores = result?.scores || firstPage?.scores;
  const metrics = result?.metrics || firstPage?.metrics;

  const perfScore = scores?.performance != null ? Number(scores.performance) : null;
  const seoScore = scores?.seo != null ? Number(scores.seo) : null;
  const a11yScore = scores?.accessibility != null ? Number(scores.accessibility) : null;
  const bpScore = scores?.["best-practices"] != null ? Number(scores["best-practices"]) : null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 border border-lime-200/50 dark:border-lime-800/40">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                Phân tích hiệu suất trang
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                  {published ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {pageName} &bull; <span className="font-mono text-[11px] text-slate-400">{data?.targetUrl || targetUrl}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === "success" && (
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  runScan();
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Quét lại
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STATE 1: SCANNING */}
          {status === "scanning" && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
              <div className="relative flex items-center justify-center w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-lime-400/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-lime-500/40 animate-pulse" />
                <div className="relative p-5 bg-lime-500 text-white rounded-full shadow-lg shadow-lime-500/30">
                  <Gauge className="w-10 h-10 animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Đang phân tích hiệu suất trang...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {progressText}
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: FAILED */}
          {status === "failed" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Không thể hoàn tất phân tích
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                  {errorMessage || "Đã xảy ra lỗi trong quá trình thu thập thông số hiệu suất."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  runScan();
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại ngay
              </button>
            </div>
          )}

          {/* STATE 3: SUCCESS RESULTS */}
          {status === "success" && (
            <>
              {/* 4 Overview Gauge Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CircularScoreRing score={perfScore} label="Hiệu suất" icon={<Zap className="w-4 h-4" />} />
                <CircularScoreRing score={seoScore} label="Chuẩn SEO" icon={<Sparkles className="w-4 h-4" />} />
                <CircularScoreRing score={a11yScore} label="Truy cập (A11y)" icon={<Accessibility className="w-4 h-4" />} />
                <CircularScoreRing score={bpScore} label="Best Practices" icon={<ShieldCheck className="w-4 h-4" />} />
              </div>

              {/* Detailed Metrics & Core Web Vitals */}
              <div className="bg-gray-50/60 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-lime-500" />
                    Thống kê chi tiết & Core Web Vitals
                  </h3>
                  <span className="text-[11px] text-slate-400">Đo bằng công cụ nội bộ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* FCP */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">First Contentful Paint (FCP)</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.firstContentfulPaint?.displayValue || (metrics?.firstContentfulPaint?.numericValue != null ? `${Math.round(metrics.firstContentfulPaint.numericValue)} ms` : "--")}
                    </div>
                  </div>

                  {/* LCP */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Largest Contentful Paint (LCP)</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.largestContentfulPaint?.displayValue || (metrics?.largestContentfulPaint?.numericValue != null ? `${Math.round(metrics.largestContentfulPaint.numericValue)} ms` : "--")}
                    </div>
                  </div>

                  {/* TBT */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Total Blocking Time (TBT)</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.totalBlockingTime?.displayValue || (metrics?.totalBlockingTime?.numericValue != null ? `${Math.round(metrics.totalBlockingTime.numericValue)} ms` : "--")}
                    </div>
                  </div>

                  {/* CLS */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Cumulative Layout Shift (CLS)</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.cumulativeLayoutShift?.displayValue ?? (metrics?.cumulativeLayoutShift?.numericValue != null ? metrics.cumulativeLayoutShift.numericValue : "--")}
                    </div>
                  </div>

                  {/* Speed Index */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Speed Index</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.speedIndex?.displayValue || (metrics?.speedIndex?.numericValue != null ? `${Math.round(metrics.speedIndex.numericValue)} ms` : "--")}
                    </div>
                  </div>

                  {/* Server Response Time */}
                  <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Server Response Time (TTFB)</div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {metrics?.serverResponseTime?.displayValue || (metrics?.serverResponseTime?.numericValue != null ? `${Math.round(metrics.serverResponseTime.numericValue)} ms` : "--")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-200/60 dark:border-lime-900/30 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 flex-shrink-0" />
                  <span>
                    Phân tích tự động lúc:{" "}
                    <strong>
                      {lighthouse?.fetchedAt ? new Date(lighthouse.fetchedAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN")}
                    </strong>
                  </span>
                </div>
                {targetUrl && (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-lime-600 dark:text-lime-400 hover:underline"
                  >
                    <span>Mở trang thực tế</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
