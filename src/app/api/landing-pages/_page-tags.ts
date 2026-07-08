import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidTagId } from "./tags/_utils";

export type PageTagRef = { id: string; name: string };

export function normalizeTagIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of raw) {
    if (!isValidTagId(item) || seen.has(item)) continue;
    seen.add(item);
    ids.push(item);
  }
  return ids;
}

export async function fetchPageTagsMap(
  supabase: SupabaseClient,
  pageIds: string[],
): Promise<Record<string, PageTagRef[]>> {
  const map: Record<string, PageTagRef[]> = {};
  if (pageIds.length === 0) return map;

  const { data, error } = await supabase
    .from("landing_page_tags")
    .select("page_id, tag_id, landing_tags(id, name)")
    .in("page_id", pageIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const pageId = String(row.page_id);
    const tag = row.landing_tags as { id?: string; name?: string } | null;
    if (!tag?.id) continue;
    if (!map[pageId]) map[pageId] = [];
    map[pageId].push({ id: String(tag.id), name: String(tag.name ?? "") });
  }

  for (const pageId of pageIds) {
    if (!map[pageId]) map[pageId] = [];
  }

  return map;
}

export async function assignPageTags(
  supabase: SupabaseClient,
  pageId: string,
  tagIds: string[],
  userId: string | null,
): Promise<PageTagRef[]> {
  if (tagIds.length === 0) return [];

  if (!userId) return [];

  const tagQuery = supabase
    .from("landing_tags")
    .select("id, name")
    .in("id", tagIds)
    .eq("user_id", userId);

  const { data: allowedTags, error: tagError } = await tagQuery;
  if (tagError) throw tagError;

  const allowedIds = (allowedTags ?? []).map((t) => String(t.id));
  if (allowedIds.length === 0) return [];

  const rows = allowedIds.map((tagId) => ({ page_id: pageId, tag_id: tagId }));
  const { error: insertError } = await supabase.from("landing_page_tags").insert(rows);
  if (insertError) throw insertError;

  return (allowedTags ?? []).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ""),
  }));
}

export async function fetchTagUsageCounts(
  supabase: SupabaseClient,
  tagIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (tagIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("landing_page_tags")
    .select("tag_id")
    .in("tag_id", tagIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const tagId = String(row.tag_id);
    counts[tagId] = (counts[tagId] ?? 0) + 1;
  }

  return counts;
}