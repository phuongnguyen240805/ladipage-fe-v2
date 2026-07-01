import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "../_auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formatLead(row: Record<string, unknown>) {
  const created = row.created_at ? new Date(String(row.created_at)) : new Date();
  const createdAt =
    created.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    ", " +
    created.toLocaleDateString("vi-VN");
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    landingPage: String(row.landing_page_slug ?? ""),
    createdAt,
    status: String(row.status ?? "Mới"),
    errorMessage: row.error_message ? String(row.error_message) : undefined,
    isError: Boolean(row.is_error),
  };
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const user = await getAuthenticatedUser(request);
  let query = supabase.from("landing_leads").select("*").order("created_at", { ascending: false });
  if (user?.id) query = query.or(`user_id.eq.${user.id},user_id.is.null`);
  else query = query.is("user_id", null);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  const rows = (data ?? []).map(formatLead);
  return NextResponse.json({
    leads: rows.filter((r) => !r.isError),
    errorLeads: rows
      .filter((r) => r.isError)
      .map(({ errorMessage, ...rest }) => ({
        ...rest,
        errorMessage: errorMessage ?? "",
      })),
  });
}