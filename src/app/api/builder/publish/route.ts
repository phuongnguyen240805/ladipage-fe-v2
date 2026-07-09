import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { publishLandingPageServer } from "@/features/landing-publish/services/landing-publish.service";
import {
  getBuilderSessionFromHeader,
  getSupabaseAdmin,
} from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  editorData: z.unknown().optional(),
  preserveHtml: z.boolean().optional(),
});

/** @deprecated Use POST /api/landing-pages/:id/publish — kept for dual-run rollback */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
  }

  const session = getBuilderSessionFromHeader(request, parsed.data.pageId);
  if (!session) {
    return NextResponse.json({ error: "Invalid or expired builder session." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
  }

  try {
    const result = await publishLandingPageServer({
      supabase,
      pageId: parsed.data.pageId,
      ownerId: session.userId,
      body: {
        draftOverride: parsed.data.editorData,
        preserveHtml: parsed.data.preserveHtml,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Publish failed.";
    return NextResponse.json({ error: message }, { status });
  }
}