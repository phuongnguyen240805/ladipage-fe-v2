import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CustomDomainPublishContext,
  LandingDomainRoute,
  ResolvedPublicUrls,
} from "../types/domain-edge.types";
import { getLandingOriginBaseUrl, isCustomDomainEdgeEnabled } from "../config/domain-edge.flags";

function normalizePath(path?: string): string {
  const raw = (path ?? "/").trim();
  if (!raw || raw === "/") return "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

function buildCustomUrl(hostname: string, pathPrefix: string): string {
  const host = hostname.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const path = normalizePath(pathPrefix);
  return path === "/" ? `https://${host}` : `https://${host}${path}`;
}

export async function loadDomainRoute(input: {
  supabase: SupabaseClient;
  ownerId: string;
  domainId: string;
  landingPageId: string;
}): Promise<LandingDomainRoute | null> {
  const { data, error } = await input.supabase
    .from("landing_domain_routes")
    .select(
      "id, domain_id, landing_page_id, path_prefix, origin_slug, edge_status, cloudflare_hostname_id, landing_domains!inner(name, user_id)",
    )
    .eq("domain_id", input.domainId)
    .eq("landing_page_id", input.landingPageId)
    .eq("landing_domains.user_id", input.ownerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const joined = data.landing_domains as { name?: string } | { name?: string }[] | null;
  const hostname = Array.isArray(joined) ? joined[0]?.name : joined?.name;

  if (!hostname) {
    return null;
  }

  return {
    id: String(data.id),
    domainId: String(data.domain_id),
    landingPageId: String(data.landing_page_id),
    hostname,
    pathPrefix: String(data.path_prefix ?? "/"),
    originSlug: String(data.origin_slug),
    edgeStatus: (data.edge_status as LandingDomainRoute["edgeStatus"]) ?? "pending",
    cloudflareHostnameId: data.cloudflare_hostname_id
      ? String(data.cloudflare_hostname_id)
      : null,
  };
}

export function resolvePublicUrls(input: {
  slug: string;
  context?: CustomDomainPublishContext;
  route?: LandingDomainRoute | null;
}): ResolvedPublicUrls {
  const platformUrl = `${getLandingOriginBaseUrl()}/p/${input.slug}`;
  const edgeEnabled = isCustomDomainEdgeEnabled();

  if (!edgeEnabled || !input.context?.domainId || !input.route) {
    return {
      deliveryMode: "platform",
      platformUrl,
      customPublicUrl: null,
      edgeSyncStatus: "disabled",
    };
  }

  return {
    deliveryMode: "custom-domain",
    platformUrl,
    customPublicUrl: buildCustomUrl(
      input.route.hostname,
      input.context.path ?? input.route.pathPrefix,
    ),
    edgeSyncStatus: input.route.edgeStatus,
  };
}