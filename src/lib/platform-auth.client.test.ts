import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  platform: {
    nestToken: null as string | null,
    supabaseAccessToken: null as string | null,
  },
  platformStatus: "authenticated",
}));

const getSessionMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuthStore: {
    getState: () => authState,
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
    },
  },
}));

import { getPlatformAuthHeaders, getPlatformAuthToken } from "./platform-auth.client";

describe("platform auth client", () => {
  beforeEach(() => {
    authState.platform.nestToken = null;
    authState.platform.supabaseAccessToken = null;
    authState.platformStatus = "authenticated";
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue({ data: { session: null } });
  });

  it("keeps Supabase-first behavior by default", async () => {
    authState.platform.nestToken = "nest-token";
    authState.platform.supabaseAccessToken = "supabase-token";

    await expect(getPlatformAuthToken()).resolves.toBe("supabase-token");
  });

  it("uses the Nest token when builder ownership checks request it", async () => {
    authState.platform.nestToken = "nest-token";
    authState.platform.supabaseAccessToken = "supabase-token";

    await expect(getPlatformAuthToken({ preferNest: true })).resolves.toBe("nest-token");
  });

  it("passes the preferred token through Authorization headers", async () => {
    authState.platform.nestToken = "nest-token";
    authState.platform.supabaseAccessToken = "supabase-token";

    await expect(getPlatformAuthHeaders({ preferNest: true })).resolves.toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer nest-token",
    });
  });

  it("falls back to the Supabase SDK session when no stored token exists", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "sdk-supabase-token" } },
    });

    await expect(getPlatformAuthToken({ preferNest: true })).resolves.toBe(
      "sdk-supabase-token",
    );
  });
});
