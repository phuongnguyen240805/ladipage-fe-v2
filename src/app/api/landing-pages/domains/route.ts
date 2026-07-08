import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { requireLandingPageOwner } from "../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formatRow(row: Record<string, unknown>) {
  const updated = row.updated_at ? new Date(String(row.updated_at)) : new Date();
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    status: (row.status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED") as "VERIFIED" | "UNVERIFIED",
    platform: String(row.platform ?? "Ladipage"),
    sslStatus: (row.ssl_status === "ACTIVE" ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
    updatedAt:
      updated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      ", " +
      updated.toLocaleDateString("vi-VN"),
  };
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
  return NextResponse.json({ domains: (data ?? []).map(formatRow) });
}

export async function POST(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const payload = await request.json().catch(() => null);
  const name = String(payload?.name ?? "").trim();
  const platform = String(payload?.platform ?? "Ladipage").trim();
  if (!name) return jsonError("Domain name is required.");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("landing_domains")
    .insert([
      {
        name,
        platform,
        user_id: auth.ownerId,
        status: "VERIFIED",
        ssl_status: "ACTIVE",
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ domain: formatRow(data) });
}