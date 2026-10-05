import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => { vi.unstubAllEnvs(); });

describe("SSO login bridge", () => {
  it("forwards successive storage signals only to the registered Kedi origin", async () => {
    vi.stubEnv("SSO_KEDIPAGE_REDIRECT_URI", "https://kedi.media/api/auth/sso/callback");
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors https://kedi.media");
    const script = (await response.text()).match(/<script>([\s\S]*?)<\/script>/)![1];
    const postMessage = vi.fn();
    let onStorage: (event: { key: string; newValue: string | null; oldValue: string | null }) => void;
    new Function("window", script)({ addEventListener: (_: string, handler: typeof onStorage) => { onStorage = handler; }, parent: { postMessage } });
    onStorage!({ key: "ladipage:sso-login", newValue: "login-one", oldValue: null });
    onStorage!({ key: "ladipage:sso-login", newValue: "login-two", oldValue: "login-one" });
    expect(postMessage.mock.calls).toEqual([
      [{ type: "ladipage:login-complete", loginId: "login-one" }, "https://kedi.media"],
      [{ type: "ladipage:login-complete", loginId: "login-two" }, "https://kedi.media"],
    ]);
    onStorage!({ key: "auth-token", newValue: "secret", oldValue: null });
    onStorage!({ key: "ladipage:sso-login", newValue: null, oldValue: "login-two" });
    onStorage!({ key: "ladipage:sso-login", newValue: "login-two", oldValue: "login-two" });
    expect(postMessage).toHaveBeenCalledTimes(2);
  });

  it.each(["", "https://other.example/wrong-path", "https://user:secret@kedi.media/api/auth/sso/callback", "http://kedi.media/api/auth/sso/callback"])("rejects invalid registration: %s", async callback => {
    vi.stubEnv("SSO_KEDIPAGE_REDIRECT_URI", callback);
    expect((await GET()).status).toBe(503);
  });
});
