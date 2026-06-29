import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "";

    // Generate a mock OAuth consent redirect URL pointing to our callback
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/api/ai-seo/integrations/google/gsc/callback?projectId=${projectId}`;

    return NextResponse.json({ url: callbackUrl });
  } catch (err: any) {
    console.error("GET GSC connect URL error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
