import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  publishLandingPageServer,
  unpublishLandingPageServer,
} from "@/features/landing-publish/services/landing-publish.service";
import { getBuilderSessionFromHeader } from "@/features/landing-builder/services/builder-session.server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  assertPageOwnedBy,
  requireLandingPageOwner,
} from "@/app/api/landing-pages/_ownership";

export const runtime = "nodejs";

const publishBodySchema = z.object({
  draftOverride: z.unknown().optional(),
  preserveHtml: z.boolean().optional(),
  domainId: z.string().uuid().optional(),
  path: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authorizePublish(request: NextRequest, pageId: string) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) {
    const session = getBuilderSessionFromHeader(request, pageId);
    if (!session) {
      return auth;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return {
        error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
      };
    }

    const { data: page } = await supabase
      .from("landing_pages")
      .select("id, user_id")
      .eq("id", pageId)
      .maybeSingle();

    const forbidden = assertPageOwnedBy(page, session.userId);
    if (forbidden) {
      return { error: forbidden };
    }

    return { ownerId: session.userId, supabase };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
    };
  }

  return { ownerId: auth.ownerId, supabase };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await authorizePublish(request, pageId);
  if ("error" in auth) {
    return auth.error;
  }

  const parsed = publishBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
  }

  try {
    const result = await publishLandingPageServer({
      supabase: auth.supabase,
      pageId,
      ownerId: auth.ownerId,
      body: parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Publish failed.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await authorizePublish(request, pageId);
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const result = await unpublishLandingPageServer({
      supabase: auth.supabase,
      pageId,
      ownerId: auth.ownerId,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Unpublish failed.";
    return NextResponse.json({ error: message }, { status });
  }
}