import type { BillingUsageDto } from "@liora/api-types";
import { canCreateLandingPageWithUsage } from "./landing-access";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";

export async function fetchBillingUsageFromNest(
  bearerToken: string | null
): Promise<BillingUsageDto | null> {
  if (!bearerToken) return null;

  try {
    const response = await fetch(`${API_URL}/billing/usage`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as BillingUsageDto;
  } catch {
    return null;
  }
}

export async function assertLandingPageQuota(params: {
  supabase: { from: (table: string) => any };
  userId: string | null;
  billingUsage?: BillingUsageDto | null;
  bearerToken?: string | null;
}): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const usage =
    params.billingUsage ??
    (params.bearerToken
      ? await fetchBillingUsageFromNest(params.bearerToken)
      : null);

  let used = usage?.pages.used;
  const limit = usage?.pages.limit ?? 0;

  if (used == null && params.userId) {
    const { count, error } = await params.supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.userId);
    if (error) {
      return { ok: false, status: 500, message: error.message };
    }
    used = count ?? 0;
  }

  if (used == null) {
    used = 0;
  }

  if (!canCreateLandingPageWithUsage(used, limit)) {
    return {
      ok: false,
      status: 429,
      message: `Landing page quota exceeded (${used}/${limit}). Upgrade your plan to create more pages.`,
    };
  }

  return { ok: true };
}