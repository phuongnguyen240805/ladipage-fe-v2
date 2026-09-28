import { describe, expect, it } from "vitest";
import { PRESET_AVATAR_IDS, presetAvatarValue, resolveAccountAvatar } from "./preset-avatars";

describe("resolveAccountAvatar", () => {
  it("reads a preset id and leaves photo URLs alone", () => {
    expect(resolveAccountAvatar("preset:kedi-04")).toEqual({ kind: "preset", id: "kedi-04" });
    expect(resolveAccountAvatar("  https://cdn.example/a.png  ")).toEqual({
      kind: "image",
      src: "https://cdn.example/a.png",
    });
    expect(resolveAccountAvatar("")).toEqual({ kind: "empty" });
    expect(resolveAccountAvatar("preset:unknown")).toEqual({ kind: "empty" });
  });

  it("keeps the same twelve ids the backend assigns", () => {
    expect(PRESET_AVATAR_IDS).toHaveLength(12);
    expect(presetAvatarValue("kedi-01")).toBe("preset:kedi-01");
    expect(presetAvatarValue("kedi-12")).toBe("preset:kedi-12");
  });
});
