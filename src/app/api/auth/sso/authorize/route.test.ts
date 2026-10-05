import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { fetchBackend } from "@/lib/backend/client.server";
import { readBackendAccessToken } from "@/lib/backend/session.server";
import { GET } from "./route";

vi.mock("@/lib/backend/client.server", () => ({ fetchBackend: vi.fn() }));
vi.mock("@/lib/backend/session.server", () => ({ readBackendAccessToken: vi.fn() }));

const callback = "https://kedi.media/api/auth/sso/callback";
const state = "s".repeat(43);
const code = "c".repeat(43);

function request(overrides: Record<string, string> = {}) {
  const url = new URL("https://ladipage.example/api/auth/sso/authorize");
  url.search = new URLSearchParams({
    client_id: "kedipage", redirect_uri: callback, state,
    code_challenge: "p".repeat(43), code_challenge_method: "S256", ...overrides,
  }).toString();
  return new NextRequest(url, { headers: { cookie: "ladipage-session=source-token" } });
}

describe("Ladipage SSO authorization redirect", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SSO_KEDIPAGE_REDIRECT_URI", callback);
    vi.mocked(readBackendAccessToken).mockReturnValue("source-token");
    vi.mocked(fetchBackend).mockResolvedValue(new Response(JSON.stringify({ code, expiresIn: 60 }), { status: 200 }));
  });

  it("issues through the authenticated BFF and redirects only code and state", async () => {
    const response = await GET(request());
    expect(response.status).toBe(303);
    const target = new URL(response.headers.get("location")!);
    expect(target.origin + target.pathname).toBe(callback);
    expect(Object.fromEntries(target.searchParams)).toEqual({ code, state });
    expect(response.headers.get("cache-control")).toBe("no-store");
    const upstream = vi.mocked(fetchBackend).mock.calls[0][0];
    expect(upstream.method).toBe("POST");
    expect(upstream.headers.get("cookie")).toBe("ladipage-session=source-token");
    expect(await upstream.json()).toEqual({
      clientId: "kedipage", redirectUri: callback,
      codeChallenge: "p".repeat(43), codeChallengeMethod: "S256",
    });
  });

  it.each([
    { redirect_uri: "https://attacker.example/callback" },
    { client_id: "other" }, { state: "short" }, { code_challenge_method: "plain" },
  ])("rejects malformed authorization requests: %j", async overrides => {
    const response = await GET(request(overrides));
    expect(response.status).toBe(400);
    expect(response.headers.has("location")).toBe(false);
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it("rejects duplicated query fields", async () => {
    const input = request();
    const url = new URL(input.url);
    url.searchParams.append("state", state);
    expect((await GET(new NextRequest(url))).status).toBe(400);
  });

  it("returns login_required without forcing a login or issuing a code", async () => {
    vi.mocked(readBackendAccessToken).mockReturnValue(null);
    const response = await GET(request());
    const target = new URL(response.headers.get("location")!);
    expect(target.searchParams.get("error")).toBe("login_required");
    expect(target.searchParams.get("state")).toBe(state);
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it("handles an invalid source session and backend failure without leaking details", async () => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response("private-error", { status: 401 }));
    expect(new URL((await GET(request())).headers.get("location")!).searchParams.get("error")).toBe("login_required");
    vi.mocked(fetchBackend).mockRejectedValue(new Error("internal backend URL"));
    expect(new URL((await GET(request())).headers.get("location")!).searchParams.get("error")).toBe("sso_unavailable");
  });

  it("fails closed when SSO is unconfigured", async () => {
    vi.stubEnv("SSO_KEDIPAGE_REDIRECT_URI", "");
    expect((await GET(request())).status).toBe(503);
  });

  it.each([1101, "1101", 1105, "1105"])("handles the existing HTTP 200 login error envelope (%s)", async businessCode => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response(JSON.stringify({ code: businessCode, message: "private detail" }), { status: 200 }));
    const target = new URL((await GET(request())).headers.get("location")!);
    expect(target.searchParams.get("error")).toBe("login_required");
    expect(target.searchParams.has("code")).toBe(false);
  });
});
