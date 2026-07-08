import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "../_auth";
import { resolvePlatformUser } from "@/lib/platform-auth.server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidTagId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

export function formatTag(row: Record<string, unknown>, count = 0) {
  const created = row.created_at ? new Date(String(row.created_at)) : new Date();
  const updated = row.updated_at ? new Date(String(row.updated_at)) : created;
  const fmt = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    ", " +
    d.toLocaleDateString("vi-VN");
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    count,
    createdAt: fmt(created),
    status: (row.status === "LOCKED" ? "LOCKED" : "UNLOCKED") as "LOCKED" | "UNLOCKED",
    updatedAt: fmt(updated),
  };
}

export async function getTagOwnerScope(request: NextRequest) {
  const [user, platformUser] = await Promise.all([
    getAuthenticatedUser(request),
    resolvePlatformUser(request),
  ]);
  return {
    userId: user?.id ?? null,
    isAuthenticated: Boolean(platformUser),
  };
}

export function canManageTag(
  tag: { user_id?: string | null },
  userId: string | null,
  isAuthenticated: boolean,
): boolean {
  if (!isAuthenticated || !userId) return false;
  if (!tag.user_id) return false;
  return tag.user_id === userId;
}

export function listVisibleTagsQuery(supabase: SupabaseClient, userId: string) {
  return supabase.from("landing_tags").select("*").eq("user_id", userId);
}

export async function getTagById(supabase: SupabaseClient, tagId: string) {
  return supabase.from("landing_tags").select("*").eq("id", tagId).maybeSingle();
}

export async function updateTagRow(
  supabase: SupabaseClient,
  tagId: string,
  patch: Record<string, unknown>,
) {
  return supabase.from("landing_tags").update(patch).eq("id", tagId).select().single();
}

export async function deleteTagRow(supabase: SupabaseClient, tagId: string) {
  return supabase.from("landing_tags").delete().eq("id", tagId);
}

export async function deleteTagRows(supabase: SupabaseClient, ids: string[]) {
  return supabase.from("landing_tags").delete().in("id", ids);
}