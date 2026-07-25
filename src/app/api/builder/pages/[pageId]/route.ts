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
  const session = getBuilderSessionFromHeader(request, pageId);
  if (!session || !isSupabaseUserId(session.userId)) return unauthorized();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, user_id, name, slug, status, visibility, editor_data, updated_at")
    .eq("id", pageId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
  if (data.user_id !== session.userId) {
    return NextResponse.json({ error: "Forbidden. You do not own this page." }, { status: 403 });
  }

  const { user_id: _userId, ...page } = data;
  return NextResponse.json({ page });
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
  if (!session || !isSupabaseUserId(session.userId)) return unauthorized();

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

  const userId = session.userId;

  const { data: existingPage, error: lookupError } = await supabase
    .from("landing_pages")
    .select("id, user_id")
    .eq("id", pageId)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (existingPage?.user_id && existingPage.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden. You do not own this page." }, { status: 403 });
  }

  const upsertPayload: Record<string, unknown> = {
    id: pageId,
    ...patch,
    name: parsed.data.name || "Untitled Page",
    slug: parsed.data.slug || `page-${pageId.slice(0, 8)}`,
    visibility: "private",
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("landing_pages")
    .upsert(upsertPayload, { onConflict: "id" })
    .select("id, name, slug, status, visibility, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ page: data, savedAt: now });
}
