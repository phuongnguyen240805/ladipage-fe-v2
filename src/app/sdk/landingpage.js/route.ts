import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const script = String.raw`
(function () {
  var currentScript = document.currentScript;
  if (!currentScript) return;

  var config = {
    pageId: currentScript.getAttribute("data-page-id") || "",
    slug: currentScript.getAttribute("data-slug") || "",
    target: currentScript.getAttribute("data-target") || "",
    storeId: currentScript.getAttribute("data-store-id") || "",
    script: currentScript
  };

  var key = [config.pageId, config.slug, config.storeId].filter(Boolean).join(":");
  window.__EasyManagerLandingLoaded = window.__EasyManagerLandingLoaded || {};
  if (key && window.__EasyManagerLandingLoaded[key]) return;
  if (key) window.__EasyManagerLandingLoaded[key] = true;

  window.__EasyManagerLandingQueue = window.__EasyManagerLandingQueue || [];
  window.__EasyManagerLandingQueue.push(config);

  if (!document.querySelector('script[data-easy-manager-runtime="landingpage"]')) {
    var runtime = document.createElement("script");
    runtime.async = true;
    runtime.src = "/sdk/landingpage-runtime.js";
    runtime.setAttribute("data-easy-manager-runtime", "landingpage");
    document.head.appendChild(runtime);
  }
})();`;

  return new NextResponse(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
