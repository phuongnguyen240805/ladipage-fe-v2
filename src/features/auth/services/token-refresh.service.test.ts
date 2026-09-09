import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../stores/auth.store";
import { initialPlatformSession } from "../types";
import { backendSessionService } from "./backend-session.service";
import { TokenRefreshService } from "./token-refresh.service";

vi.mock("../utils/session-cookie", () => ({
  clearAllSessionCookies: vi.fn(),
  clearPlatformSessionCookies: vi.fn(),
  clearNestSessionCookie: vi.fn(),
  setNestSessionCookie: vi.fn(),
}));

const ACCESS_TOKEN =
  "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDAsIm9yZ2FuaXphdGlvbklkIjoib3JnLTEiLCJ0ZW5hbnRJZCI6MX0.x";

function resetPlatformSession(): void {
  useAuthStore.setState((state) => ({
    ...state,
    platform: {
      ...initialPlatformSession,
      nestToken: ACCESS_TOKEN,
    },
    platformStatus: "authenticated",
  }));
}

describe("TokenRefreshService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetPlatformSession();
  });

  it("refreshes through the HttpOnly backend-session bridge", async () => {
    const refresh = vi
      .spyOn(backendSessionService, "refreshAccessToken")
      .mockResolvedValue(ACCESS_TOKEN);
    const service = new TokenRefreshService();

    await expect(service.refreshNestToken()).resolves.toBe(ACCESS_TOKEN);
    expect(refresh).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().platform.nestToken).toBe(ACCESS_TOKEN);
  });

  it("collapses concurrent refreshes so one rotating refresh token is consumed once", async () => {
    let resolveRefresh!: (value: string) => void;
    const refresh = vi
      .spyOn(backendSessionService, "refreshAccessToken")
      .mockReturnValue(new Promise((resolve) => {
        resolveRefresh = resolve;
      }));
    const service = new TokenRefreshService();

    const first = service.refreshNestToken();
    const second = service.refreshNestToken();

    expect(refresh).toHaveBeenCalledOnce();
    resolveRefresh(ACCESS_TOKEN);
    await expect(Promise.all([first, second])).resolves.toEqual([
      ACCESS_TOKEN,
      ACCESS_TOKEN,
    ]);
  });

  it("propagates a missing or invalid backend refresh session", async () => {
    vi.spyOn(backendSessionService, "refreshAccessToken").mockRejectedValue(
      new Error("No backend refresh session"),
    );
    const service = new TokenRefreshService();

    await expect(service.refreshNestToken()).rejects.toThrow(
      "No backend refresh session",
    );
  });
});
