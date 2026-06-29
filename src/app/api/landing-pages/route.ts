import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVirtualProjectId, resolveOrgAndProject } from "../ai-seo/apiUtils";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidPageId(pageId: unknown): pageId is string {
  return typeof pageId === "string" && UUID_PATTERN.test(pageId);
}

function resolveSupabaseUrl() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

/** Admin client dùng service_role key — chỉ dùng server-side */
function getSupabaseAdmin() {
  const url = resolveSupabaseUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !url.startsWith("http") || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** User client dùng anon key + JWT của người dùng để verify identity */
function getSupabaseWithUserJwt(jwt: string) {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Lấy user từ JWT trong Authorization header.
 * Trả về user object nếu hợp lệ, hoặc null nếu không xác thực được.
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice(7).trim();
  if (!jwt) return null;

  const userClient = getSupabaseWithUserJwt(jwt);
  if (!userClient) return null;

  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError("Supabase server configuration is missing.", 500);

  // Xác thực người dùng (Cho phép bỏ qua khi chạy thử)
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || null;

  const payload = await request.json();
  if (!isValidPageId(payload.id)) return jsonError("Invalid landing page id.");

  // Gán user_id (nếu có đăng nhập)
  const safePayload = {
    ...payload,
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

  return NextResponse.json({ page: data });
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError("Supabase server configuration is missing.", 500);

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
