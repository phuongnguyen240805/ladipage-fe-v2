import type { SupabaseClient } from "@supabase/supabase-js";

import type { CustomDomainPublishContext, ResolvedPublicUrls } from "../types/domain-edge.types";
import { cloudflareEdgeAdapter } from "./cloudflare-edge.adapter";
import { loadDomainRoute, resolvePublicUrls } from "./domain-route.service";

export async function applyDomainEdgePublishHook(input: {
  supabase: SupabaseClient;
  ownerId: string;
  pageId: string;
  slug: string;
  context?: CustomDomainPublishContext;
}): Promise<ResolvedPublicUrls> {
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
  });

  if (urls.deliveryMode === "custom-domain" && route) {
    const sync = await cloudflareEdgeAdapter.syncRoute(route);
    return { ...urls, edgeSyncStatus: sync.edgeSyncStatus };
  }

  return urls;
}