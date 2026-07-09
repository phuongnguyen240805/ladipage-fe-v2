import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublishedMeta } from "../types/publish.types";

export async function createPublishVersionSnapshot(input: {
  supabase: SupabaseClient;
  pageId: string;
  userId: string;
  editorData: unknown;
  publishedHtml: string;
  publishedMeta: PublishedMeta;
  renderEngine: string;
}): Promise<string | null> {
  const versionName = `publish-${new Date().toISOString()}`;

  const baseRow = {
    page_id: input.pageId,
    user_id: input.userId,
    editor_data: input.editorData,
    version_name: versionName,
    published_html: input.publishedHtml,
    published_meta: input.publishedMeta,
    render_engine: input.renderEngine,
  };

  const { data, error } = await input.supabase
    .from("landing_page_versions")
    .insert(baseRow)
    .select("id")
    .single();

  if (error) {
    const missingColumn = error.message.toLowerCase().includes("column");
    if (missingColumn) {
      const { data: fallbackData, error: fallbackError } = await input.supabase
        .from("landing_page_versions")
        .insert({
          page_id: input.pageId,
          user_id: input.userId,
          editor_data: input.editorData,
          version_name: versionName,
        })
        .select("id")
        .single();

      if (fallbackError) {
        console.warn("PublishVersionService: snapshot insert failed:", fallbackError.message);
        return null;
      }

      return fallbackData?.id ?? null;
    }

    console.warn("PublishVersionService: snapshot insert failed:", error.message);
    return null;
  }

  return data?.id ?? null;
}