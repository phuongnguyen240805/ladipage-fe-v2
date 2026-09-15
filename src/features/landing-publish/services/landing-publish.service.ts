import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyDomainEdgePublishHook,
  removeDomainEdgeRoutesForPublishedPage,
  resolveDomainEdgePublicUrlsForPage,
  syncDomainEdgeArtifactForPublishedPage,
} from "@/features/landing-domain-edge/services/domain-edge-publish.hook";
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
  RenderEngine,
  UnpublishResult,
} from "../types/publish.types";
import { syncNestAiSeoAfterPublish } from "./nest-ai-seo-publish.server";
import { createPublishVersionSnapshot } from "./publish-version.service";
import { triggerLandingRevalidate } from "./publish-revalidate.server";
import {
  ensureFullHtmlDocument,
  preparePublishedHtmlForDelivery,
} from "./public-landing-html.server";


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
    Array.isArray(obj.sections) ||
    Array.isArray(obj.ROOT) ||
    typeof obj.pageName === "string" ||
    "content" in obj
  );
}

function hasVisualEditorContent(data: unknown): boolean {
  if (!looksLikeVisualEditorDraft(data)) return false;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.sections)) return obj.sections.length > 0;
  if (Array.isArray(obj.blocks)) return obj.blocks.length > 0;
  if (Array.isArray(obj.ROOT)) return obj.ROOT.length > 0;
  const content = obj.content;
  if (typeof content === "string") return content.trim().length > 0;
  if (content && typeof content === "object") return Object.keys(content).length > 0;
  return false;
}

async function fetchInstaticArtifactHtml(pageId: string, authHeader: string | null): Promise<string | null> {
  const base = (process.env.NEST_INTERNAL_URL ?? process.env.LADIPAGE_BACKEND_API_URL ?? "http://localhost:7002/api").replace(/\/$/, "");
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

export async function renderLandingPageArtifactForLab(input: {
  page: LandingPageRow;
  authHeader?: string | null;
}): Promise<{ html: string; renderEngine: string }> {
  const page = input.page;
  let editorData = page.editor_data;
  let engine =
    page.render_engine === "instatic" ? "instatic" : (page.render_engine ?? "visual-editor");

  if (engine === "instatic") {
    const artifactHtml = await fetchInstaticArtifactHtml(page.id, input.authHeader ?? null);
    if (artifactHtml) {
      editorData = artifactHtml;
    } else {
      const fromStored = extractHtmlFromUnknown(page.editor_data);
      const fromPublished =
        typeof page.published_html === "string" && page.published_html.trim()
          ? page.published_html.trim()
          : null;
      const visualDraft = hasVisualEditorContent(page.editor_data);

      if (fromStored) {
        editorData = fromStored;
      } else if (visualDraft) {
        engine = "visual-editor";
        editorData = page.editor_data;
      } else if (fromPublished) {
        editorData = fromPublished;
      } else {
        throw Object.assign(
          new Error(
            "Instatic renderer: missing HTML artifact. Open the Instatic editor and save once, or ensure artifact mapping is available.",
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
    preserveHtml: engine === "instatic",
  });

  if (renderer.canHandle(draft)) {
    const artifact = await renderer.render(draft);
    return {
      html: ensureFullHtmlDocument(artifact.html),
      renderEngine: draft.renderEngine,
    };
  }

  const publishedHtml =
    typeof page.published_html === "string" && page.published_html.trim()
      ? page.published_html.trim()
      : null;
  if (publishedHtml) {
    return {
      html: ensureFullHtmlDocument(publishedHtml),
      renderEngine: engine,
    };
  }

  throw Object.assign(new Error("No renderer available for this page."), { status: 422 });
}

interface AsyncPublishState {
  publishVersion: number;
  lastPublishJobId: string | null;
  lastPublishJobSequence: number;
}

function normalizeRenderEngine(value: string | null | undefined): RenderEngine {
  if (value === "puck" || value === "instatic") return value;
  return "visual-editor";
}

async function loadAsyncPublishState(input: {
  supabase: SupabaseClient;
  pageId: string;
  ownerId: string;
}): Promise<AsyncPublishState> {
  const { data, error } = await input.supabase
    .from("landing_pages")
    .select("publish_version, last_publish_job_id, last_publish_job_sequence")
    .eq("id", input.pageId)
    .eq("user_id", input.ownerId)
    .maybeSingle();

  if (error) {
    const markerError = error.message.toLowerCase();
    const missingMarker =
      markerError.includes("last_publish_job_id") ||
      markerError.includes("last_publish_job_sequence");
    throw Object.assign(
      new Error(
        missingMarker
          ? "Async publish migration is not applied (last_publish_job_id is missing)."
          : error.message,
      ),
      {
        status: missingMarker ? 503 : 500,
        code: missingMarker
          ? "ASYNC_PUBLISH_MIGRATION_REQUIRED"
          : "ASYNC_PUBLISH_STATE_FAILED",
      },
    );
  }
  if (!data) {
    throw Object.assign(new Error("Landing page not found."), { status: 404 });
  }

  return {
    publishVersion:
      typeof data.publish_version === "number" && Number.isFinite(data.publish_version)
        ? data.publish_version
        : 0,
    lastPublishJobId:
      typeof data.last_publish_job_id === "string" && data.last_publish_job_id.trim()
        ? data.last_publish_job_id
        : null,
    lastPublishJobSequence:
      typeof data.last_publish_job_sequence === "number" &&
      Number.isSafeInteger(data.last_publish_job_sequence)
        ? data.last_publish_job_sequence
        : Number(data.last_publish_job_sequence ?? 0) || 0,
  };
}

function resolvedEdgeStatus(
  deliveryStatus: PublishResult["edgeSyncStatus"],
  artifactStatus: PublishResult["edgeSyncStatus"],
): PublishResult["edgeSyncStatus"] {
  // Immutable artifact delivery is authoritative when enabled. Legacy route
  // sync remains a migration fallback and must not hide R2/KV failures.
  return artifactStatus === "disabled" ? deliveryStatus : artifactStatus;
}

async function fenceSupersededEdgePublish(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  publishJobId: string;
}): Promise<void> {
  const latestState = await loadAsyncPublishState({
    supabase: input.supabase,
    pageId: input.pageId,
    ownerId: input.ownerId,
  });
  if (latestState.lastPublishJobId === input.publishJobId) return;

  // Another publish committed while this worker was writing R2/KV. Repair the
  // mutable pointer from the latest durable page row before declaring this job
  // superseded, so out-of-order network completion cannot reactivate old HTML.
  const latestPage = await loadOwnedPage(
    input.supabase,
    input.pageId,
    input.ownerId,
  );
  const latestHtml = latestPage?.published_html?.trim();
  if (
    latestPage &&
    latestHtml &&
    latestPage.status === "published" &&
    latestState.publishVersion > 0
  ) {
    await syncDomainEdgeArtifactForPublishedPage({
      supabase: input.supabase,
      ownerId: input.ownerId,
      pageId: latestPage.id,
      slug: latestPage.slug,
      version: latestState.publishVersion,
      html: preparePublishedHtmlForDelivery(latestHtml),
    }).catch(() => undefined);
  }

  throw Object.assign(
    new Error("Landing publish was superseded while activating the edge route."),
    { status: 409, code: "PUBLISH_SUPERSEDED" },
  );
}

async function reconcileCommittedAsyncPublish(input: {
  supabase: SupabaseClient;
  page: LandingPageRow;
  ownerId: string;
  body?: PublishLandingPageRequest;
  publishJobId: string;
  state: AsyncPublishState;
}): Promise<PublishResult> {
  const html = input.page.published_html?.trim();
  if (!html || input.page.status !== "published" || input.state.publishVersion < 1) {
    throw Object.assign(
      new Error("Async publish marker exists without a complete published artifact."),
      { status: 409, code: "PUBLISH_STATE_INCONSISTENT" },
    );
  }

  const delivery = await applyDomainEdgePublishHook({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: input.page.id,
    slug: input.page.slug,
    html,
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

  const versionId = await createPublishVersionSnapshot({
    supabase: input.supabase,
    pageId: input.page.id,
    userId: input.ownerId,
    editorData: input.body?.draftOverride ?? input.page.editor_data,
    publishedHtml: html,
    publishedMeta: input.page.published_meta ?? { title: input.page.name },
    renderEngine: normalizeRenderEngine(input.page.render_engine),
    versionName: `publish-job:${input.publishJobId}`,
  });
  if (!versionId) {
    throw Object.assign(new Error("Publish version snapshot could not be reconciled."), {
      status: 503,
      code: "PUBLISH_VERSION_RECONCILE_FAILED",
    });
  }

  const edge = await syncDomainEdgeArtifactForPublishedPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: input.page.id,
    slug: input.page.slug,
    version: input.state.publishVersion,
    // R2 serves HTML directly, so persist the same delivery transform used by
    // /p/[slug]. This keeps root-relative assets pinned to the app asset origin.
    html: preparePublishedHtmlForDelivery(html),
  });
  await fenceSupersededEdgePublish({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: input.page.id,
    publishJobId: input.publishJobId,
  });
  await syncWebsitePages(
    input.supabase,
    input.page.id,
    input.page.slug,
    "published",
    publicUrl,
  );
  await triggerLandingRevalidate(input.page.slug);

  return {
    pageId: input.page.id,
    slug: input.page.slug,
    publicUrl,
    platformUrl: delivery.platformUrl,
    subdomainUrl: delivery.subdomainUrl,
    customPublicUrl: delivery.customPublicUrl,
    deliveryMode: delivery.deliveryMode,
    edgeSyncStatus: resolvedEdgeStatus(delivery.edgeSyncStatus, edge.edgeSyncStatus),
    edgeRetryable: edge.edgeSyncStatus === "error" ? edge.retryable !== false : undefined,
    publishedAt: input.page.published_at ?? new Date().toISOString(),
    versionId,
    renderEngine: normalizeRenderEngine(input.page.render_engine),
    aiSeo: null,
  };
}

async function commitPublishedPage(input: {
  supabase: SupabaseClient;
  page: LandingPageRow;
  ownerId: string;
  publishedHtml: string;
  publishedMeta: LandingPageRow["published_meta"];
  renderEngine: string;
  nextVersion: number;
  publishedAt: string;
  publishJobId?: string;
  publishJobSequence?: number;
  expectedAsyncState?: AsyncPublishState;
}): Promise<"committed" | "already-committed"> {
  const updatePayload: Record<string, unknown> = {
    published_html: input.publishedHtml,
    published_meta: input.publishedMeta,
    publish_version: input.nextVersion,
    render_engine: input.renderEngine,
    status: "published",
    visibility: "public",
    published_at: input.publishedAt,
    updated_at: input.publishedAt,
  };

  if (input.publishJobId) {
    if (!input.expectedAsyncState || !input.publishJobSequence) {
      throw new Error("Async publish state and monotonic job sequence are required for an async commit.");
    }
    updatePayload.last_publish_job_id = input.publishJobId;
    updatePayload.last_publish_job_sequence = input.publishJobSequence;

    let query = input.supabase
      .from("landing_pages")
      .update(updatePayload)
      .eq("id", input.page.id)
      .eq("user_id", input.ownerId);

    query = input.expectedAsyncState.publishVersion === 0
      ? query.or("publish_version.eq.0,publish_version.is.null")
      : query.eq("publish_version", input.expectedAsyncState.publishVersion);
    query = input.expectedAsyncState.lastPublishJobId == null
      ? query.is("last_publish_job_id", null)
      : query.eq("last_publish_job_id", input.expectedAsyncState.lastPublishJobId);
    query = query.eq(
      "last_publish_job_sequence",
      input.expectedAsyncState.lastPublishJobSequence,
    );

    const { data, error } = await query.select("id").maybeSingle();
    if (error) {
      const markerError = error.message.toLowerCase();
      const missingMarker =
        markerError.includes("last_publish_job_id") ||
        markerError.includes("last_publish_job_sequence");
      throw Object.assign(
        new Error(
          missingMarker
            ? "Async publish migration is not applied (last_publish_job_id is missing)."
            : error.message,
        ),
        {
          status: missingMarker ? 503 : 500,
          code: missingMarker
            ? "ASYNC_PUBLISH_MIGRATION_REQUIRED"
            : "PUBLISH_COMMIT_FAILED",
        },
      );
    }
    if (data) return "committed";

    const current = await loadAsyncPublishState({
      supabase: input.supabase,
      pageId: input.page.id,
      ownerId: input.ownerId,
    });
    if (current.lastPublishJobId === input.publishJobId) return "already-committed";

    throw Object.assign(
      new Error("Landing page changed while this publish job was running."),
      { status: 409, code: "PUBLISH_SUPERSEDED" },
    );
  }

  const { error: updateError } = await input.supabase
    .from("landing_pages")
    .update(updatePayload)
    .eq("id", input.page.id)
    .eq("user_id", input.ownerId);

  if (updateError) {
    const missingColumn = updateError.message.toLowerCase().includes("column");
    if (missingColumn) {
      const { error: fallbackError } = await input.supabase
        .from("landing_pages")
        .update({
          published_html: input.publishedHtml,
          status: "published",
          visibility: "public",
          published_at: input.publishedAt,
          updated_at: input.publishedAt,
        })
        .eq("id", input.page.id)
        .eq("user_id", input.ownerId);

      if (fallbackError) {
        throw Object.assign(new Error(fallbackError.message), { status: 500 });
      }
    } else {
      throw Object.assign(new Error(updateError.message), { status: 500 });
    }
  }
  return "committed";
}

export async function publishLandingPageServer(input: {
  supabase: SupabaseClient;
  pageId: string;
  ownerId: string;
  body?: PublishLandingPageRequest;
  /** Optional Bearer for synchronous Nest landing-cms artifact fetch. */
  authHeader?: string | null;
  /** Durable backend job id. Enables CAS/idempotent retry behavior. */
  publishJobId?: string;
  /** Monotonic lp_publish_job.id used to fence stale worker retries/replicas. */
  publishJobSequence?: number;
  /** Server-owned tenant identity for async AI-SEO sync. */
  internalContext?: {
    tenantId: number;
    organizationId?: string | null;
  } | null;
  /** Worker-prefetched Instatic HTML so no user JWT is stored in a job. */
  instaticHtml?: string | null;
}): Promise<PublishResult> {
  let page = await loadOwnedPage(input.supabase, input.pageId, input.ownerId);
  if (!page) {
    throw Object.assign(new Error("Landing page not found."), { status: 404 });
  }

  let asyncState: AsyncPublishState | undefined;
  if (input.publishJobId) {
    asyncState = await loadAsyncPublishState({
      supabase: input.supabase,
      pageId: page.id,
      ownerId: input.ownerId,
    });
    if (asyncState.lastPublishJobId === input.publishJobId) {
      return reconcileCommittedAsyncPublish({
        supabase: input.supabase,
        page,
        ownerId: input.ownerId,
        body: input.body,
        publishJobId: input.publishJobId,
        state: asyncState,
      });
    }
    if (!input.publishJobSequence || input.publishJobSequence <= asyncState.lastPublishJobSequence) {
      throw Object.assign(
        new Error("A newer landing publish has already claimed this page."),
        { status: 409, code: "PUBLISH_SUPERSEDED" },
      );
    }
  }

  let editorData = input.body?.draftOverride ?? page.editor_data;
  let engine =
    page.render_engine === "instatic" ? "instatic" : (page.render_engine ?? "visual-editor");

  if (engine === "instatic") {
    // Worker-prefetched HTML avoids persisting/forwarding a user JWT. Interactive
    // sync publish keeps the existing server-side artifact fetch fallback.
    const artifactHtml =
      input.instaticHtml?.trim() ||
      (await fetchInstaticArtifactHtml(page.id, input.authHeader ?? null));
    if (artifactHtml) {
      editorData = artifactHtml;
    } else {
      const fromOverride = extractHtmlFromUnknown(input.body?.draftOverride);
      const fromStored = extractHtmlFromUnknown(page.editor_data);
      const fromPublished =
        typeof page.published_html === "string" && page.published_html.trim()
          ? page.published_html.trim()
          : null;
      const visualDraft =
        looksLikeVisualEditorDraft(input.body?.draftOverride) ||
        looksLikeVisualEditorDraft(page.editor_data);

      if (fromOverride) {
        editorData = fromOverride;
      } else if (fromStored) {
        editorData = fromStored;
      } else if (visualDraft) {
        engine = "visual-editor";
        editorData = input.body?.draftOverride ?? page.editor_data;
      } else if (fromPublished) {
        editorData = fromPublished;
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
  const normalizedHtml = ensureFullHtmlDocument(artifact.html);
  const htmlWithSeo = await applyAiSeoPublishHook(input.supabase, page.id, normalizedHtml);

  // Resolve the URL without mutating edge state so Nest can inject tracking into
  // the final immutable HTML before the page/version is committed.
  const plannedDelivery = await resolveDomainEdgePublicUrlsForPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
    context: {
      domainId: input.body?.domainId,
      path: input.body?.path,
    },
  });
  const plannedPublicUrl = pickPublicUrl({
    customPublicUrl: plannedDelivery.customPublicUrl,
    subdomainUrl: plannedDelivery.subdomainUrl,
    platformUrl: plannedDelivery.platformUrl,
  });

  // Fail-soft: existing synchronous flow uses JWT; async worker uses signed
  // server-to-server tenant context. Neither credential is exposed to browser JS.
  const nestSync = await syncNestAiSeoAfterPublish({
    pageId: page.id,
    html: htmlWithSeo,
    publicUrl: plannedPublicUrl,
    name: page.name,
    slug: page.slug,
    authHeader: input.authHeader ?? null,
    internalContext: input.internalContext ?? null,
  });
  const nestHtml = nestSync?.html?.trim();
  const finalHtml = ensureFullHtmlDocument(nestHtml || htmlWithSeo);

  const now = new Date().toISOString();
  const nextVersion = (asyncState?.publishVersion ?? page.publish_version ?? 0) + 1;
  const commit = await commitPublishedPage({
    supabase: input.supabase,
    page,
    ownerId: input.ownerId,
    publishedHtml: finalHtml,
    publishedMeta: artifact.meta,
    renderEngine: draft.renderEngine,
    nextVersion,
    publishedAt: now,
    publishJobId: input.publishJobId,
    publishJobSequence: input.publishJobSequence,
    expectedAsyncState: asyncState,
  });

  if (commit === "already-committed" && input.publishJobId) {
    page = await loadOwnedPage(input.supabase, page.id, input.ownerId);
    const currentState = await loadAsyncPublishState({
      supabase: input.supabase,
      pageId: input.pageId,
      ownerId: input.ownerId,
    });
    if (!page) {
      throw Object.assign(new Error("Landing page not found."), { status: 404 });
    }
    return reconcileCommittedAsyncPublish({
      supabase: input.supabase,
      page,
      ownerId: input.ownerId,
      body: input.body,
      publishJobId: input.publishJobId,
      state: currentState,
    });
  }

  const versionId = await createPublishVersionSnapshot({
    supabase: input.supabase,
    pageId: page.id,
    userId: input.ownerId,
    editorData,
    publishedHtml: finalHtml,
    publishedMeta: artifact.meta,
    renderEngine: draft.renderEngine,
    versionName: input.publishJobId ? `publish-job:${input.publishJobId}` : undefined,
  });
  if (input.publishJobId && !versionId) {
    throw Object.assign(new Error("Publish version snapshot failed."), {
      status: 503,
      code: "PUBLISH_VERSION_SNAPSHOT_FAILED",
    });
  }

  await triggerLandingRevalidate(page.slug);

  const delivery = await applyDomainEdgePublishHook({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
    html: finalHtml,
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

  const edge = await syncDomainEdgeArtifactForPublishedPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
    version: nextVersion,
    // Immutable edge artifacts must be delivery-ready because they bypass the
    // /p/[slug] response transform. Keep published_html raw for origin fallback.
    html: preparePublishedHtmlForDelivery(finalHtml),
  });
  if (input.publishJobId) {
    await fenceSupersededEdgePublish({
      supabase: input.supabase,
      ownerId: input.ownerId,
      pageId: page.id,
      publishJobId: input.publishJobId,
    });
  }
  await syncWebsitePages(input.supabase, page.id, page.slug, "published", publicUrl);

  return {
    pageId: page.id,
    slug: page.slug,
    publicUrl,
    platformUrl: delivery.platformUrl,
    subdomainUrl: delivery.subdomainUrl,
    customPublicUrl: delivery.customPublicUrl,
    deliveryMode: delivery.deliveryMode,
    edgeSyncStatus: resolvedEdgeStatus(delivery.edgeSyncStatus, edge.edgeSyncStatus),
    edgeRetryable: edge.edgeSyncStatus === "error" ? edge.retryable !== false : undefined,
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

  // Unpublish is fail-closed: never mark the database private while a mutable
  // edge pointer can still serve the previous immutable artifact. Publish can
  // fail-soft to /p/{slug}; unpublish cannot safely tolerate a stale public route.
  const edgeCleanup = await removeDomainEdgeRoutesForPublishedPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    pageId: page.id,
    slug: page.slug,
  });
  if (edgeCleanup.edgeSyncStatus === "error" || edgeCleanup.edgeSyncStatus === "pending") {
    throw Object.assign(
      new Error(`Unable to remove public edge route: ${edgeCleanup.message}`),
      { status: 503, code: "EDGE_UNPUBLISH_INCOMPLETE" },
    );
  }

  const now = new Date().toISOString();
  const { error } = await input.supabase
    .from("landing_pages")
    .update({
      status: "draft",
      visibility: "private",
      updated_at: now,
    })
    .eq("id", page.id)
    .eq("user_id", input.ownerId);

  if (error) {
    throw Object.assign(new Error(error.message), { status: 500 });
  }

  await syncWebsitePages(input.supabase, page.id, page.slug, "draft", null);
  await triggerLandingRevalidate(page.slug);

  return {
    pageId: page.id,
    status: "draft",
    visibility: "private",
  };
}
