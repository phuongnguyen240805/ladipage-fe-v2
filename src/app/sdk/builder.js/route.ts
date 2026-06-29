import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const script = String.raw`
(function () {
  window.EasyManagerBuilder = window.EasyManagerBuilder || {};
  window.EasyManagerBuilder.open = function (options) {
    options = options || {};
    if (!options.pageId) return Promise.reject(new Error("pageId is required"));
    return fetch("/api/builder/session", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pageId: options.pageId })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Cannot create builder session");
        return res.json();
      })
      .then(function (session) {
        window.open(session.builderUrl, "_blank", "noopener,noreferrer");
      });
  };
})();`;

  return new NextResponse(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
