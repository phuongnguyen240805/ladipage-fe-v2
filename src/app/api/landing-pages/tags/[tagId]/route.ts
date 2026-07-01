import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";
import {
  canManageTag,
  formatTag,
  getTagById,
  getTagOwnerScope,
  isValidTagId,
  updateTagRow,
  deleteTagRow,
} from "../_utils";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ tagId: string }> }
) {
  const { tagId } = await props.params;
  if (!isValidTagId(tagId)) return jsonError("Invalid tag id.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId, isAuthenticated } = await getTagOwnerScope(request);
  if (!isAuthenticated) return jsonError("Unauthorized.", 401);

  const payload = await request.json().catch(() => null);
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

  const { data, error } = await updateTagRow(supabase, tagId, patch);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ tag: formatTag(data) });
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ tagId: string }> }
) {
  const { tagId } = await props.params;
  if (!isValidTagId(tagId)) return jsonError("Invalid tag id.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonError(getSupabaseAdminConfigError() ?? "Supabase config missing.", 500);

  const { userId, isAuthenticated } = await getTagOwnerScope(request);
  if (!isAuthenticated) return jsonError("Unauthorized.", 401);

  const { data: existing, error: lookupError } = await getTagById(supabase, tagId);

  if (lookupError) return jsonError(lookupError.message, 500);
  if (!existing) return jsonError("Tag not found.", 404);
  if (!canManageTag(existing, userId, isAuthenticated)) {
    return jsonError("Forbidden. You do not own this tag.", 403);
  }

  const { error } = await deleteTagRow(supabase, tagId);
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ deleted: tagId });
}