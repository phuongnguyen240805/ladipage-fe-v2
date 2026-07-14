import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CustomDomainPublishContext,
  EdgeSyncStatus,
  ResolvedPublicUrls,
} from "../types/domain-edge.types";
import { cloudflareEdgeAdapter } from "./cloudflare-edge.adapter";
import {
  loadDomainRoute,
  loadDomainRoutesForPage,
  resolvePublicUrls,
} from "./domain-route.service";
import { applyFreeSubdomainPublishHook } from "./free-subdomain-publish.hook";

/**
 * Plan A free subdomain + Plan B custom domain edge on publish.
 * Auto-syncs every domain route for the page; optional domainId selects primary custom URL.
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

  // Keep origin_slug aligned with current page slug before edge sync.
  const routesToSync = allRoutes.map((r) => ({
    ...r,
    originSlug: input.slug,
  }));
  if (
    primaryRoute &&
    !routesToSync.some((r) => r.id === primaryRoute!.id)
  ) {
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

    if (sync.edgeSyncStatus === "error") worstEdge = "error";
    else if (sync.edgeSyncStatus === "synced" && worstEdge !== "error") {
      worstEdge = "synced";
    } else if (
      sync.edgeSyncStatus === "pending" &&
      worstEdge !== "error" &&
      worstEdge !== "synced"
    ) {
      worstEdge = "pending";
    }
  }

  const urls = resolvePublicUrls({
    slug: input.slug,
    context: {
      domainId: primaryRoute?.domainId ?? input.context?.domainId,
      path: input.context?.path ?? primaryRoute?.pathPrefix,
    },
    route: primaryRoute
      ? { ...primaryRoute, originSlug: input.slug }
      : null,
    subdomainUrl: free.subdomainUrl,
  });

  if (urls.deliveryMode === "custom-domain") {
    return {
      ...urls,
      edgeSyncStatus:
        worstEdge !== "disabled" ? worstEdge : urls.edgeSyncStatus,
    };
  }

  if (urls.deliveryMode === "subdomain") {
    return {
      ...urls,
      edgeSyncStatus: free.edgeSyncStatus,
    };
  }

  return urls;
}
