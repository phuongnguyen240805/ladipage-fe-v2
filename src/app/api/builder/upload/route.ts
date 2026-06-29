import { NextRequest, NextResponse } from "next/server";
import {
  getBuilderSessionFromHeader,
  isValidBuilderPageId,
} from "@/features/landing-builder/services/builder-session.server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const pageId = String(formData.get("pageId") || "");

  if (!isValidBuilderPageId(pageId)) {
    return NextResponse.json({ error: "Invalid pageId." }, { status: 400 });
  }

  const session = getBuilderSessionFromHeader(request, pageId);
  if (!session) {
    return NextResponse.json({ error: "Invalid builder session." }, { status: 401 });
  }

  return NextResponse.json({
    pageId,
    status: "queued",
    message: "Builder upload endpoint is reserved for the existing Supabase storage flow.",
  });
}
