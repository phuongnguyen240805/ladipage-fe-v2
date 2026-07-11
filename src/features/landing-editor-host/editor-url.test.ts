import { describe, expect, it } from "vitest";

import { resolveInstaticEditorUrl } from "./editor-url";
import type { EditorSessionResponse } from "./types";

const session = (over: Partial<EditorSessionResponse> = {}): EditorSessionResponse => ({
  pageId: "p1",
  editPath: "/landing-pages/p1/edit",
  cmsPath: "/_cms/admin/api/cms/auth/ladipage-sso?token=tok",
  editorUrl: "http://127.0.0.1:5174/admin/api/cms/auth/ladipage-sso?token=tok",
  sessionToken: "tok",
  expiresAt: "2026-01-01T00:00:00.000Z",
  engine: "instatic",
  ...over,
});

describe("resolveInstaticEditorUrl same-origin", () => {
  it("strips Instatic Vite port to relative /admin path", () => {
    expect(resolveInstaticEditorUrl(session())).toBe(
      "/admin/api/cms/auth/ladipage-sso?token=tok",
    );
  });

  it("keeps relative /admin editorUrl", () => {
    expect(
      resolveInstaticEditorUrl(
        session({ editorUrl: "/admin/api/cms/auth/ladipage-sso?token=abc" }),
      ),
    ).toBe("/admin/api/cms/auth/ladipage-sso?token=abc");
  });

  it("maps /_cms/admin to /admin", () => {
    expect(
      resolveInstaticEditorUrl(
        session({
          editorUrl: undefined,
          cmsPath: "/_cms/admin/api/cms/auth/ladipage-sso?token=x",
        }),
      ),
    ).toBe("/admin/api/cms/auth/ladipage-sso?token=x");
  });
});
