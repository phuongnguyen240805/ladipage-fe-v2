import { NextRequest, NextResponse } from "next/server";

import { getCustomHostname } from "@/features/landing-domain-edge/services/cloudflare-saas.client";
import { formatLandingDomainRow } from "@/features/landing-domain-edge/services/domain-format.util";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

import { requireLandingPageOwner } from "../../../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { data: domain, error: loadError } = await supabase
    .from("landing_domains")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.ownerId)
    .maybeSingle();

  if (loadError) return jsonError(loadError.message, 500);
  if (!domain) return jsonError("Domain not found.", 404);

  const cfId = domain.cloudflare_hostname_id
    ? String(domain.cloudflare_hostname_id)
    : null;

  if (!cfId) {
    return jsonError(
      "Domain has no cloudflare_hostname_id. Re-add the domain after Plan B migration.",
      422,
    );
  }

  let record;
  try {
    record = await getCustomHostname(cfId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloudflare refresh failed.";
    const status = (err as { status?: number }).status ?? 502;
    return jsonError(message, status);
  }

  if (!record) {
    return jsonError("Custom hostname not found on Cloudflare.", 404);
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: record.domainStatus,
    ssl_status: record.mappedSslStatus,
    verification_errors: record.verificationErrors ?? null,
    last_checked_at: now,
    updated_at: now,
  };

  let { data: updated, error: updateError } = await supabase
    .from("landing_domains")
    .update(patch)
    .eq("id", id)
    .eq("user_id", auth.ownerId)
    .select()
    .single();

  if (updateError?.message?.toLowerCase().includes("column")) {
    const fallback = await supabase
      .from("landing_domains")
      .update({
        status: record.domainStatus,
        ssl_status: record.mappedSslStatus,
        updated_at: now,
      })
      .eq("id", id)
      .eq("user_id", auth.ownerId)
      .select()
      .single();
    updated = fallback.data;
    updateError = fallback.error;
  }

  if (updateError) return jsonError(updateError.message, 500);

  return NextResponse.json({
    domain: formatLandingDomainRow(updated as Record<string, unknown>),
    cloudflare: {
      status: record.status,
      sslStatus: record.sslStatus,
      domainStatus: record.domainStatus,
    },
  });
}
