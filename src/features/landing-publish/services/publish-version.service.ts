import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublishedMeta } from "../types/publish.types";

async function findVersionId(input: {
  supabase: SupabaseClient;
  pageId: string;
  versionName: string;
}): Promise<string | null> {
  const { data, error } = await input.supabase
    .from("landing_page_versions")
    .select("id")
    .eq("page_id", input.pageId)
    .eq("version_name", input.versionName)
    .maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

export async function createPublishVersionSnapshot(input: {
  supabase: SupabaseClient;
  pageId: string;
  userId: string;
  editorData: unknown;
  publishedHtml: string;
  publishedMeta: PublishedMeta;
  renderEngine: string;
  /** Deterministic for async retries, timestamped for legacy synchronous publish. */
  versionName?: string;
}): Promise<string | null> {
  const versionName = input.versionName ?? `publish-${new Date().toISOString()}`;

  if (input.versionName) {
    const existing = await findVersionId({
      supabase: input.supabase,
      pageId: input.pageId,
      versionName,
    });
    if (existing) return existing;
  }

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
    // Concurrent retry may win the deterministic async version insert.
    if (input.versionName) {
      const raced = await findVersionId({
        supabase: input.supabase,
        pageId: input.pageId,
        versionName,
      });
      if (raced) return raced;
    }

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
        if (input.versionName) {
          const raced = await findVersionId({
            supabase: input.supabase,
            pageId: input.pageId,
            versionName,
          });
          if (raced) return raced;
        }
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
