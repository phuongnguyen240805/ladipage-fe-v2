import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import { extractNestBearerToken } from "@/lib/platform-auth.server";

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

type AuthorizePublishResult =
  | { error: NextResponse; ownerId?: never; supabase?: never }
  | { ownerId: string; supabase: SupabaseClient; error?: never };

async function authorizePublish(
  request: NextRequest,
  pageId: string,
): Promise<AuthorizePublishResult> {
  const auth = await requireLandingPageOwner(request);

  // Prefer platform owner; fall back to builder-session for unauthenticated builder publish.
  let ownerId: string | null = null;
  if (!("error" in auth) && auth.ownerId) {
    ownerId = auth.ownerId;
  } else {
    const session = getBuilderSessionFromHeader(request, pageId);
    if (!session) {
      return {
        error:
          "error" in auth && auth.error
            ? auth.error
            : NextResponse.json({ error: "Unauthorized. Sign in required." }, { status: 401 }),
      };
    }

    const supabaseForOwnership = getSupabaseAdmin();
    if (!supabaseForOwnership) {
      return {
        error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
      };
    }

    const { data: page } = await supabaseForOwnership
      .from("landing_pages")
      .select("id, user_id")
      .eq("id", pageId)
      .maybeSingle();

    const forbidden = assertPageOwnedBy(page, session.userId);
    if (forbidden) {
      return { error: forbidden };
    }

    ownerId = session.userId;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
    };
  }

  return { ownerId, supabase };
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
    // Nest AI-SEO auto-ensure needs Nest JWT (uid + tenant), not Supabase-only token.
    const nestToken = extractNestBearerToken(request);
    if (!nestToken) {
      console.warn(
        `[publish] page=${pageId}: no Nest JWT — AI-SEO auto-sync will be skipped (login Nest workspace)`,
      );
    }
    const result = await publishLandingPageServer({
      supabase: auth.supabase,
      pageId,
      ownerId: auth.ownerId,
      body: parsed.data,
      authHeader: nestToken ? `Bearer ${nestToken}` : null,
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