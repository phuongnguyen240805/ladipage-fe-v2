import { describe, expect, it } from "vitest";
import {
  isFacebookAdsPath,
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

  it("detects facebook-ads paths", () => {
    expect(isFacebookAdsPath("/facebook-ads")).toBe(true);
    expect(isFacebookAdsPath("/facebook-ads/cai-dat")).toBe(true);
    expect(isFacebookAdsPath("/ban-hang")).toBe(false);
  });
});