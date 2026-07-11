import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { extractBearerToken } from "@/lib/platform-auth.server";
import { normalizeEditorSessionPayload } from "@/features/landing-editor-host/session-payload";

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

  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
