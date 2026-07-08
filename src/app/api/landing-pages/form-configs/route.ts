import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { requireLandingPageOwner } from "../_ownership";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formatConfig(row: Record<string, unknown>) {
  const updated = row.updated_at ? new Date(String(row.updated_at)) : new Date();
  const type = String(row.type ?? "API");
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    linkedAccounts: Number(row.linked_accounts ?? 0),
    type: (type === "Google Forms" || type === "OTP" ? type : "API") as "Google Forms" | "API" | "OTP",
    status: (row.status === "INACTIVE" ? "INACTIVE" : "ACTIVE") as "ACTIVE" | "INACTIVE",
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
    .from("landing_form_configs")
    .select("*")
    .eq("user_id", auth.ownerId)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ configs: (data ?? []).map(formatConfig) });
}

export async function POST(request: NextRequest) {
  const auth = await requireLandingPageOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const payload = await request.json().catch(() => null);
  const name = String(payload?.name ?? "").trim();
  const type = String(payload?.type ?? "API");
  if (!name) return jsonError("Form config name is required.");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("landing_form_configs")
    .insert([
      {
        name,
        type,
        user_id: auth.ownerId,
        linked_accounts: 1,
        status: "ACTIVE",
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ config: formatConfig(data) });
}