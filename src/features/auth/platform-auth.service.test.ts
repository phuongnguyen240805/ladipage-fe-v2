import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccountInfo, AccountMenus } from "@liora/api-types";

import { accountApi } from "@/lib/endpoints/account.api";
import { authApi } from "@/lib/endpoints/auth.api";
import { useAuthStore } from "./stores/auth.store";
import { PlatformAuthService } from "./services/platform-auth.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PlatformAuthService.validatePassword", () => {
  const service = new PlatformAuthService();

  it("accepts passwords matching BE rules", () => {
    expect(service.validatePassword("SmokeTest123!")).toBeNull();
    expect(service.validatePassword("Abcdef1")).toBeNull();
  });

  it("rejects passwords that are too short, lack digits, or exceed max length", () => {
    expect(service.validatePassword("Ab1")).not.toBeNull();
    expect(service.validatePassword("NoDigitsHere")).not.toBeNull();
    expect(service.validatePassword("A".repeat(17) + "1")).not.toBeNull();
  });
});

describe("PlatformAuthService.signUp", () => {
  it("posts the normalized registration payload to the backend", async () => {
    const service = new PlatformAuthService();
    const register = vi
      .spyOn(authApi, "register")
      .mockResolvedValue({ message: "Đăng ký thành công" });

    await expect(
      service.signUp("  owner@gmail.com  ", "Password1", "  Account Owner  "),
    ).resolves.toEqual({ message: "Đăng ký thành công" });

    expect(register).toHaveBeenCalledWith({
      username: "Account Owner",
      email: "owner@gmail.com",
      password: "Password1",
      lang: "VI",
    });
  });
});

describe("PlatformAuthService.loadAccountContext", () => {
  it("keeps profile and menus when permissions fail", async () => {
    const service = new PlatformAuthService();
    const profile = {
      username: "account-owner",
      nickname: "Account Owner",
      email: "owner@example.com",
    } as AccountInfo;
    const menus = [{ id: 1, path: "/", name: "Home" }] as AccountMenus[];

    useAuthStore.getState().setPlatformSession({
      profile: null,
      permissions: [],
      menus: [],
    });
    vi.spyOn(accountApi, "getProfile").mockResolvedValue(profile);
    vi.spyOn(accountApi, "getPermissions").mockRejectedValue(
      new Error("permission endpoint unavailable"),
    );
    vi.spyOn(accountApi, "getMenus").mockResolvedValue(menus);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await service.loadAccountContext();

    expect(useAuthStore.getState().platform.profile).toEqual(profile);
    expect(useAuthStore.getState().platform.menus).toEqual(menus);
    expect(useAuthStore.getState().platform.permissions).toEqual([]);
  });
});
