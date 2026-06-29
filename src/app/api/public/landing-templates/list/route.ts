import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listPublicLandingTemplates,
  toTemplateListItem,
} from "@/features/landing-templates/shared/public-template-service";

export const runtime = "nodejs";

const querySchema = z.object({
  category: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    category: searchParams.get("category") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template list query." }, { status: 400 });
  }

  const templates = await listPublicLandingTemplates(parsed.data);

  return NextResponse.json({
    items: templates
      .filter((template) => template.preview_html || template.published_html)
      .map(toTemplateListItem),
  });
}
