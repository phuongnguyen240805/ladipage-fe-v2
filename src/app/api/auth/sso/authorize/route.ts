import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/backend/client.server";
import { readBackendAccessToken } from "@/lib/backend/session.server";
import { registeredKediCallback } from "@/lib/backend/sso.server";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function GET(request: NextRequest) {
  const registration = registeredKediCallback();
  if (!registration) {
    return NextResponse.json({ error: "sso_not_configured" }, { status: 503, headers: RESPONSE_HEADERS });
  }
  const { callback, target } = registration;

  const query = request.nextUrl.searchParams;
  const keys = ["client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method"];
  const state = query.get("state") ?? "";
  const challenge = query.get("code_challenge") ?? "";
  if (keys.some((key) => query.getAll(key).length !== 1)
    || query.get("client_id") !== "kedipage" || query.get("redirect_uri") !== callback
    || query.get("code_challenge_method") !== "S256"
    || !/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: RESPONSE_HEADERS });
  }

  target.searchParams.set("state", state);
  const redirectError = (error: string) => {
    target.searchParams.set("error", error);
    return NextResponse.redirect(target, { status: 303, headers: RESPONSE_HEADERS });
  };
  if (!readBackendAccessToken(request)) return redirectError("login_required");

  try {
    const upstreamRequest = new NextRequest(request.url, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "", "content-type": "application/json" },
      body: JSON.stringify({
        clientId: "kedipage", redirectUri: callback,
        codeChallenge: challenge, codeChallengeMethod: "S256",
      }),
    });
    const upstream = await fetchBackend(upstreamRequest, "sso/code", { search: "", timeoutMs: 10_000 });
    if (!upstream.ok) return redirectError(upstream.status === 401 ? "login_required" : "sso_unavailable");
    const result: unknown = await upstream.json();
    const code = result && typeof result === "object" && "code" in result ? result.code : null;
    // The existing JWT guard reports invalid/replaced logins as business codes
    // inside an HTTP 200 response. Preserve the same outcome as an HTTP 401.
    if (code === 1101 || code === "1101" || code === 1105 || code === "1105") return redirectError("login_required");
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(code)) return redirectError("sso_unavailable");
    target.searchParams.set("code", code);
    return NextResponse.redirect(target, { status: 303, headers: RESPONSE_HEADERS });
  } catch {
    return redirectError("sso_unavailable");
  }
}
