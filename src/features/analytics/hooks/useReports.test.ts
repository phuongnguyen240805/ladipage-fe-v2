import { describe, expect, it } from "vitest";
import { defaultReportRange } from "./useReports";

describe("defaultReportRange", () => {
  it("returns ISO date strings with from before to", () => {
    const range = defaultReportRange();
    expect(range.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.from <= range.to).toBe(true);
  });
});