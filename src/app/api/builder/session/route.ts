import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertCanEditLandingPage,
  createBuilderSessionToken,
} from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid builder session payload." }, { status: 400 });
  }

  const access = await assertCanEditLandingPage(request, parsed.data.pageId);
  if (access.error) {
    return NextResponse.json({ error: access.error.error }, { status: access.error.status });
  }

  const session = createBuilderSessionToken(parsed.data.pageId, access.user.id);
  const builderUrl = `/builder/${parsed.data.pageId}?session=${encodeURIComponent(session.token)}`;

  return NextResponse.json({
    builderUrl,
    token: session.token,
    expiresAt: session.expiresAt,
  });
}
