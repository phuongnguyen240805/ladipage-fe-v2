import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { cloudflareEdgeAdapter } from "@/features/landing-domain-edge/services/cloudflare-edge.adapter";
import { normalizeRoutePathPrefix } from "@/features/landing-domain-edge/services/domain-hostname.util";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

import { requireLandingPageOwner } from "../../../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

const createBodySchema = z.object({
  landingPageId: z.string().uuid(),
  pathPrefix: z.string().optional(),
});

async function loadOwnedDomain(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  domainId: string,
  ownerId: string,
) {
  const { data, error } = await supabase
    .from("landing_domains")
    .select("id, name, user_id, cloudflare_hostname_id")
    .eq("id", domainId)
    .eq("user_id", ownerId)
    .maybeSingle();
  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  return data;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id: domainId } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  try {
    const domain = await loadOwnedDomain(supabase, domainId, auth.ownerId);
    if (!domain) return jsonError("Domain not found.", 404);

    const { data, error } = await supabase
      .from("landing_domain_routes")
      .select("*")
      .eq("domain_id", domainId)
      .order("created_at", { ascending: true });

    if (error) return jsonError(error.message, 500);
    return NextResponse.json({
      domainId,
      hostname: domain.name,
      routes: data ?? [],
    });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return jsonError(err instanceof Error ? err.message : "List routes failed.", status);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id: domainId } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const parsed = createBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return jsonError("Invalid body. Require landingPageId (uuid) and optional pathPrefix.");
  }

  try {
    const domain = await loadOwnedDomain(supabase, domainId, auth.ownerId);
    if (!domain) return jsonError("Domain not found.", 404);

    const { data: page, error: pageError } = await supabase
      .from("landing_pages")
      .select("id, slug, user_id")
      .eq("id", parsed.data.landingPageId)
      .maybeSingle();

    if (pageError) return jsonError(pageError.message, 500);
    if (!page || page.user_id !== auth.ownerId) {
      return jsonError("Landing page not found or not owned.", 404);
    }

    const pathPrefix = normalizeRoutePathPrefix(parsed.data.pathPrefix);
    const now = new Date().toISOString();
    const { data: route, error } = await supabase
      .from("landing_domain_routes")
      .insert([
        {
          domain_id: domainId,
          landing_page_id: page.id,
          path_prefix: pathPrefix,
          origin_slug: page.slug,
          edge_status: "pending",
          cloudflare_hostname_id: domain.cloudflare_hostname_id ?? null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.message.toLowerCase().includes("unique") || error.code === "23505") {
        return jsonError("Path already mapped on this domain.", 409);
      }
      return jsonError(error.message, 500);
    }

    const sync = await cloudflareEdgeAdapter.syncRoute({
      id: String(route.id),
      domainId,
      landingPageId: String(page.id),
      hostname: String(domain.name),
      pathPrefix,
      originSlug: String(page.slug),
      edgeStatus: "pending",
      cloudflareHostnameId: domain.cloudflare_hostname_id
        ? String(domain.cloudflare_hostname_id)
        : null,
    });

    await supabase
      .from("landing_domain_routes")
      .update({
        edge_status: sync.edgeSyncStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", route.id);

    return NextResponse.json({
      route: { ...route, edge_status: sync.edgeSyncStatus },
      edgeSync: sync,
    });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return jsonError(err instanceof Error ? err.message : "Create route failed.", status);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const { id: domainId } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const routeId = request.nextUrl.searchParams.get("routeId");
  if (!routeId) return jsonError("Query routeId is required.");

  try {
    const domain = await loadOwnedDomain(supabase, domainId, auth.ownerId);
    if (!domain) return jsonError("Domain not found.", 404);

    const { data: route, error } = await supabase
      .from("landing_domain_routes")
      .select("*")
      .eq("id", routeId)
      .eq("domain_id", domainId)
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!route) return jsonError("Route not found.", 404);

    await cloudflareEdgeAdapter.removeRoute({
      id: String(route.id),
      domainId,
      landingPageId: String(route.landing_page_id),
      hostname: String(domain.name),
      pathPrefix: String(route.path_prefix ?? "/"),
      originSlug: String(route.origin_slug ?? ""),
      edgeStatus: (route.edge_status as "pending") ?? "pending",
      cloudflareHostnameId: route.cloudflare_hostname_id
        ? String(route.cloudflare_hostname_id)
        : null,
    });

    const { error: delError } = await supabase
      .from("landing_domain_routes")
      .delete()
      .eq("id", routeId)
      .eq("domain_id", domainId);

    if (delError) return jsonError(delError.message, 500);
    return NextResponse.json({ deleted: true, routeId });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return jsonError(err instanceof Error ? err.message : "Delete route failed.", status);
  }
}
