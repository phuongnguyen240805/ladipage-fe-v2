import { describe, expect, it } from "vitest";

import { normalizeEditorSessionPayload } from "./session-payload";

describe("normalizeEditorSessionPayload", () => {
  it("unwraps Nest TransformInterceptor envelope { code, data }", () => {
    const session = normalizeEditorSessionPayload({
      code: 200,
      message: "success",
      data: {
        pageId: "abc",
        editPath: "/landing-pages/abc/edit",
        cmsPath: "/_cms/admin/site?page=p1",
        sessionToken: "tok",
        expiresAt: "2026-01-01T00:00:00.000Z",
        engine: "instatic",
      },
    });

    expect(session.editPath).toBe("/landing-pages/abc/edit");
    expect(session.pageId).toBe("abc");
    expect(session.cmsPath).toContain("/_cms");
  });

  it("accepts flat payload", () => {
    const session = normalizeEditorSessionPayload({
      pageId: "x",
      editPath: "/landing-pages/x/edit",
      cmsPath: "/_cms/a",
      sessionToken: "t",
      expiresAt: "2026-01-01T00:00:00.000Z",
      engine: "instatic",
    });
    expect(session.editPath).toBe("/landing-pages/x/edit");
  });

  it("falls back editPath when missing so URL is never undefined", () => {
    const session = normalizeEditorSessionPayload(
      { code: 200, data: { pageId: "p1", cmsPath: "/_cms", sessionToken: "t" } },
      "p1",
    );
    expect(session.editPath).toBe("/landing-pages/p1/edit");
    expect(session.editPath).not.toContain("undefined");
  });
});
