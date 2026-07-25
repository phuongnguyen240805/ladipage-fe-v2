import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { assertPageOwnedBy, requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import { normalizeEditorSessionPayload } from "@/features/landing-editor-host/session-payload";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { extractNestBearerToken } from "@/lib/platform-auth.server";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().min(1),
});

function nestBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api").replace(/\/$/, "");
}

/**
 * Proxy Nest landing-cms/session and unwrap { code, data } so the browser
 * always receives a flat EditorSessionResponse (avoids /undefined navigations).
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "pageId is required." }, { status: 400 });
  }

  const token = extractNestBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: getSupabaseAdminConfigError() ?? "Supabase server configuration is missing." },
      { status: 500 },
    );
  }

  const { data: page, error: pageError } = await supabase
    .from("landing_pages")
    .select("id, user_id")
    .eq("id", parsed.data.pageId)
    .maybeSingle();

  if (pageError) {
    return NextResponse.json({ error: pageError.message }, { status: 500 });
  }
  if (!page) {
    return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
  }

  const ownershipError = assertPageOwnedBy(page, auth.ownerId);
  if (ownershipError) return ownershipError;

  const upstream = await fetch(`${nestBaseUrl()}/landing-cms/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pageId: parsed.data.pageId }),
    cache: "no-store",
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload?.message || payload?.error || "Landing CMS session failed." },
      { status: upstream.status },
    );
  }

  try {
    const session = normalizeEditorSessionPayload(payload, parsed.data.pageId);
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid landing-cms session payload from Nest.",
      },
      { status: 502 },
    );
  }
}
