import type { SupabaseClient } from "@supabase/supabase-js";

import { applyDomainEdgePublishHook } from "@/features/landing-domain-edge/services/domain-edge-publish.hook";
import { applyFreeSubdomainUnpublishHook } from "@/features/landing-domain-edge/services/free-subdomain-publish.hook";
import {
  buildPlatformLandingPath,
  pickPublicUrl,
} from "@/features/landing-domain-edge/services/free-subdomain.service";

import { applyAiSeoPublishHook } from "../hooks/ai-seo-publish.hook";
import { buildDraftPayload, resolveRendererFromPage } from "../renderers/renderer-registry";
import type {
  LandingPageRow,
  PublishLandingPageRequest,
  PublishResult,
  UnpublishResult,
} from "../types/publish.types";
import { syncNestAiSeoAfterPublish } from "./nest-ai-seo-publish.server";
import { createPublishVersionSnapshot } from "./publish-version.service";
import { triggerLandingRevalidate } from "./publish-revalidate.server";


/** Nest TransformInterceptor wraps as { code, data, message }. */
function unwrapNestJson(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as Record<string, unknown>;
  }
  return record;
}

function extractHtmlFromUnknown(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return null;
  const obj = data as { html?: unknown; publishedHtml?: unknown };
  if (typeof obj.html === "string" && obj.html.trim()) return obj.html.trim();
  if (typeof obj.publishedHtml === "string" && obj.publishedHtml.trim()) {
    return obj.publishedHtml.trim();
  }
  return null;
}

/** Visual-editor draft (blocks) is not an Instatic HTML artifact. */
function looksLikeVisualEditorDraft(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (extractHtmlFromUnknown(data)) return false;
  return (
    Array.isArray(obj.blocks) ||
    Array.isArray(obj.ROOT) ||
    typeof obj.pageName === "string" ||
    "content" in obj
  );
}

async function fetchInstaticArtifactHtml(pageId: string, authHeader: string | null): Promise<string | null> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api").replace(/\/$/, "");
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (authHeader) headers.Authorization = authHeader;
    const res = await fetch(`${base}/landing-cms/pages/${encodeURIComponent(pageId)}/artifact`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const raw: unknown = await res.json();
    const body = unwrapNestJson(raw);
    return typeof body.html === "string" && body.html.trim() ? body.html.trim() : null;
  } catch {
    return null;
  }
}

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
  /** Prefer publicUrl (subdomain/custom) when known; fallback platform path. */
  publishedUrl?: string | null,
): Promise<void> {
  const now = new Date().toISOString();
  const url =
    status === "published"
      ? publishedUrl?.trim() || buildPlatformLandingPath(slug)
      : null;

  try {
    await supabase
      .from("website_pages")
      .update({
        status,
        published_url: url,
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
  /** Optional Bearer for Nest landing-cms artifact fetch */
  authHeader?: string | null;
}): Promise<PublishResult> {
  const page = await loadOwnedPage(input.supabase, input.pageId, input.ownerId);
  if (!page) {
    throw Object.assign(new Error("Landing page not found."), { status: 404 });
  }

  let editorData = input.body?.draftOverride ?? page.editor_data;
  let engine =
    page.render_engine === "instatic" ? "instatic" : (page.render_engine ?? "visual-editor");

  if (engine === "instatic") {
    // Always prefer Nest Instatic artifact — do not skip when VisualEditor sends draftOverride
    // (draftOverride is block JSON, not HTML; old condition caused "missing HTML artifact").
    const artifactHtml = await fetchInstaticArtifactHtml(page.id, input.authHeader ?? null);
    if (artifactHtml) {
      editorData = artifactHtml;
    } else {
      const fromOverride = extractHtmlFromUnknown(input.body?.draftOverride);
      const fromStored = extractHtmlFromUnknown(page.editor_data);
      const fromPublished =
        typeof page.published_html === "string" && page.published_html.trim()
          ? page.published_html.trim()
          : null;

      if (fromOverride) {
        editorData = fromOverride;
      } else if (fromStored) {
        editorData = fromStored;
      } else if (fromPublished) {
        editorData = fromPublished;
      } else if (
        looksLikeVisualEditorDraft(input.body?.draftOverride) ||
        looksLikeVisualEditorDraft(page.editor_data)
      ) {
        // Page tagged instatic but content is Visual Editor draft — publish via visual-editor.
        engine = "visual-editor";
        editorData = input.body?.draftOverride ?? page.editor_data;
      } else {
        throw Object.assign(
          new Error(
            "Instatic renderer: missing HTML artifact. Open the Instatic editor and save once, " +
              "or ensure Nest landing-cms artifact is available (INSTATIC_MOCK / mapping).",
          ),
          { status: 422 },
        );
      }
    }
  }

  const renderer = resolveRendererFromPage({ render_engine: engine });
  const draft = buildDraftPayload({
    pageId: page.id,
    pageName: page.name,
    editorData,
    renderEngine: engine,
    preserveHtml: input.body?.preserveHtml ?? engine === "instatic",
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

  await triggerLandingRevalidate(page.slug);

  const delivery = await applyDomainEdgePublishHook({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
    html: htmlWithSeo,
    context: {
      domainId: input.body?.domainId,
      path: input.body?.path,
    },
  });

  const publicUrl = pickPublicUrl({
    customPublicUrl: delivery.customPublicUrl,
    subdomainUrl: delivery.subdomainUrl,
    platformUrl: delivery.platformUrl,
  });

  await syncWebsitePages(
    input.supabase,
    page.id,
    page.slug,
    "published",
    publicUrl,
  );

  // Nest: ensure SEO project + Umami + inject Liora/Umami scripts (fail-soft)
  const nestSync = await syncNestAiSeoAfterPublish({
    pageId: page.id,
    html: htmlWithSeo,
    publicUrl,
    name: page.name,
    slug: page.slug,
    authHeader: input.authHeader ?? null,
  });

  // If Nest injected tracking into HTML, persist best-effort (never fail publish)
  if (nestSync?.html && nestSync.html !== htmlWithSeo) {
    try {
      await input.supabase
        .from("landing_pages")
        .update({ published_html: nestSync.html, updated_at: new Date().toISOString() })
        .eq("id", page.id);
    } catch (error) {
      console.warn("LandingPublishService: failed to persist Nest AI-SEO HTML:", error);
    }
  }

  return {
    pageId: page.id,
    slug: page.slug,
    publicUrl,
    platformUrl: delivery.platformUrl,
    subdomainUrl: delivery.subdomainUrl,
    customPublicUrl: delivery.customPublicUrl,
    deliveryMode: delivery.deliveryMode,
    edgeSyncStatus: delivery.edgeSyncStatus,
    publishedAt: now,
    versionId,
    renderEngine: draft.renderEngine,
    aiSeo: nestSync
      ? {
          seoProjectId: nestSync.seoProjectId,
          seoSyncStatus: nestSync.seoSyncStatus,
          trafficSyncStatus: nestSync.trafficSyncStatus,
          autoLinked: nestSync.autoLinked,
          scriptsInjected: nestSync.scriptsInjected,
        }
      : null,
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

  await syncWebsitePages(input.supabase, page.id, page.slug, "draft", null);
  await triggerLandingRevalidate(page.slug);
  await applyFreeSubdomainUnpublishHook({ slug: page.slug, pageId: page.id });

  return {
    pageId: page.id,
    status: "draft",
    visibility: "private",
  };
}
