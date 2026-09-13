import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import { reissueBackendSession } from "@/lib/backend/auth.server";

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  return reissueBackendSession(request);
}
