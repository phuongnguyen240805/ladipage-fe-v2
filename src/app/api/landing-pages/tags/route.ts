import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import {
  canManageTag,
  deleteTagRow,
  formatTag,
  getTagById,
  getTagOwnerScope,
  isValidTagId,
  listVisibleTagsQuery,
} from "./_utils";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId } = await getTagOwnerScope(request);
  const { data, error } = await listVisibleTagsQuery(supabase, userId).order("updated_at", {
    ascending: false,
  });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({
    tags: (data ?? []).map((row: Record<string, unknown>) => formatTag(row)),
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId, isAuthenticated } = await getTagOwnerScope(request);
  if (!isAuthenticated) return jsonError("Unauthorized.", 401);

  const payload = await request.json().catch(() => null);
  const name = String(payload?.name ?? "").trim();
  if (!name) return jsonError("Tag name is required.");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("landing_tags")
    .insert([
      {
        name,
        user_id: userId,
        status: "UNLOCKED",
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ tag: formatTag(data) });
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId, isAuthenticated } = await getTagOwnerScope(request);
  if (!isAuthenticated) return jsonError("Unauthorized.", 401);

  const payload = await request.json().catch(() => null);
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(isValidTagId) : [];

  if (ids.length === 0) return jsonError("No valid tag ids provided.");

  for (const id of ids) {
    const { data: existing, error: lookupError } = await getTagById(supabase, id);
    if (lookupError) return jsonError(lookupError.message, 500);
    if (!existing) return jsonError(`Tag not found: ${id}`, 404);
    if (!canManageTag(existing, userId, isAuthenticated)) {
      return jsonError("Forbidden. You do not own this tag.", 403);
    }
    const { error } = await deleteTagRow(supabase, id);
    if (error) return jsonError(error.message, 500);
  }

  return NextResponse.json({ deleted: ids });
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId, isAuthenticated } = await getTagOwnerScope(request);
  if (!isAuthenticated) return jsonError("Unauthorized.", 401);

  const payload = await request.json().catch(() => null);
  const tagId = typeof payload?.id === "string" ? payload.id : "";
  if (!isValidTagId(tagId)) return jsonError("Invalid tag id.");

  const name = payload?.name !== undefined ? String(payload.name).trim() : undefined;
  const status =
    payload?.status === "LOCKED" || payload?.status === "UNLOCKED"
      ? payload.status
      : undefined;

  if (!name && !status) return jsonError("Nothing to update.");
  if (name === "") return jsonError("Tag name is required.");

  const { data: existing, error: lookupError } = await getTagById(supabase, tagId);
  if (lookupError) return jsonError(lookupError.message, 500);
  if (!existing) return jsonError("Tag not found.", 404);
  if (!canManageTag(existing, userId, isAuthenticated)) {
    return jsonError("Forbidden. You do not own this tag.", 403);
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  if (status) patch.status = status;

  const { data, error } = await supabase
    .from("landing_tags")
    .update(patch)
    .eq("id", tagId)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ tag: formatTag(data) });
}