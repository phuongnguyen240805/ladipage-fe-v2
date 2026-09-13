import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import { proxyAuthRoute } from "@/lib/backend/auth.server";

const ALLOWED_AUTH_ROUTES = new Set([
  "captcha/img",
  "login",
  "google",
  "google/register",
  "register",
]);
const SESSION_CREATING_ROUTES = new Set(["login", "google"]);

async function handle(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const { path } = await props.params;
  const route = path.join("/");
  if (!ALLOWED_AUTH_ROUTES.has(route)) {
    return NextResponse.json({ message: "Auth route not exposed" }, { status: 404 });
  }

  if (request.method === "GET" && route !== "captcha/img") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }
  if (request.method !== "GET" && route === "captcha/img") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  return proxyAuthRoute(request, `auth/${route}`, {
    captureSession: SESSION_CREATING_ROUTES.has(route),
  });
}

export const GET = handle;
export const POST = handle;
