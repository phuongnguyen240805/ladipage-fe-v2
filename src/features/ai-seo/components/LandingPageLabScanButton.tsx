"use client";

import { useCallback, useRef, useState } from "react";
import { Gauge, Loader2 } from "lucide-react";

import { aiSeoApi } from "@/lib/endpoints/ai-seo.api";
import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";

import { isAiSeoNestApi } from "../utils/ai-seo-api-mode";

type LabChip = {
  performance: number | null;
  seo: number | null;
  lcpMs: number | null;
  mock?: boolean;
};

interface LandingPageLabScanButtonProps {
  websitePageId: string;
  slug?: string | null;
  targetUrl?: string | null;
  published?: boolean;
  className?: string;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getNestedRecord(source: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractLab(result: Record<string, unknown> | undefined): LabChip | null {
  if (!result) return null;
  const lighthouse = getNestedRecord(result, "lighthouse");
  const pages = lighthouse?.pages;
  const firstPage =
    Array.isArray(pages) && pages[0] && typeof pages[0] === "object"
      ? (pages[0] as Record<string, unknown>)
      : null;
  const scores =
    getNestedRecord(result, "scores") ??
    (firstPage ? getNestedRecord(firstPage, "scores") : null);
  const metrics =
    getNestedRecord(result, "metrics") ??
    (firstPage ? getNestedRecord(firstPage, "metrics") : null);
  const lcp = metrics ? getNestedRecord(metrics, "largestContentfulPaint") : null;
  const performance = scores ? readNumber(scores.performance) : null;
  const seo = scores ? readNumber(scores.seo) : null;
  const lcpMs = lcp ? readNumber(lcp.numericValue) : null;
  if (performance == null && seo == null && lcpMs == null) return null;
  return {
    performance,
    seo,
    lcpMs,
    mock: result.mock === true || lighthouse?.mock === true,
  };
}

function noScoreMessage(result: Record<string, unknown> | undefined): string {
  const error = typeof result?.error === "string" ? result.error : "";
  const hint = typeof result?.hint === "string" ? result.hint : "";
  const combined = `${error} ${hint}`.toLowerCase();
  if (combined.includes("no_fcp") || combined.includes("did not paint")) {
    return "Preview tra HTTP 2xx nhung Lighthouse khong thay First Contentful Paint (NO_FCP). Kiem tra Instatic artifact/fallback HTML.";
  }
  if (combined.includes("no_lighthouse_scores")) {
    return "Unlighthouse chay xong nhung report khong co Lighthouse scores. Bat UNLIGHTHOUSE_DEBUG_KEEP_REPORT=true de xem lighthouse.json.";
  }
  return error || hint || "Lab scan failed.";
}

function isLocalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return false;
  }
}

function normalizeLocalUrlToCurrentOrigin(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    const target = new URL(url);
    const current = new URL(window.location.origin);
    const host = target.hostname.toLowerCase();
    const currentHost = current.hostname.toLowerCase();
    const local =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      currentHost === "localhost" ||
      currentHost === "127.0.0.1";
    if (!local) return url;
    target.protocol = current.protocol;
    target.hostname = current.hostname;
    target.port = current.port;
    return target.toString();
  } catch {
    return url;
  }
}

async function createLabPreviewUrl(pageId: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });
  const response = await fetch(`/api/landing-pages/${encodeURIComponent(pageId)}/lab-preview`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders,
    },
    credentials: "include",
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => null)) as { previewUrl?: unknown } | null;
  return typeof body?.previewUrl === "string" ? body.previewUrl : null;
}

function resolveScanTargetUrl(input: {
  slug?: string | null;
  targetUrl?: string | null;
  published?: boolean;
}): string {
  const candidate = input.targetUrl?.trim();
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return normalizeLocalUrlToCurrentOrigin(candidate);
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const slug = input.slug?.trim();
  return slug ? `${origin.replace(/\/$/, "")}/p/${encodeURIComponent(slug)}` : `${origin}/`;
}

export function LandingPageLabScanButton({
  websitePageId,
  slug,
  targetUrl,
  published,
  className,
}: LandingPageLabScanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [lab, setLab] = useState<LabChip | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  const startLabScan = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      let scanUrl = resolveScanTargetUrl({ slug, targetUrl, published });
      if (!published) {
        const previewUrl = await createLabPreviewUrl(websitePageId);
        if (previewUrl) scanUrl = previewUrl;
      }

      const start = await aiSeoApi.startLabScan({
        websitePageId,
        targetUrl: scanUrl,
        trigger: "list",
        depth: "quick",
        allowLocal: isLocalUrl(scanUrl),
      });

      if (start.status === "success") {
        const nextLab = extractLab(start.result);
        setLab(nextLab);
        setStatus(nextLab ? "success" : "failed");
        setMessage(nextLab ? null : noScoreMessage(start.result));
        return;
      }

      if (start.status === "failed") {
        setStatus("failed");
        setMessage(noScoreMessage(start.result));
        return;
      }

      for (let i = 0; i < 105; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        const job = await aiSeoApi.getLabScan(start.jobId);
        if (job.status === "queued") continue;

        if (job.status === "success") {
          const nextLab = extractLab(job.result);
          setLab(nextLab);
          setStatus(nextLab ? "success" : "failed");
          setMessage(nextLab ? null : noScoreMessage(job.result));
          return;
        }

        setStatus("failed");
        setMessage(noScoreMessage(job.result ?? { error: job.error, hint: job.hint }));
        return;
      }

      setStatus("failed");
      setMessage(
        "Timeout poll - job ket queue hoac CLI chay qua lau. Restart Nest de ap dung inline hoac bat serve-worker.",
      );
    } catch (error) {
      setStatus("failed");
      setMessage(error instanceof Error ? error.message : "Lab scan failed.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [published, slug, targetUrl, websitePageId]);

  if (!isAiSeoNestApi()) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <button
        type="button"
        onClick={startLabScan}
        disabled={loading}
        title="Run Lighthouse lab scan"
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-200/70 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-900/40"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
        <span>{loading ? "Scanning" : "Lab"}</span>
      </button>

      {lab && (
        <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold">
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            P {lab.performance ?? "-"}
          </span>
          <span className="rounded bg-lime-50 px-1.5 py-0.5 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300">
            SEO {lab.seo ?? "-"}
          </span>
          {lab.lcpMs != null && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              LCP {Math.round(lab.lcpMs)}ms
            </span>
          )}
          {lab.mock && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              mock
            </span>
          )}
        </div>
      )}

      {status === "failed" && message && (
        <p className="max-w-[180px] text-center text-[10px] leading-snug text-red-600 dark:text-red-300">
          {message}
        </p>
      )}
    </div>
  );
}
