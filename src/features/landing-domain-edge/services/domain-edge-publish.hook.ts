import type { SupabaseClient } from "@supabase/supabase-js";

import type { CustomDomainPublishContext, ResolvedPublicUrls } from "../types/domain-edge.types";
import { cloudflareEdgeAdapter } from "./cloudflare-edge.adapter";
import { loadDomainRoute, resolvePublicUrls } from "./domain-route.service";
import { applyFreeSubdomainPublishHook } from "./free-subdomain-publish.hook";

export async function applyDomainEdgePublishHook(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  /** Published HTML for optional free-subdomain R2 path */
  html?: string;
  context?: CustomDomainPublishContext;
}): Promise<ResolvedPublicUrls> {
  const free = await applyFreeSubdomainPublishHook({
    slug: input.slug,
    pageId: input.pageId,
    html: input.html,
  });

  const route =
    input.context?.domainId
      ? await loadDomainRoute({
          supabase: input.supabase,
          ownerId: input.ownerId,
          domainId: input.context.domainId,
          landingPageId: input.pageId,
        })
      : null;

  const urls = resolvePublicUrls({
    slug: input.slug,
    context: input.context,
    route,
    subdomainUrl: free.subdomainUrl,
  });

  if (urls.deliveryMode === "custom-domain" && route) {
    const sync = await cloudflareEdgeAdapter.syncRoute(route);
    return {
      ...urls,
      edgeSyncStatus: sync.edgeSyncStatus,
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
