import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { buildPlatformLandingPath } from "@/features/landing-domain-edge/services/free-subdomain.service";

export const runtime = "nodejs";

const bodySchema = z.object({
  slug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const secret = process.env.LANDING_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidate is not configured." }, { status: 503 });
  }

  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Internal Next.js route only — not the user-facing free-subdomain URL
  revalidatePath(buildPlatformLandingPath(parsed.data.slug));
  return NextResponse.json({ revalidated: true, slug: parsed.data.slug });
}