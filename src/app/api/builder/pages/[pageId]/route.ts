import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseUserId } from "@/app/api/landing-pages/_auth";
import {
  getBuilderSessionFromHeader,
  getSupabaseAdmin,
  isValidBuilderPageId,
} from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

const patchSchema = z.object({
  editor_data: z.unknown(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "Invalid or expired builder session." }, { status: 401 });
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await props.params;
  if (!isValidBuilderPageId(pageId)) {
    return NextResponse.json({ error: "Invalid landing page id." }, { status: 400 });
  }
  if (!getBuilderSessionFromHeader(request, pageId)) return unauthorized();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, name, slug, status, visibility, editor_data, updated_at")
    .eq("id", pageId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });

  return NextResponse.json({ page: data });
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await props.params;
  if (!isValidBuilderPageId(pageId)) {
    return NextResponse.json({ error: "Invalid landing page id." }, { status: 400 });
  }

  const session = getBuilderSessionFromHeader(request, pageId);
  if (!session) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid save payload." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const now = new Date().toISOString();
  const patch = {
    editor_data: parsed.data.editor_data,
    ...(parsed.data.name ? { name: parsed.data.name } : {}),
    ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
    status: "draft" as const,
    updated_at: now,
  };

  const userId = isSupabaseUserId(session.userId) ? session.userId : null;

  const upsertPayload: Record<string, unknown> = {
    id: pageId,
    ...patch,
    name: parsed.data.name || "Untitled Page",
    slug: parsed.data.slug || `page-${pageId.slice(0, 8)}`,
    visibility: "private",
  };
  if (userId) {
    upsertPayload.user_id = userId;
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .upsert(upsertPayload, { onConflict: "id" })
    .select("id, name, slug, status, visibility, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ page: data, savedAt: now });
}