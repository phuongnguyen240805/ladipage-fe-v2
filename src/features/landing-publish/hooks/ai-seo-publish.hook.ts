import type { SupabaseClient } from "@supabase/supabase-js";

export const OTTO_SEO_SDK_BASE = "https://api.otto-seo.com/sdk";

export function buildOttoSeoScriptTag(aiSeoProjectId: string): string {
  return `<script async src="${OTTO_SEO_SDK_BASE}/${aiSeoProjectId}.js"></script>`;
}

export function injectOttoSeoScript(html: string, aiSeoProjectId: string): string {
  const scriptTag = buildOttoSeoScriptTag(aiSeoProjectId);
  if (html.includes(scriptTag)) {
    return html;
  }
  if (html.includes("</head>")) {
    return html.replace("</head>", `${scriptTag}</head>`);
  }
  return `${html}${scriptTag}`;
}

export async function applyAiSeoPublishHook(
  supabase: SupabaseClient,
  pageId: string,
  html: string,
): Promise<string> {
  try {
    const { data: connectedPage } = await supabase
      .from("ai_seo_project_pages")
      .select("ai_seo_project_id")
      .eq("website_page_id", pageId)
      .maybeSingle();

    if (!connectedPage?.ai_seo_project_id) {
      return html;
    }

    return injectOttoSeoScript(html, connectedPage.ai_seo_project_id);
  } catch (error) {
    console.warn("AiSeoPublishHook: failed to resolve linked SEO project:", error);
    return html;
  }
}