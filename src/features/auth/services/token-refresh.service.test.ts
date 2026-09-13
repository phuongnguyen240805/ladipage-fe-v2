import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../stores/auth.store";
import { initialPlatformSession } from "../types";
import { backendSessionService } from "./backend-session.service";
import { TokenRefreshService } from "./token-refresh.service";

vi.mock("../utils/session-cookie", () => ({
  clearAllSessionCookies: vi.fn(),
  clearPlatformSessionCookies: vi.fn(),
}));

const SESSION = {
  authenticated: true,
  expiresAt: 4_102_444_800,
  tenant: { organizationId: "org-1", tenantId: 1 },
};

function resetPlatformSession(): void {
  useAuthStore.setState((state) => ({
    ...state,
    platform: {
      ...initialPlatformSession,
      sessionExpiresAt: 4_102_444_700,
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
      .spyOn(backendSessionService, "refreshSession")
      .mockResolvedValue(SESSION);
    const service = new TokenRefreshService();

    await expect(service.refreshSession()).resolves.toEqual(SESSION);
    expect(refresh).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().platform.sessionExpiresAt).toBe(SESSION.expiresAt);
    expect(useAuthStore.getState().platform.tenant).toEqual(SESSION.tenant);
  });

  it("collapses concurrent refreshes so one rotating refresh token is consumed once", async () => {
    let resolveRefresh!: (value: typeof SESSION) => void;
    const refresh = vi
      .spyOn(backendSessionService, "refreshSession")
      .mockReturnValue(new Promise((resolve) => {
        resolveRefresh = resolve;
      }));
    const service = new TokenRefreshService();

    const first = service.refreshSession();
    const second = service.refreshSession();

    expect(refresh).toHaveBeenCalledOnce();
    resolveRefresh(SESSION);
    await expect(Promise.all([first, second])).resolves.toEqual([SESSION, SESSION]);
  });

  it("propagates a missing or invalid backend refresh session", async () => {
    vi.spyOn(backendSessionService, "refreshSession").mockRejectedValue(
      new Error("No backend refresh session"),
    );
    const service = new TokenRefreshService();

    await expect(service.refreshSession()).rejects.toThrow(
      "No backend refresh session",
    );
  });
});
