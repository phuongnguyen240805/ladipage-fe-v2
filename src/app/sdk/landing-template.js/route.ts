import { NextResponse } from "next/server";

export const runtime = "nodejs";

const script = `
(function () {
  var currentScript = document.currentScript;
  if (!currentScript) return;

  var queueName = "__EasyManagerTemplateQueue";
  window[queueName] = window[queueName] || [];

  var config = {
    templateId: currentScript.getAttribute("data-template-id") || "",
    slug: currentScript.getAttribute("data-template-slug") || "",
    target: currentScript.getAttribute("data-target") || "",
    mode: currentScript.getAttribute("data-mode") || "single",
    category: currentScript.getAttribute("data-category") || "",
    script: currentScript
  };

  var key = [config.mode, config.templateId, config.slug, config.category, config.target].join(":");
  window.__EasyManagerTemplateLoadedKeys = window.__EasyManagerTemplateLoadedKeys || {};
  if (window.__EasyManagerTemplateLoadedKeys[key]) return;
  window.__EasyManagerTemplateLoadedKeys[key] = true;

  window[queueName].push(config);

  if (!document.getElementById("easy-manager-landing-template-runtime")) {
    var runtimeScript = document.createElement("script");
    runtimeScript.id = "easy-manager-landing-template-runtime";
    runtimeScript.src = "/sdk/landing-template-runtime.js";
    runtimeScript.async = true;
    document.head.appendChild(runtimeScript);
  } else if (window.EasyManagerTemplateRuntime && window.EasyManagerTemplateRuntime.processQueue) {
    window.EasyManagerTemplateRuntime.processQueue();
  }
})();
`;

export async function GET() {
  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
