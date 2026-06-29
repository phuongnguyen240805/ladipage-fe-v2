import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseHtmlToImportedPageSchema, parseHtmlToPreservedHtmlSchema } from "@/features/landing-pages/import/html-to-landing-schema";
import { getBuilderSessionFromHeader } from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  html: z.string().min(1),
  mode: z.enum(["preserve", "convert"]).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import payload." }, { status: 400 });
  }
  if (!getBuilderSessionFromHeader(request, parsed.data.pageId)) {
    return NextResponse.json({ error: "Invalid or expired builder session." }, { status: 401 });
  }

  const imported = parsed.data.mode === "convert"
    ? parseHtmlToImportedPageSchema(parsed.data.html)
    : parseHtmlToPreservedHtmlSchema(parsed.data.html);

  return NextResponse.json({ pageId: parsed.data.pageId, imported });
}
