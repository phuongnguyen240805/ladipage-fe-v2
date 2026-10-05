import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyKediLogin } from "./kedi-login-notification";

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("Kedi login notification", () => {
  it("notifies successive logins from independent tabs without retaining an opener", async () => {
    const originalOpener = window.opener;
    window.opener = null;
    try {
      await notifyKediLogin();
      const first = localStorage.getItem("ladipage:sso-login");
      await notifyKediLogin();
      const second = localStorage.getItem("ladipage:sso-login");
      expect(first).toMatch(/^[a-f0-9-]{36}$/i);
      expect(second).not.toBe(first);
      expect(window.opener).toBeNull();
      expect(localStorage.length).toBe(1);
    } finally { window.opener = originalOpener; }
  });

  it("does not interrupt login when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    await expect(notifyKediLogin()).resolves.toBeUndefined();
  });
});
