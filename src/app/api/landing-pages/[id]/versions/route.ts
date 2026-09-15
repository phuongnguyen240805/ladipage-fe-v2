import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import {
  getSupabaseAdmin,
  getSupabaseAdminConfigError,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createVersionSchema = z.object({
  editorData: z.record(z.string(), z.unknown()),
  versionName: z.string().trim().max(120).optional().default("Manual version"),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function authorizePage(request: NextRequest, pageId: string) {
  if (!UUID_PATTERN.test(pageId)) {
    return { error: jsonError("Invalid landing page id.") } as const;
  }

  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return { error: auth.error } as const;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error: jsonError(
        getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.",
        500,
      ),
    } as const;
  }

  const { data: page, error } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", auth.ownerId)
    .maybeSingle();
  if (error) return { error: jsonError(error.message, 500) } as const;
  if (!page) return { error: jsonError("Landing page not found.", 404) } as const;

  return { auth, supabase } as const;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const authorized = await authorizePage(request, pageId);
  if ("error" in authorized) return authorized.error;

  const { data, error } = await authorized.supabase
    .from("landing_page_versions")
    .select("id, page_id, editor_data, version_name, created_at")
    .eq("page_id", pageId)
    .eq("user_id", authorized.auth.ownerId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return jsonError(error.message, 500);

  const response = NextResponse.json({ versions: data ?? [] });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const authorized = await authorizePage(request, pageId);
  if ("error" in authorized) return authorized.error;

  const parsed = createVersionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return jsonError("Invalid landing page version payload.");

  const { data, error } = await authorized.supabase
    .from("landing_page_versions")
    .insert({
      page_id: pageId,
      user_id: authorized.auth.ownerId,
      editor_data: parsed.data.editorData,
      version_name: parsed.data.versionName,
    })
    .select("id, page_id, editor_data, version_name, created_at")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ version: data }, { status: 201 });
}
