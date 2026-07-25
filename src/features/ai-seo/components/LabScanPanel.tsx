"use client";

import { useCallback, useState } from "react";
import { Gauge, Loader2 } from "lucide-react";

import { aiSeoApi } from "@/lib/endpoints/ai-seo.api";

type LabScores = {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  lcpMs: number | null;
  cls: number | null;
  mock?: boolean;
  targetUrl?: string;
  phase?: string;
};

interface LabScanPanelProps {
  seoProjectId?: string;
  seoProjectPageId?: string;
  websitePageId?: string;
  targetUrl?: string;
  allowLocal?: boolean;
  className?: string;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractScores(result: Record<string, unknown> | undefined): LabScores | null {
  if (!result) return null;
  const lighthouse = record(result.lighthouse);
  const pages = lighthouse?.pages;
  const first =
    Array.isArray(pages) && pages[0] && typeof pages[0] === "object"
      ? (pages[0] as Record<string, unknown>)
      : null;
  const scores = record(result.scores) ?? (first ? record(first.scores) : null);
  const metrics = record(result.metrics) ?? (first ? record(first.metrics) : null);
  const lcp = metrics ? record(metrics.largestContentfulPaint) : null;
  const cls = metrics ? record(metrics.cumulativeLayoutShift) : null;
  if (!scores && !metrics) return null;
  return {
    performance: scores ? numberValue(scores.performance) : null,
    accessibility: scores ? numberValue(scores.accessibility) : null,
    bestPractices: scores ? numberValue(scores["best-practices"]) : null,
    seo: scores ? numberValue(scores.seo) : null,
    lcpMs: lcp ? numberValue(lcp.numericValue) : null,
    cls: cls ? numberValue(cls.numericValue) : null,
    mock: result.mock === true || lighthouse?.mock === true,
    targetUrl: typeof result.targetUrl === "string" ? result.targetUrl : undefined,
    phase: typeof result.phase === "string" ? result.phase : undefined,
  };
}

function failureText(job: {
  error?: string;
  hint?: string;
  result?: Record<string, unknown>;
}): string {
  const result = job.result;
  const error =
    (typeof result?.error === "string" ? result.error : undefined) ?? job.error;
  const hint =
    (typeof result?.hint === "string" ? result.hint : undefined) ?? job.hint;
  return error || hint || "Lab scan failed.";
}

export function LabScanPanel({
  seoProjectId,
  seoProjectPageId,
  websitePageId,
  targetUrl,
  allowLocal,
  className,
}: LabScanPanelProps) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<LabScores | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const start = await aiSeoApi.startLabScan({
        seoProjectId,
        seoProjectPageId,
        websitePageId,
        targetUrl,
        trigger: "manual",
        depth: "quick",
        allowLocal,
      });

      if (start.status === "success") {
        const next = extractScores(start.result);
        setScores(next);
        if (!next) setError("Unlighthouse completed but did not return Lighthouse scores.");
        return;
      }

      if (start.status === "failed") {
        setError(failureText({ result: start.result }));
        return;
      }

      for (let i = 0; i < 105; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        const job = await aiSeoApi.getLabScan(start.jobId);
        if (job.status === "queued") continue;
        if (job.status === "success") {
          const next = extractScores(job.result);
          setScores(next);
          if (!next) setError("Unlighthouse completed but did not return Lighthouse scores.");
          return;
        }
        setError(failureText(job));
        return;
      }

      setError("Timeout poll - job ket queue hoac CLI chay qua lau.");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Lab scan failed.");
    } finally {
      setLoading(false);
    }
  }, [allowLocal, seoProjectId, seoProjectPageId, targetUrl, websitePageId]);

  return (
    <div className={`rounded-lg border border-slate-200 p-3 dark:border-slate-800 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Lighthouse Lab</p>
          {scores?.targetUrl && (
            <p className="max-w-md truncate text-xs text-slate-500 dark:text-slate-400">
              {scores.targetUrl}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
          {loading ? "Scanning" : "Run Lab"}
        </button>
      </div>

      {scores && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Metric label="Perf" value={scores.performance} />
          <Metric label="SEO" value={scores.seo} />
          <Metric label="A11y" value={scores.accessibility} />
          <Metric label="BP" value={scores.bestPractices} />
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span className="text-slate-400">{label}</span>{" "}
      <strong>{value == null ? "-" : value}</strong>
    </div>
  );
}
