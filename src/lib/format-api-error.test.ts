import { describe, expect, it } from "vitest";
import { formatApiErrorBody } from "./format-api-error";

describe("formatApiErrorBody", () => {
  it("returns nested error messages instead of [object Object]", () => {
    expect(
      formatApiErrorBody({ error: { message: "Landing page not found." } }, "fallback"),
    ).toBe("Landing page not found.");
  });

  it("returns string error fields", () => {
    expect(formatApiErrorBody({ error: "Invalid save payload." }, "fallback")).toBe(
      "Invalid save payload.",
    );
  });

  it("falls back when payload is empty", () => {
    expect(formatApiErrorBody(null, "Cannot save builder draft (404).")).toBe(
      "Cannot save builder draft (404).",
    );
  });
});