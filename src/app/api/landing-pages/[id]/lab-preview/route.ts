import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  renderLandingPageArtifactForLab,
} from "@/features/landing-publish/services/landing-publish.service";
import {
  preparePublishedHtmlForDelivery,
} from "@/features/landing-publish/services/public-landing-html.server";
import type { LandingPageRow } from "@/features/landing-publish/types/publish.types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { extractNestBearerToken } from "@/lib/platform-auth.server";
import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";

export const runtime = "nodejs";

const PAGE_SELECT =
  "id, user_id, name, slug, status, visibility, editor_data, published_html, published_at, render_engine, publish_version, published_meta, page_settings";

const previewCache = new Map<string, { html: string; expiresAt: number }>();

interface RouteContext {
  params: Promise<{ id: string }>;
}

function secret(): string {
  return (
    process.env.LANDING_LAB_PREVIEW_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "local-lab-preview-secret"
  );
}

function sign(pageId: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${pageId}.${exp}`).digest("hex");
}

function verify(pageId: string, expRaw: string | null, sigRaw: string | null): boolean {
  if (!expRaw || !sigRaw) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(pageId, exp);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(sigRaw, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function prunePreviewCache(): void {
  const now = Date.now();
  for (const [key, value] of previewCache) {
    if (value.expiresAt <= now) previewCache.delete(key);
  }
}

function htmlHasPaintableContent(html: string): boolean {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  if (/<(?:img|video|canvas|svg|iframe|section|h1|h2|p|button|a|div)\b/i.test(stripped)) {
    return true;
  }

  return stripped.replace(/<[^>]+>/g, "").trim().length > 0;
}

async function loadPage(pageId: string, ownerId: string): Promise<LandingPageRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw Object.assign(new Error("Supabase server configuration is missing."), { status: 500 });
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .maybeSingle();

  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  if (!data || data.user_id !== ownerId) return null;
  return data as LandingPageRow;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  try {
    const page = await loadPage(pageId, auth.ownerId);
    if (!page) {
      return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
    }

    const nestToken = extractNestBearerToken(request);
    const artifact = await renderLandingPageArtifactForLab({
      page,
      authHeader: nestToken ? `Bearer ${nestToken}` : null,
    });
    const html = preparePublishedHtmlForDelivery(artifact.html, {
      pageId: page.id,
      assetBaseUrl: request.nextUrl.origin,
    });

    if (!htmlHasPaintableContent(html)) {
      return NextResponse.json(
        {
          error:
            "Lab preview has no paintable HTML. Save the page in Instatic or Visual Editor before scanning.",
        },
        { status: 422 },
      );
    }

    prunePreviewCache();
    const exp = Math.floor(Date.now() / 1000) + 30 * 60;
    const sig = sign(page.id, exp);
    previewCache.set(`${page.id}:${sig}`, {
      html,
      expiresAt: exp * 1000,
    });

    const previewUrl = new URL(
      `/api/landing-pages/${encodeURIComponent(page.id)}/lab-preview`,
      request.nextUrl.origin,
    );
    previewUrl.searchParams.set("exp", String(exp));
    previewUrl.searchParams.set("sig", sig);

    return NextResponse.json({
      previewUrl: previewUrl.toString(),
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Lab preview failed.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const exp = request.nextUrl.searchParams.get("exp");
  const sig = request.nextUrl.searchParams.get("sig");

  if (!verify(pageId, exp, sig)) {
    return NextResponse.json({ error: "Invalid or expired lab preview signature." }, { status: 401 });
  }

  prunePreviewCache();
  const cached = previewCache.get(`${pageId}:${sig}`);
  if (!cached) {
    return NextResponse.json({ error: "Lab preview expired. Start a new scan." }, { status: 410 });
  }

  return new NextResponse(cached.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
