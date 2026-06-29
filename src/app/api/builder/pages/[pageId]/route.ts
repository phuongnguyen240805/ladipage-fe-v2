import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
  if (!getBuilderSessionFromHeader(request, pageId)) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid save payload." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("landing_pages")
    .update({
      editor_data: parsed.data.editor_data,
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
      status: "draft",
      updated_at: now,
    })
    .eq("id", pageId)
    .select("id, name, slug, status, visibility, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ page: data, savedAt: now });
}
