import { describe, expect, it } from "vitest";
import {
  isFacebookAdsPath,
  isInstaticAssetPath,
  isPublicAuthPath,
  isPublicRoute,
} from "./constants";

describe("auth public routes", () => {
  it("treats signin/signup/error-404 as public auth paths", () => {
    expect(isPublicAuthPath("/signin")).toBe(true);
    expect(isPublicAuthPath("/signup")).toBe(true);
    expect(isPublicAuthPath("/error-404")).toBe(true);
    expect(isPublicAuthPath("/ban-hang")).toBe(false);
  });

  it("treats /p/, /templates/, /education/ as public runtime routes", () => {
    expect(isPublicRoute("/p/my-landing")).toBe(true);
    expect(isPublicRoute("/p")).toBe(true);
    expect(isPublicRoute("/templates/foo")).toBe(true);
    expect(isPublicRoute("/education/courses")).toBe(true);
    expect(isPublicRoute("/")).toBe(false);
    expect(isPublicRoute("/ban-hang")).toBe(false);
  });

  it("treats Instatic rewrite assets as public (no JWT redirect)", () => {
    expect(isInstaticAssetPath("/src/admin/main.tsx")).toBe(true);
    expect(isInstaticAssetPath("/@vite/client")).toBe(true);
    expect(isInstaticAssetPath("/runtime/react.js")).toBe(true);
    expect(isInstaticAssetPath("/admin/api/cms/me")).toBe(true);
    expect(isInstaticAssetPath("/node_modules/.vite/deps/react.js")).toBe(true);
    expect(isPublicRoute("/src/admin/layouts/AdminCanvasLayout/AdminCanvasEditorBody.tsx")).toBe(
      true,
    );
    expect(isInstaticAssetPath("/admin/site")).toBe(false);
    expect(isInstaticAssetPath("/landing-pages")).toBe(false);
  });

  it("detects facebook-ads paths", () => {
    expect(isFacebookAdsPath("/facebook-ads")).toBe(true);
    expect(isFacebookAdsPath("/facebook-ads/cai-dat")).toBe(true);
    expect(isFacebookAdsPath("/ban-hang")).toBe(false);
  });
});