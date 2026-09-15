import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getLandingOriginBaseUrl,
  isCustomDomainEdgeEnabled,
} from "../config/domain-edge.flags";
import type {
  CustomDomainPublishContext,
  EdgeSyncStatus,
  LandingDomainRoute,
  ResolvedPublicUrls,
} from "../types/domain-edge.types";
import { cloudflareEdgeAdapter } from "./cloudflare-edge.adapter";
import {
  loadDomainRoute,
  loadDomainRoutesForPage,
  resolvePublicUrls,
} from "./domain-route.service";
import {
  activateLandingEdgeArtifact,
  publishLandingEdgeArtifact,
  type LandingEdgeArtifactResult,
  type LandingEdgeRouteTarget,
  unpublishLandingEdgeRoutes,
} from "./landing-edge-artifact.client";
import { applyFreeSubdomainPublishHook } from "./free-subdomain-publish.hook";
import {
  buildFreeSubdomainUrl,
  getFreeSubdomainDeliveryMode,
} from "./free-subdomain.service";

function strongerEdgeStatus(
  current: EdgeSyncStatus,
  next: EdgeSyncStatus,
): EdgeSyncStatus {
  const rank: Record<EdgeSyncStatus, number> = {
    disabled: 0,
    pending: 1,
    synced: 2,
    error: 3,
  };
  return rank[next] > rank[current] ? next : current;
}

function edgeRouteTarget(
  route: Pick<LandingDomainRoute, "hostname" | "pathPrefix">,
  slug: string,
): LandingEdgeRouteTarget {
  return {
    hostname: route.hostname,
    path: route.pathPrefix || "/",
    originSlug: slug,
    originBaseUrl: getLandingOriginBaseUrl(),
  };
}

function freeRouteTarget(slug: string): LandingEdgeRouteTarget | null {
  if (getFreeSubdomainDeliveryMode() !== "r2") return null;
  const subdomainUrl = buildFreeSubdomainUrl(slug);
  if (!subdomainUrl) return null;
  try {
    return {
      hostname: new URL(subdomainUrl).hostname,
      path: "/",
      originSlug: slug,
      originBaseUrl: getLandingOriginBaseUrl(),
    };
  } catch {
    return null;
  }
}

function dedupeTargets(routes: LandingEdgeRouteTarget[]): LandingEdgeRouteTarget[] {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const key = `${route.hostname.toLowerCase()}|${route.path || "/"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadArtifactTargets(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
}): Promise<{
  customRoutes: LandingDomainRoute[];
  targets: LandingEdgeRouteTarget[];
}> {
  const customRoutes = isCustomDomainEdgeEnabled()
    ? await loadDomainRoutesForPage({
        supabase: input.supabase,
        ownerId: input.ownerId,
        landingPageId: input.pageId,
      })
    : [];

  const targets = customRoutes.map((route) => edgeRouteTarget(route, input.slug));
  const free = freeRouteTarget(input.slug);
  if (free) targets.push(free);

  return { customRoutes, targets: dedupeTargets(targets) };
}

async function persistCustomEdgeStatus(
  supabase: SupabaseClient,
  routes: LandingDomainRoute[],
  status: EdgeSyncStatus,
): Promise<void> {
  if (routes.length === 0) return;
  const now = new Date().toISOString();
  await Promise.all(
    routes.map(async (route) => {
      const { error } = await supabase
        .from("landing_domain_routes")
        .update({ edge_status: status, updated_at: now })
        .eq("id", route.id);
      if (error) {
        console.warn(
          `DomainEdgePublish: failed to persist edge status for route=${route.id}: ${error.message}`,
        );
      }
    }),
  );
}

/** Resolve public URLs without mutating edge state. */
export async function resolveDomainEdgePublicUrlsForPage(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  context?: CustomDomainPublishContext;
}): Promise<ResolvedPublicUrls> {
  const allRoutes = await loadDomainRoutesForPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    landingPageId: input.pageId,
  });
  let primaryRoute = input.context?.domainId
    ? await loadDomainRoute({
        supabase: input.supabase,
        ownerId: input.ownerId,
        domainId: input.context.domainId,
        landingPageId: input.pageId,
      })
    : null;
  if (!primaryRoute && allRoutes.length > 0) primaryRoute = allRoutes[0] ?? null;

  const free = await applyFreeSubdomainPublishHook({
    slug: input.slug,
    pageId: input.pageId,
  });
  const urls = resolvePublicUrls({
    slug: input.slug,
    context: {
      domainId: primaryRoute?.domainId ?? input.context?.domainId,
      path: input.context?.path ?? primaryRoute?.pathPrefix,
    },
    route: primaryRoute ? { ...primaryRoute, originSlug: input.slug } : null,
    subdomainUrl: free.subdomainUrl,
  });
  return urls.deliveryMode === "subdomain"
    ? { ...urls, edgeSyncStatus: free.edgeSyncStatus }
    : urls;
}

/**
 * Plan A free subdomain + Plan B custom domain edge on publish.
 * Auto-syncs every domain route for the page; optional domainId selects primary custom URL.
 *
 * This compatibility hook still owns the legacy KV/origin route mapping. Immutable
 * R2 artifact delivery is a separate step so rollout can keep /p/{slug} as fallback.
 */
export async function applyDomainEdgePublishHook(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  html?: string;
  context?: CustomDomainPublishContext;
}): Promise<ResolvedPublicUrls> {
  const free = await applyFreeSubdomainPublishHook({
    slug: input.slug,
    pageId: input.pageId,
    html: input.html,
  });

  const allRoutes = await loadDomainRoutesForPage({
    supabase: input.supabase,
    ownerId: input.ownerId,
    landingPageId: input.pageId,
  });

  // Prefer explicit domainId from publish body; else first route.
  let primaryRoute =
    input.context?.domainId != null
      ? await loadDomainRoute({
          supabase: input.supabase,
          ownerId: input.ownerId,
          domainId: input.context.domainId,
          landingPageId: input.pageId,
        })
      : null;

  if (!primaryRoute && allRoutes.length > 0) {
    primaryRoute = allRoutes[0] ?? null;
  }

  // Keep origin_slug aligned with current page slug before legacy edge sync.
  const routesToSync = allRoutes.map((route) => ({ ...route, originSlug: input.slug }));
  if (primaryRoute && !routesToSync.some((route) => route.id === primaryRoute!.id)) {
    routesToSync.push({ ...primaryRoute, originSlug: input.slug });
  }

  let worstEdge: EdgeSyncStatus = "disabled";
  for (const route of routesToSync) {
    const sync = await cloudflareEdgeAdapter.syncRoute(route);
    await input.supabase
      .from("landing_domain_routes")
      .update({
        origin_slug: input.slug,
        edge_status: sync.edgeSyncStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", route.id);

    worstEdge = strongerEdgeStatus(worstEdge, sync.edgeSyncStatus);
  }

  const urls = resolvePublicUrls({
    slug: input.slug,
    context: {
      domainId: primaryRoute?.domainId ?? input.context?.domainId,
      path: input.context?.path ?? primaryRoute?.pathPrefix,
    },
    route: primaryRoute ? { ...primaryRoute, originSlug: input.slug } : null,
    subdomainUrl: free.subdomainUrl,
  });

  if (urls.deliveryMode === "custom-domain") {
    return {
      ...urls,
      edgeSyncStatus: worstEdge !== "disabled" ? worstEdge : urls.edgeSyncStatus,
    };
  }

  if (urls.deliveryMode === "subdomain") {
    return { ...urls, edgeSyncStatus: free.edgeSyncStatus };
  }

  return urls;
}

/**
 * Upload immutable HTML and atomically point all current public routes at the
 * new version. Failure is fail-soft for publish: DB + /p/{slug} remain valid.
 */
export async function syncDomainEdgeArtifactForPublishedPage(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  version: number;
  html: string;
}): Promise<LandingEdgeArtifactResult> {
  const { customRoutes, targets } = await loadArtifactTargets(input);
  const result = await publishLandingEdgeArtifact({
    pageId: input.pageId,
    version: input.version,
    html: input.html,
    routes: targets,
  });

  if (customRoutes.length > 0 && result.edgeSyncStatus !== "disabled") {
    await persistCustomEdgeStatus(input.supabase, customRoutes, result.edgeSyncStatus);
  }
  return result;
}

/** Pointer-only rollback. Immutable R2 artifacts are retained. */
export async function activateDomainEdgeArtifactVersion(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  version: number;
}): Promise<LandingEdgeArtifactResult> {
  const { customRoutes, targets } = await loadArtifactTargets(input);
  const result = await activateLandingEdgeArtifact({
    pageId: input.pageId,
    version: input.version,
    routes: targets,
  });
  if (customRoutes.length > 0 && result.edgeSyncStatus !== "disabled") {
    await persistCustomEdgeStatus(input.supabase, customRoutes, result.edgeSyncStatus);
  }
  return result;
}

/** Remove mutable pointers only; immutable artifacts remain available for rollback. */
export async function removeDomainEdgeRoutesForPublishedPage(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
}): Promise<LandingEdgeArtifactResult> {
  const { customRoutes, targets } = await loadArtifactTargets(input);
  const result = await unpublishLandingEdgeRoutes({
    pageId: input.pageId,
    routes: targets,
  });

  // Remove the legacy origin-pointer entries as well. During migration the edge
  // worker dual-reads both formats, so leaving the old key would keep a stale
  // public route alive even after the canonical pointer was removed.
  let legacyStatus: EdgeSyncStatus = "disabled";
  for (const route of customRoutes) {
    const removed = await cloudflareEdgeAdapter.removeRoute(route);
    legacyStatus = strongerEdgeStatus(legacyStatus, removed.edgeSyncStatus);
  }
  const cleanupStatus: EdgeSyncStatus =
    result.edgeSyncStatus === "error" || legacyStatus === "error"
      ? "error"
      : result.edgeSyncStatus;
  const cleanupResult: LandingEdgeArtifactResult = {
    ...result,
    edgeSyncStatus: cleanupStatus,
  };

  if (customRoutes.length > 0 && cleanupResult.edgeSyncStatus !== "disabled") {
    await persistCustomEdgeStatus(
      input.supabase,
      customRoutes,
      cleanupResult.edgeSyncStatus === "synced" ? "disabled" : cleanupResult.edgeSyncStatus,
    );
  }
  return cleanupResult;
}
