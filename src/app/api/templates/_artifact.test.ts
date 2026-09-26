import { describe, expect, it } from "vitest";
import { isTemplateArtifactPath, resolveArtifactRequestUrls } from "./_artifact";

describe("template artifact paths", () => {
  it("accepts public Bedimcode artifact paths", () => {
    expect(
      isTemplateArtifactPath(
        "/template-artifacts/bedimcode/responsive-website-restaurant/editor-data.json",
      ),
    ).toBe(true);
  });

  it("rejects path traversal", () => {
    expect(isTemplateArtifactPath("/template-artifacts/../secret.json")).toBe(false);
    expect(isTemplateArtifactPath("/images/logo.png")).toBe(false);
  });

  it("prefers the CDN origin then the request origin", () => {
    const previous = process.env.NEXT_PUBLIC_CDN_BASE_URL;
    process.env.NEXT_PUBLIC_CDN_BASE_URL = "https://cdn.example";
    expect(
      resolveArtifactRequestUrls(
        "https://app.example",
        "/template-artifacts/bedimcode/responsive-website-restaurant/editor-data.json",
      ),
    ).toEqual([
      "https://cdn.example/template-artifacts/bedimcode/responsive-website-restaurant/editor-data.json",
      "https://app.example/template-artifacts/bedimcode/responsive-website-restaurant/editor-data.json",
    ]);
    process.env.NEXT_PUBLIC_CDN_BASE_URL = previous;
  });
});
