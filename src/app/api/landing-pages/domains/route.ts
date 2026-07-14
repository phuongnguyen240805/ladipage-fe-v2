import { NextRequest, NextResponse } from "next/server";

import { assertDomainQuota } from "@/lib/access/domain-quota.server";
import { extractBearerToken } from "@/lib/platform-auth.server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { createCustomHostname } from "@/features/landing-domain-edge/services/cloudflare-saas.client";
import { formatLandingDomainRow } from "@/features/landing-domain-edge/services/domain-format.util";
import {
  getCustomDomainCnameTarget,
  isValidCustomerHostname,
  normalizeCustomerHostname,
} from "@/features/landing-domain-edge/services/domain-hostname.util";

import { requireLandingPageOwner } from "../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { data, error } = await supabase
    .from("landing_domains")
    .select("*")
    .eq("user_id", auth.ownerId)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({
    domains: (data ?? []).map((row) => formatLandingDomainRow(row as Record<string, unknown>)),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const payload = await request.json().catch(() => null);
  const name = normalizeCustomerHostname(String(payload?.name ?? ""));
  const platform = String(payload?.platform ?? "Ladipage").trim() || "Ladipage";
  if (!name) return jsonError("Domain name is required.");
  if (!isValidCustomerHostname(name)) {
    return jsonError("Invalid domain hostname. Use e.g. www.shop.example.com");
  }

  const quota = await assertDomainQuota({
    supabase,
    ownerId: auth.ownerId,
    bearerToken: extractBearerToken(request),
  });
  if (!quota.ok) {
    return jsonError(quota.message, quota.status);
  }

  const cnameTarget = getCustomDomainCnameTarget();
  let cfRecord;
  try {
    cfRecord = await createCustomHostname(name);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloudflare hostname create failed.";
    const status = (err as { status?: number }).status ?? 502;
    return jsonError(message, status);
  }

  const now = new Date().toISOString();
  const insertBase: Record<string, unknown> = {
    name,
    platform,
    user_id: auth.ownerId,
    status: "PENDING",
    ssl_status: "PENDING",
    created_at: now,
    updated_at: now,
  };

  const insertWithCf: Record<string, unknown> = {
    ...insertBase,
    cloudflare_hostname_id: cfRecord.id,
    cname_target: cnameTarget,
    verification_errors: cfRecord.verificationErrors ?? null,
    last_checked_at: now,
  };

  let { data, error } = await supabase
    .from("landing_domains")
    .insert([insertWithCf])
    .select()
    .single();

  // Migration not applied yet — fall back without new columns.
  if (error?.message?.toLowerCase().includes("column")) {
    const fallback = await supabase
      .from("landing_domains")
      .insert([insertBase])
      .select()
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({
    domain: formatLandingDomainRow(data as Record<string, unknown>),
  });
}
