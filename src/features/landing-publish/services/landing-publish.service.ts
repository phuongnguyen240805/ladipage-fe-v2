import type { SupabaseClient } from "@supabase/supabase-js";

import { applyDomainEdgePublishHook } from "@/features/landing-domain-edge/services/domain-edge-publish.hook";

import { applyAiSeoPublishHook } from "../hooks/ai-seo-publish.hook";
import { buildDraftPayload, resolveRendererFromPage } from "../renderers/renderer-registry";
import type {
  LandingPageRow,
  PublishLandingPageRequest,
  PublishResult,
  UnpublishResult,
} from "../types/publish.types";
import { createPublishVersionSnapshot } from "./publish-version.service";
import { triggerLandingRevalidate } from "./publish-revalidate.server";

const PAGE_SELECT =
  "id, user_id, name, slug, status, visibility, editor_data, published_html, published_at, render_engine, publish_version, published_meta, page_settings";

async function loadOwnedPage(
  supabase: SupabaseClient,
  pageId: string,
  ownerId: string,
): Promise<LandingPageRow | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.user_id !== ownerId) {
    return null;
  }

  return data as LandingPageRow;
}

async function syncWebsitePages(
  supabase: SupabaseClient,
  pageId: string,
  slug: string,
  status: "published" | "draft",
): Promise<void> {
  const now = new Date().toISOString();

  try {
    await supabase
      .from("website_pages")
      .update({
        status,
        published_url: status === "published" ? `/p/${slug}` : null,
        sync_status: "synced",
        last_synced_at: now,
        updated_at: now,
      })
      .eq("id", pageId);
  } catch (error) {
    console.warn("LandingPublishService: website_pages sync failed:", error);
  }
}

export async function publishLandingPageServer(input: {
  supabase: SupabaseClient;
  pageId: string;
  ownerId: string;
  body?: PublishLandingPageRequest;
}): Promise<PublishResult> {
  const page = await loadOwnedPage(input.supabase, input.pageId, input.ownerId);
  if (!page) {
    throw Object.assign(new Error("Landing page not found."), { status: 404 });
  }

  const editorData = input.body?.draftOverride ?? page.editor_data;
  const renderer = resolveRendererFromPage(page);
  const draft = buildDraftPayload({
    pageId: page.id,
    pageName: page.name,
    editorData,
    renderEngine: page.render_engine,
    preserveHtml: input.body?.preserveHtml,
  });

  if (!renderer.canHandle(draft)) {
    throw Object.assign(new Error("No renderer available for this page."), { status: 422 });
  }

  const artifact = await renderer.render(draft);
  const htmlWithSeo = await applyAiSeoPublishHook(input.supabase, page.id, artifact.html);

  const now = new Date().toISOString();
  const nextVersion = (page.publish_version ?? 0) + 1;

  const versionId = await createPublishVersionSnapshot({
    supabase: input.supabase,
    pageId: page.id,
    userId: input.ownerId,
    editorData,
    publishedHtml: htmlWithSeo,
    publishedMeta: artifact.meta,
    renderEngine: draft.renderEngine,
  });

  const updatePayload: Record<string, unknown> = {
    published_html: htmlWithSeo,
    published_meta: artifact.meta,
    publish_version: nextVersion,
    render_engine: draft.renderEngine,
    status: "published",
    visibility: "public",
    published_at: now,
    updated_at: now,
  };

  const { error: updateError } = await input.supabase
    .from("landing_pages")
    .update(updatePayload)
    .eq("id", page.id);

  if (updateError) {
    const missingColumn = updateError.message.toLowerCase().includes("column");
    if (missingColumn) {
      const { error: fallbackError } = await input.supabase
        .from("landing_pages")
        .update({
          published_html: htmlWithSeo,
          status: "published",
          visibility: "public",
          published_at: now,
          updated_at: now,
        })
        .eq("id", page.id);

      if (fallbackError) {
        throw Object.assign(new Error(fallbackError.message), { status: 500 });
      }
    } else {
      throw Object.assign(new Error(updateError.message), { status: 500 });
    }
  }

  await syncWebsitePages(input.supabase, page.id, page.slug, "published");
  await triggerLandingRevalidate(page.slug);

  const delivery = await applyDomainEdgePublishHook({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
    context: {
      domainId: input.body?.domainId,
      path: input.body?.path,
    },
  });

  const publicUrl = delivery.customPublicUrl ?? delivery.platformUrl;

  return {
    pageId: page.id,
    slug: page.slug,
    publicUrl,
    platformUrl: delivery.platformUrl,
    customPublicUrl: delivery.customPublicUrl,
    deliveryMode: delivery.deliveryMode,
    edgeSyncStatus: delivery.edgeSyncStatus,
    publishedAt: now,
    versionId,
    renderEngine: draft.renderEngine,
  };
}

export async function unpublishLandingPageServer(input: {
  supabase: SupabaseClient;
  pageId: string;
  ownerId: string;
}): Promise<UnpublishResult> {
  const page = await loadOwnedPage(input.supabase, input.pageId, input.ownerId);
  if (!page) {
    throw Object.assign(new Error("Landing page not found."), { status: 404 });
  }

  const now = new Date().toISOString();
  const { error } = await input.supabase
    .from("landing_pages")
    .update({
      status: "draft",
      visibility: "private",
      updated_at: now,
    })
    .eq("id", page.id);

  if (error) {
    throw Object.assign(new Error(error.message), { status: 500 });
  }

  await syncWebsitePages(input.supabase, page.id, page.slug, "draft");
  await triggerLandingRevalidate(page.slug);

  return {
    pageId: page.id,
    status: "draft",
    visibility: "private",
  };
}