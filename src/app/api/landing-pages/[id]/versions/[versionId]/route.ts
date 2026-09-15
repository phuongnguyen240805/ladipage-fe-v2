import { NextRequest, NextResponse } from "next/server";

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import {
  getSupabaseAdmin,
  getSupabaseAdminConfigError,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string; versionId: string }>;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: pageId, versionId } = await context.params;
  if (!UUID_PATTERN.test(pageId) || !UUID_PATTERN.test(versionId)) {
    return jsonError("Invalid landing page version id.");
  }

  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(
      getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.",
      500,
    );
  }

  const { data: page, error: pageError } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", auth.ownerId)
    .maybeSingle();
  if (pageError) return jsonError(pageError.message, 500);
  if (!page) return jsonError("Landing page not found.", 404);

  const { data, error } = await supabase
    .from("landing_page_versions")
    .select("id, page_id, editor_data, version_name, created_at")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .eq("user_id", auth.ownerId)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Landing page version not found.", 404);

  const response = NextResponse.json({ version: data });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
