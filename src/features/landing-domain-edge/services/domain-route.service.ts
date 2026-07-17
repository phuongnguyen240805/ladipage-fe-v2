import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CustomDomainPublishContext,
  LandingDomainRoute,
  ResolvedPublicUrls,
} from "../types/domain-edge.types";
import { isCustomDomainEdgeEnabled } from "../config/domain-edge.flags";
import { normalizeRoutePathPrefix } from "./domain-hostname.util";
import {
  buildFreeSubdomainUrl,
  buildPlatformLandingUrl,
} from "./free-subdomain.service";

function buildCustomUrl(hostname: string, pathPrefix: string): string {
  const host = hostname.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const path = normalizeRoutePathPrefix(pathPrefix);
  return path === "/" ? `https://${host}` : `https://${host}${path}`;
}

function mapRouteRow(data: Record<string, unknown>): LandingDomainRoute | null {
  const joined = data.landing_domains as { name?: string } | { name?: string }[] | null;
  const hostname = Array.isArray(joined) ? joined[0]?.name : joined?.name;
  if (!hostname) return null;

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

  return mapRouteRow(data as Record<string, unknown>);
}

/** All custom-domain routes mapped to a landing page (any domain of the owner). */
export async function loadDomainRoutesForPage(input: {
  supabase: SupabaseClient;
  ownerId: string;
  landingPageId: string;
}): Promise<LandingDomainRoute[]> {
  const { data, error } = await input.supabase
    .from("landing_domain_routes")
    .select(
      "id, domain_id, landing_page_id, path_prefix, origin_slug, edge_status, cloudflare_hostname_id, landing_domains!inner(name, user_id)",
    )
    .eq("landing_page_id", input.landingPageId)
    .eq("landing_domains.user_id", input.ownerId);

  if (error || !data?.length) {
    return [];
  }

  return data
    .map((row) => mapRouteRow(row as Record<string, unknown>))
    .filter((r): r is LandingDomainRoute => r != null);
}

/**
 * Resolve public URLs for a published page.
 * Priority for deliveryMode: custom-domain > subdomain > platform.
 * Always includes platformUrl; subdomain/custom may be null.
 */
export function resolvePublicUrls(input: {
  slug: string;
  context?: CustomDomainPublishContext;
  route?: LandingDomainRoute | null;
  /** Optional precomputed free URL (from publish hook); else built here. */
  subdomainUrl?: string | null;
}): ResolvedPublicUrls {
  const platformUrl = buildPlatformLandingUrl(input.slug);
  const subdomainUrl =
    input.subdomainUrl !== undefined
      ? input.subdomainUrl
      : buildFreeSubdomainUrl(input.slug);

  const customEnabled = isCustomDomainEdgeEnabled();
  // Plan B: any mapped route + flag is enough (domainId optional when auto-synced).
  const hasCustom = customEnabled && Boolean(input.route);

  if (hasCustom && input.route) {
    return {
      deliveryMode: "custom-domain",
      platformUrl,
      subdomainUrl,
      customPublicUrl: buildCustomUrl(
        input.route.hostname,
        input.context?.path ?? input.route.pathPrefix,
      ),
      edgeSyncStatus: input.route.edgeStatus,
    };
  }

  if (subdomainUrl) {
    return {
      deliveryMode: "subdomain",
      platformUrl,
      subdomainUrl,
      customPublicUrl: null,
      edgeSyncStatus: "disabled",
    };
  }

  return {
    deliveryMode: "platform",
    platformUrl,
    subdomainUrl: null,
    customPublicUrl: null,
    edgeSyncStatus: "disabled",
  };
}
