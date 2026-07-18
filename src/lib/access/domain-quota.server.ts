import type { BillingUsageDto } from "@liora/api-types";

import { canCreateLandingPageWithUsage, isProOrHigher } from "./landing-access";
import { fetchBillingUsageFromNest } from "./landing-page-quota.server";

export async function assertDomainQuota(params: {
  supabase: { from: (table: string) => any };
  ownerId: string;
  bearerToken?: string | null;
  billingUsage?: BillingUsageDto | null;
}): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (process.env.LANDING_DOMAIN_BYPASS_QUOTA === "true") {
    return { ok: true };
  }

  // Align with FE test flag: allow domain create when customer-domain edge is under test.
  if (process.env.LANDING_CUSTOM_DOMAIN_EDGE_ENABLED === "true") {
    return { ok: true };
  }

  const usage =
    params.billingUsage ??
    (params.bearerToken ? await fetchBillingUsageFromNest(params.bearerToken) : null);

  if (usage && !isProOrHigher(usage.subscriptionTier)) {
    return {
      ok: false,
      status: 403,
      message: "Custom domains require a paid plan. Upgrade to add custom domains.",
    };
  }

  let used = usage?.domains.used;
  const limit = usage?.domains.limit ?? 0;

  if (used == null) {
    const { count, error } = await params.supabase
      .from("landing_domains")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.ownerId);

    if (error) {
      return { ok: false, status: 500, message: error.message };
    }
    used = count ?? 0;
  }

  if (!canCreateLandingPageWithUsage(used ?? 0, limit)) {
    return {
      ok: false,
      status: 403,
      message: `Domain quota exceeded (${used ?? 0}/${limit}). Upgrade your plan to add custom domains.`,
    };
  }

  return { ok: true };
}