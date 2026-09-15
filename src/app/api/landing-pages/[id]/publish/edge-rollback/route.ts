import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import { activateDomainEdgeArtifactVersion } from "@/features/landing-domain-edge/services/domain-edge-publish.hook";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const bodySchema = z.object({ version: z.number().int().positive() });

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Operational rollback endpoint: pointer switch only. It never mutates editor
 * content or publish_version; R2 verifies the immutable target artifact exists.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rollback version." }, { status: 400 });
  }

  const { id: pageId } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const { data: page, error } = await supabase
    .from("landing_pages")
    .select("id, user_id, slug, publish_version, status")
    .eq("id", pageId)
    .eq("user_id", auth.ownerId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!page) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
  if (page.status !== "published") {
    return NextResponse.json({ error: "Only a published page can switch edge versions." }, { status: 409 });
  }
  const currentVersion = Number(page.publish_version ?? 0);
  if (parsed.data.version > currentVersion) {
    return NextResponse.json({ error: "Rollback version is newer than the published version." }, { status: 409 });
  }

  const result = await activateDomainEdgeArtifactVersion({
    supabase,
    ownerId: auth.ownerId,
    pageId,
    slug: page.slug,
    version: parsed.data.version,
  });
  if (result.edgeSyncStatus === "error") {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }
  if (result.edgeSyncStatus === "pending") {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }

  return NextResponse.json(
    { pageId, version: parsed.data.version, edgeSyncStatus: result.edgeSyncStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
