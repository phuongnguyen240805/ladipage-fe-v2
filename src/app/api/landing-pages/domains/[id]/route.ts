import { NextRequest, NextResponse } from "next/server";

import { cloudflareEdgeAdapter } from "@/features/landing-domain-edge/services/cloudflare-edge.adapter";
import { deleteCustomHostname } from "@/features/landing-domain-edge/services/cloudflare-saas.client";
import { formatLandingDomainRow } from "@/features/landing-domain-edge/services/domain-format.util";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

import { requireLandingPageOwner } from "../../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function loadOwnedDomain(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  domainId: string,
  ownerId: string,
) {
  const { data, error } = await supabase
    .from("landing_domains")
    .select("*")
    .eq("id", domainId)
    .eq("user_id", ownerId)
    .maybeSingle();

  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  return data as Record<string, unknown> | null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  try {
    const domain = await loadOwnedDomain(supabase, id, auth.ownerId);
    if (!domain) return jsonError("Domain not found.", 404);
    return NextResponse.json({
      domain: formatLandingDomainRow(domain),
    });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return jsonError(err instanceof Error ? err.message : "Failed to load domain.", status);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  try {
    const domain = await loadOwnedDomain(supabase, id, auth.ownerId);
    if (!domain) return jsonError("Domain not found.", 404);

    const { data: routes } = await supabase
      .from("landing_domain_routes")
      .select(
        "id, domain_id, landing_page_id, path_prefix, origin_slug, edge_status, cloudflare_hostname_id",
      )
      .eq("domain_id", id);

    const hostname = String(domain.name ?? "");
    for (const row of routes ?? []) {
      await cloudflareEdgeAdapter.removeRoute({
        id: String(row.id),
        domainId: String(row.domain_id),
        landingPageId: String(row.landing_page_id),
        hostname,
        pathPrefix: String(row.path_prefix ?? "/"),
        originSlug: String(row.origin_slug ?? ""),
        edgeStatus: (row.edge_status as "pending") ?? "pending",
        cloudflareHostnameId: row.cloudflare_hostname_id
          ? String(row.cloudflare_hostname_id)
          : null,
      });
    }

    const cfId = domain.cloudflare_hostname_id
      ? String(domain.cloudflare_hostname_id)
      : null;
    if (cfId) {
      await deleteCustomHostname(cfId);
    }

    await supabase.from("landing_domain_routes").delete().eq("domain_id", id);
    const { error } = await supabase
      .from("landing_domains")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.ownerId);

    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ deleted: true, id });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return jsonError(err instanceof Error ? err.message : "Delete failed.", status);
  }
}
