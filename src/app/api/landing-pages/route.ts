import { NextRequest, NextResponse } from "next/server";
import { getVirtualProjectId, resolveOrgAndProject } from "../ai-seo/apiUtils";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import {
  buildPlatformLandingPath,
  resolveLandingPublicViewUrl,
} from "@/features/landing-domain-edge/services/free-subdomain.service";
import { assignPageTags, fetchPageTagsMap, normalizeTagIds } from "./_page-tags";
import { assertPageOwnedBy, requireLandingPageOwner } from "./_ownership";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidPageId(pageId: unknown): pageId is string {
  return typeof pageId === "string" && UUID_PATTERN.test(pageId);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, name, status, updated_at, editor_data, slug, user_id")
    .eq("user_id", auth.ownerId)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  const pages = data ?? [];
  let tagsByPageId: Record<string, { id: string; name: string }[]> = {};
  try {
    tagsByPageId = await fetchPageTagsMap(
      supabase,
      pages.map((p) => String(p.id)),
    );
  } catch (tagsErr) {
    console.warn("Failed to load landing page tags:", tagsErr);
  }

  return NextResponse.json({
    pages: pages.map((page) => {
      const slug = String(page.slug || "");
      const publicUrl = slug ? resolveLandingPublicViewUrl(slug) : null;
      return {
        ...page,
        tags: tagsByPageId[String(page.id)] ?? [],
        /** User-facing URL (free subdomain when Plan A on). Not hardcoded /p/{slug}. */
        public_url: publicUrl,
        published_url: page.status === "published" ? publicUrl : null,
      };
    }),
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const payload = await request.json().catch(() => null);
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(isValidPageId) : [];
  if (ids.length === 0) return jsonError("No valid page ids provided.");

  const { error } = await supabase
    .from("landing_pages")
    .delete()
    .in("id", ids)
    .eq("user_id", auth.ownerId);

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ deleted: ids });
}

export async function POST(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const payload = await request.json();
  if (!isValidPageId(payload.id)) return jsonError("Invalid landing page id.");

  const tagIds = normalizeTagIds(payload.tag_ids);
  const { tag_ids: _tagIds, user_id: _ignoredUserId, ...pagePayload } = payload;

  const safePayload = {
    ...pagePayload,
    user_id: auth.ownerId,
    status: payload.status || "draft",
    visibility: "private",
  };

  const { data, error } = await supabase
    .from("landing_pages")
    .insert([safePayload])
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  let assignedTags: { id: string; name: string }[] = [];
  if (data && tagIds.length > 0) {
    try {
      assignedTags = await assignPageTags(supabase, data.id, tagIds, auth.ownerId);
    } catch (tagErr) {
      console.warn("Failed to assign landing page tags:", tagErr);
    }
  }

  if (data) {
    try {
      const { orgId, projectId } = await resolveOrgAndProject(supabase, auth.ownerId);
      const virtualProjectId = getVirtualProjectId(orgId);

      const { data: wp } = await supabase
        .from("website_projects")
        .select("id")
        .eq("id", virtualProjectId)
        .maybeSingle();

      if (!wp && projectId) {
        await supabase.from("website_projects").insert({
          id: virtualProjectId,
          organization_id: orgId,
          project_id: projectId,
          name: "Landing Page Builder (Hệ thống)",
          domain: "builder-pages.local",
          status: "active",
        });
      }

      if (projectId) {
        const slug = String(data.slug || "");
        const pagePath = buildPlatformLandingPath(slug);
        const publishedAbs =
          data.status === "published" ? resolveLandingPublicViewUrl(slug) : null;
        await supabase.from("website_pages").upsert({
          id: data.id,
          organization_id: orgId,
          website_project_id: virtualProjectId,
          project_id: projectId,
          title: data.name || "Untitled Page",
          slug: data.slug,
          page_url: pagePath,
          page_type: "landing_page",
          status: data.status || "draft",
          published_url: publishedAbs,
          source_type: "builder",
          source_landing_page_id: data.id,
          sync_status: "synced",
          last_synced_at: new Date().toISOString(),
        });
      }
    } catch (syncErr) {
      console.warn("Failed to synchronize newly created landing page to website_pages:", syncErr);
    }
  }

  return NextResponse.json({ page: { ...data, tags: assignedTags } });
}

export async function PUT(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const payload = await request.json();
  if (!isValidPageId(payload.id)) return jsonError("Invalid landing page id.");

  const { data: existingPage, error: lookupError } = await supabase
    .from("landing_pages")
    .select("id, user_id")
    .eq("id", payload.id)
    .maybeSingle();

  if (lookupError) return jsonError(lookupError.message, 500);

  const ownershipError = assertPageOwnedBy(existingPage, auth.ownerId);
  if (ownershipError) return ownershipError;

  const { user_id: _ignoredUserId, ...pagePayload } = payload;
  const safePayload = {
    ...pagePayload,
    user_id: auth.ownerId,
  };

  const { data, error } = await supabase
    .from("landing_pages")
    .upsert(safePayload, { onConflict: "id" })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  if (data) {
    try {
      const { orgId, projectId } = await resolveOrgAndProject(supabase, auth.ownerId);
      const virtualProjectId = getVirtualProjectId(orgId);

      const { data: wp } = await supabase
        .from("website_projects")
        .select("id")
        .eq("id", virtualProjectId)
        .maybeSingle();

      if (!wp && projectId) {
        await supabase.from("website_projects").insert({
          id: virtualProjectId,
          organization_id: orgId,
          project_id: projectId,
          name: "Landing Page Builder (Hệ thống)",
          domain: "builder-pages.local",
          status: "active",
        });
      }

      if (projectId) {
        const slug = String(data.slug || "");
        const pagePath = buildPlatformLandingPath(slug);
        const publishedAbs =
          data.status === "published" ? resolveLandingPublicViewUrl(slug) : null;
        await supabase.from("website_pages").upsert({
          id: data.id,
          organization_id: orgId,
          website_project_id: virtualProjectId,
          project_id: projectId,
          title: data.name || "Untitled Page",
          slug: data.slug,
          page_url: pagePath,
          page_type: "landing_page",
          status: data.status || "draft",
          published_url: publishedAbs,
          source_type: "builder",
          source_landing_page_id: data.id,
          sync_status: "synced",
          last_synced_at: new Date().toISOString(),
        });
      }
    } catch (syncErr) {
      console.warn("Failed to synchronize updated landing page to website_pages:", syncErr);
    }
  }

  return NextResponse.json({ page: data });
}