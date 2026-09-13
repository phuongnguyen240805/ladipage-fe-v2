import { NextRequest, NextResponse } from "next/server";
import { rotateBackendSession } from "@/lib/backend/auth.server";
import { isSameOriginMutation } from "@/lib/backend/client.server";

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  const { response } = await rotateBackendSession(request);
  return response;
}
