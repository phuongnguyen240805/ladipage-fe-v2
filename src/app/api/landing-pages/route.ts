import { NextRequest, NextResponse } from "next/server";
import { getVirtualProjectId, resolveOrgAndProject } from "../ai-seo/apiUtils";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "./_auth";
import { assignPageTags, fetchPageTagsMap, normalizeTagIds } from "./_page-tags";

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
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const user = await getAuthenticatedUser(request);
  let query = supabase
    .from("landing_pages")
    .select("id, name, status, updated_at, editor_data, slug, user_id")
    .order("updated_at", { ascending: false });

  if (user?.id) {
    query = query.or(`user_id.eq.${user.id},user_id.is.null`);
  } else {
    query = query.is("user_id", null);
  }

  const { data, error } = await query;
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
    pages: pages.map((page) => ({
      ...page,
      tags: tagsByPageId[String(page.id)] ?? [],
    })),
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  const user = await getAuthenticatedUser(request);
  const payload = await request.json().catch(() => null);
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(isValidPageId) : [];
  if (ids.length === 0) return jsonError("No valid page ids provided.");

  if (user?.id) {
    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .in("id", ids)
      .or(`user_id.eq.${user.id},user_id.is.null`);
    if (error) return jsonError(error.message, 500);
  } else {
    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .in("id", ids)
      .is("user_id", null);
    if (error) return jsonError(error.message, 500);
  }

  return NextResponse.json({ deleted: ids });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  // Xác thực người dùng (Cho phép bỏ qua khi chạy thử)
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || null;

  const payload = await request.json();
  if (!isValidPageId(payload.id)) return jsonError("Invalid landing page id.");

  const tagIds = normalizeTagIds(payload.tag_ids);
  const { tag_ids: _tagIds, ...pagePayload } = payload;

  // Gán user_id (nếu có đăng nhập)
  const safePayload = {
    ...pagePayload,
    user_id: userId,
    status: payload.status || "draft",
    visibility: "private", // draft mới tạo luôn là private
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
      assignedTags = await assignPageTags(supabase, data.id, tagIds, userId);
    } catch (tagErr) {
      console.warn("Failed to assign landing page tags:", tagErr);
    }
  }

  // Synchronize to canonical website_pages table
  if (data) {
    try {
      const { orgId, projectId } = await resolveOrgAndProject(supabase, userId);
      const virtualProjectId = getVirtualProjectId(orgId);

      // Ensure virtual website project exists
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
          status: "active"
        });
      }

      // Upsert to website_pages
      if (projectId) {
        await supabase.from("website_pages").upsert({
          id: data.id,
          organization_id: orgId,
          website_project_id: virtualProjectId,
          project_id: projectId,
          title: data.name || "Untitled Page",
          slug: data.slug,
          page_url: `/p/${data.slug}`,
          page_type: "landing_page",
          status: data.status || "draft",
          published_url: data.status === "published" ? `/p/${data.slug}` : null,
          source_type: "builder",
          source_landing_page_id: data.id,
          sync_status: "synced",
          last_synced_at: new Date().toISOString()
        });
      }
    } catch (syncErr) {
      console.warn("Failed to synchronize newly created landing page to website_pages:", syncErr);
    }
  }

  return NextResponse.json({ page: { ...data, tags: assignedTags } });
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase server configuration is missing.", 500);
  }

  // Xác thực người dùng (Cho phép bỏ qua khi chạy thử)
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || null;

  const payload = await request.json();
  if (!isValidPageId(payload.id)) return jsonError("Invalid landing page id.");

  // Kiểm tra ownership trước khi upsert
  const { data: existingPage, error: lookupError } = await supabase
    .from("landing_pages")
    .select("id, user_id")
    .eq("id", payload.id)
    .maybeSingle();

  if (lookupError) return jsonError(lookupError.message, 500);

  // Nếu page đã tồn tại và thuộc về user khác -> 403
  if (existingPage && existingPage.user_id && userId && existingPage.user_id !== userId) {
    return jsonError("Forbidden. You do not own this page.", 403);
  }

  // Gán user_id nếu có đăng nhập, hoặc giữ nguyên user_id cũ
  const safePayload = {
    ...payload,
    user_id: payload.user_id || existingPage?.user_id || userId,
  };

  const { data, error } = await supabase
    .from("landing_pages")
    .upsert(safePayload, { onConflict: "id" })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  // Synchronize to canonical website_pages table
  if (data) {
    try {
      const { orgId, projectId } = await resolveOrgAndProject(supabase, userId);
      const virtualProjectId = getVirtualProjectId(orgId);

      // Ensure virtual website project exists
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
          status: "active"
        });
      }

      // Upsert to website_pages
      if (projectId) {
        await supabase.from("website_pages").upsert({
          id: data.id,
          organization_id: orgId,
          website_project_id: virtualProjectId,
          project_id: projectId,
          title: data.name || "Untitled Page",
          slug: data.slug,
          page_url: `/p/${data.slug}`,
          page_type: "landing_page",
          status: data.status || "draft",
          published_url: data.status === "published" ? `/p/${data.slug}` : null,
          source_type: "builder",
          source_landing_page_id: data.id,
          sync_status: "synced",
          last_synced_at: new Date().toISOString()
        });
      }
    } catch (syncErr) {
      console.warn("Failed to synchronize updated landing page to website_pages:", syncErr);
    }
  }

  return NextResponse.json({ page: data });
}
