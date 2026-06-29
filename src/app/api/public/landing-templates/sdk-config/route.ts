import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getPublicLandingTemplateByIdOrSlug,
  toTemplateSdkConfig,
} from "@/features/landing-templates/shared/public-template-service";

export const runtime = "nodejs";

const querySchema = z.object({
  templateId: z.string().uuid().optional(),
  slug: z.string().min(1).optional(),
}).refine((value) => value.templateId || value.slug, {
  message: "templateId or slug is required.",
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    templateId: searchParams.get("templateId") || undefined,
    slug: searchParams.get("slug") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template SDK config query." }, { status: 400 });
  }

  const template = await getPublicLandingTemplateByIdOrSlug(parsed.data);
  if (!template || (!template.preview_html && !template.published_html)) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json(toTemplateSdkConfig(template));
}
