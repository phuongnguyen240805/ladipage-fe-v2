import { NextResponse } from "next/server";
import {
  getTemplateStatsClient,
  incrementTemplateStats,
  type TemplateStatField,
} from "../_utils";
import { getSupabaseAdminConfigError } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: { id?: string; template_key?: string; field?: TemplateStatField };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (body.field !== "views" && body.field !== "downloads") {
    return jsonError("Invalid field", 400);
  }

  const id = typeof body.id === "string" ? body.id.trim() : undefined;
  const template_key = typeof body.template_key === "string" ? body.template_key.trim() : undefined;

  if (!id && !template_key) {
    return jsonError("Template id or template_key is required.", 400);
  }

  const supabase = getTemplateStatsClient();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase not configured.", 503);
  }

  const result = await incrementTemplateStats(
    supabase,
    { id, template_key },
    body.field,
  );

  if ("error" in result) {
    return jsonError(result.error || "Failed to update template stats.", result.status);
  }

  return NextResponse.json(result);
}