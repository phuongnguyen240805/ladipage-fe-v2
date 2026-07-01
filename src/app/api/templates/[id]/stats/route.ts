import { NextResponse } from "next/server";
import {
  getTemplateStatsClient,
  incrementTemplateStats,
  parseSeedTemplateKey,
  type TemplateStatField,
} from "../../_utils";
import { getSupabaseAdminConfigError } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: routeId } = await context.params;

  let body: { field?: TemplateStatField; template_key?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (body.field !== "views" && body.field !== "downloads") {
    return jsonError("Invalid field", 400);
  }

  const supabase = getTemplateStatsClient();
  if (!supabase) {
    return jsonError(getSupabaseAdminConfigError() ?? "Supabase not configured.", 503);
  }

  const result = await incrementTemplateStats(
    supabase,
    {
      id: routeId,
      template_key: body.template_key?.trim() || parseSeedTemplateKey(routeId) || undefined,
    },
    body.field,
  );

  if ("error" in result) {
    return jsonError(result.error || "Failed to update template stats.", result.status);
  }

  return NextResponse.json(result);
}