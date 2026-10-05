import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { fetchBackend } from "@/lib/backend/client.server";
import { DELETE } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/backend/client.server", () => ({
  fetchBackend: vi.fn(),
  isSameOriginMutation: (request: NextRequest) => request.headers.get("origin") === request.nextUrl.origin,
}));

function request(token = "source-token", origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/auth/session", {
    method: "DELETE",
    headers: { origin, cookie: `ladipage-session=${token}; ladipage-nest-refresh=refresh-token` },
  });
}

describe("backend-owned logout", () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it("clears browser credentials only after confirmed backend revocation", async () => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response(JSON.stringify({ code: 200, data: null })));
    const response = await DELETE(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.cookies.get("ladipage-session")?.maxAge).toBe(0);
    expect(response.cookies.get("ladipage-nest-refresh")?.maxAge).toBe(0);
    expect(fetchBackend).toHaveBeenCalledWith(expect.any(NextRequest), "account/logout", expect.objectContaining({
      method: "POST", accessToken: "source-token",
    }));
  });

  it.each([
    { status: 500, payload: { code: 500 } },
    { status: 403, payload: { code: 403 } },
    { status: 200, payload: { code: 1007, message: "private backend detail" } },
    { status: 200, payload: null },
  ])("preserves cookies and reports failure for unconfirmed logout: %j", async ({ status, payload }) => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response(JSON.stringify(payload), { status }));
    const response = await DELETE(request());
    expect(response.status).toBe(503);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(await response.text()).not.toContain("private backend detail");
  });

  it("preserves cookies when the logout request times out or loses its connection", async () => {
    vi.mocked(fetchBackend).mockRejectedValue(new Error("private network detail"));
    const response = await DELETE(request());
    expect(response.status).toBe(503);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(await response.text()).not.toContain("private network detail");
  });

  it.each([1101, "1101", 1105, "1105"])("allows idempotent logout when the source session is already invalid: %s", async code => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response(JSON.stringify({ code })));
    expect((await DELETE(request())).cookies.get("ladipage-session")?.maxAge).toBe(0);
  });

  it("allows logout when the backend rejects an already unauthenticated source", async () => {
    vi.mocked(fetchBackend).mockResolvedValue(new Response("", { status: 401 }));
    expect((await DELETE(request())).status).toBe(200);
  });

  it("rejects cross-origin logout without contacting the backend", async () => {
    expect((await DELETE(request("source-token", "https://other.example"))).status).toBe(403);
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it("clears remaining cookies when no access session exists", async () => {
    expect((await DELETE(request(""))).status).toBe(200);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
});
