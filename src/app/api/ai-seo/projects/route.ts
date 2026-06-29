import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonError } from "../apiUtils";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getSupabaseWithJwt(jwt: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const jwt = auth.slice(7).trim();
  const client = getSupabaseWithJwt(jwt);
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user?.id || null;
}

/**
 * GET /api/ai-seo/projects
 * Lấy danh sách landing pages của user và hiển thị trực tiếp trên dashboard AI SEO.
 * Mỗi landing page = 1 thẻ dự án SEO, không cần tạo bảng organizations/projects trung gian.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return jsonError(new Error("Supabase chưa được cấu hình"), "Cấu hình Supabase thiếu");
    }

    // Lấy user_id từ JWT để filter landing pages của đúng user hoặc các trang chưa gán user_id
    const userId = await getUserId(request);

    // Query landing_pages - lấy các trang của user hiện tại HOẶC các trang có user_id = null (do import HTML/ZIP vãng lai) để hiển thị đầy đủ
    let query = supabase.from("landing_pages").select("*").order("updated_at", { ascending: false });
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data: landingPages, error } = await query;

    if (error) {
      return jsonError(error, "Không thể lấy danh sách landing pages");
    }

    if (!landingPages || landingPages.length === 0) {
      return NextResponse.json([]);
    }

    // Map mỗi landing page thành 1 card AI SEO project
    const mapped = landingPages.map((lp: any) => ({
      id: lp.id,
      uuid: lp.id,
      projectId: lp.id,
      hostname: lp.slug || lp.name || "untitled",
      name: lp.name || "Untitled Page",
      slug: lp.slug,
      status: lp.status || "draft",
      siteAudit: {},
      readyForProcessing: false,
      isFirstProcessing: true,
      taskStatus: "pending",
      pixelTagState: "not_installed",
      isFrozen: false,
      isFavorite: false,
      isEngaged: true,
      atRiskOfWipe: false,
      daysUntilWipe: null,
      wipeScheduledAt: null,
      lastAnalysis: null,
      nextAnalysisAt: null,
      timeSavedTotal: 0,
      createdAt: lp.created_at,
      updatedAt: lp.updated_at,
      publishedAt: lp.published_at || null,
      connectedData: {
        isGscConnected: false,
        isGbpConnected: false,
        gscDetails: {},
        gbpDetailsV2: {}
      },
      afterSummary: {
        healthyPages: 0,
        totalPages: 0
      },
      holisticScores: {
        technicalsScore: 0,
        uxScore: 0,
        authorityScore: 0,
        contentScore: 0
      },
      aiGradeOverall: 0
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("GET /api/ai-seo/projects error:", err);
    return jsonError(err, "Lỗi máy chủ");
  }
}

/**
 * POST /api/ai-seo/projects
 * Tạo landing page mới (sẽ được hiển thị tự động trong dashboard AI SEO).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return jsonError(new Error("Supabase chưa được cấu hình"), "Cấu hình Supabase thiếu");
    }

    const userId = await getUserId(request);
    const body = await request.json();
    const { hostname, name } = body;

    if (!hostname) {
      return NextResponse.json({ error: "Thiếu tham số: hostname (tên miền trang)" }, { status: 400 });
    }

    // Tạo slug từ hostname
    const slug = hostname
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
      .replace(/^-+|-+$/g, "");

    const { data: lp, error } = await supabase
      .from("landing_pages")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId || null,
        name: name || hostname,
        slug,
        status: "draft",
        editor_data: {}
      })
      .select()
      .single();

    if (error || !lp) {
      return jsonError(error || new Error("Không tạo được trang"), "Tạo dự án thất bại");
    }

    return NextResponse.json({
      id: lp.id,
      uuid: lp.id,
      projectId: lp.id,
      hostname: lp.slug,
      name: lp.name,
      slug: lp.slug,
      status: lp.status,
      createdAt: lp.created_at,
      updatedAt: lp.updated_at,
      taskStatus: "pending",
      pixelTagState: "not_installed",
      isFavorite: false,
      isEngaged: true,
      isFrozen: false,
      atRiskOfWipe: false,
      connectedData: { isGscConnected: false, isGbpConnected: false, gscDetails: {}, gbpDetailsV2: {} },
      afterSummary: { healthyPages: 0, totalPages: 0 },
      holisticScores: { technicalsScore: 0, uxScore: 0, authorityScore: 0, contentScore: 0 },
      aiGradeOverall: 0,
      siteAudit: {},
      readyForProcessing: false,
      isFirstProcessing: true,
      timeSavedTotal: 0
    });
  } catch (err: any) {
    console.error("POST /api/ai-seo/projects error:", err);
    return jsonError(err, "Lỗi máy chủ");
  }
}
