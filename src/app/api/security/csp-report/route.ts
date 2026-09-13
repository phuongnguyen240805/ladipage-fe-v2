import { NextRequest, NextResponse } from "next/server";

const MAX_REPORT_BYTES = 32 * 1024;

function safeBlockedTarget(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  if (["inline", "eval", "data", "blob"].includes(value)) return value;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/**
 * Minimal Report-Only collector for Phase 3. It intentionally logs only
 * non-sensitive violation metadata; raw report bodies and full URLs are not
 * persisted. A metrics/log sink can replace this in the observability phase.
 */
export async function POST(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ message: "Invalid report origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const report = (
      parsed["csp-report"] && typeof parsed["csp-report"] === "object"
        ? parsed["csp-report"]
        : parsed.body && typeof parsed.body === "object"
          ? parsed.body
          : parsed
    ) as Record<string, unknown>;

    console.info("[CSP report-only]", {
      directive:
        report["effective-directive"] ??
        report.effectiveDirective ??
        report["violated-directive"],
      blocked: safeBlockedTarget(
        report["blocked-uri"] ?? report.blockedURL ?? report.blockedUri,
      ),
      disposition: report.disposition ?? "report",
    });
  } catch {
    // Invalid reports are ignored; this endpoint is never an application flow.
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
