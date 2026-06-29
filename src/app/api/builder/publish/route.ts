import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderLandingPageHtml } from "@/components/landing-pages/editor/core/editor-export-html";
import type { EditorData } from "@/components/landing-pages/editor/types";
import {
  getBuilderSessionFromHeader,
  getSupabaseAdmin,
} from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  editorData: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
  }
  if (!getBuilderSessionFromHeader(request, parsed.data.pageId)) {
    return NextResponse.json({ error: "Invalid or expired builder session." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  const { data: page, error: loadError } = await supabase
    .from("landing_pages")
    .select("id, name, slug, editor_data")
    .eq("id", parsed.data.pageId)
    .maybeSingle();

  if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 });
  if (!page) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });

  const editorData = parsed.data.editorData ?? page.editor_data;
  const html = renderLandingPageHtml(editorData as EditorData);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("landing_pages")
    .update({
      published_html: html,
      published_at: now,
      status: "published",
      visibility: "public",
      updated_at: now,
    })
    .eq("id", parsed.data.pageId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({
    pageId: page.id,
    slug: page.slug,
    publicUrl: `/p/${page.slug}`,
    publishedAt: now,
  });
}
