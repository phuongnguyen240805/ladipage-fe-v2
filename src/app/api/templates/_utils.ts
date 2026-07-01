import type { SupabaseClient } from "@supabase/supabase-js";
import { templateSeedData } from "@/components/landing-pages/templates/template-seed-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TemplateStatField = "views" | "downloads";

export function isValidTemplateUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

export function parseSeedTemplateKey(id: string): string | null {
  if (!id.startsWith("seed-")) return null;
  const key = id.slice(5).trim();
  return key || null;
}

export function getTemplateStatsClient() {
  return getSupabaseAdmin();
}

function seedPayloadFromKey(templateKey: string) {
  const seed = templateSeedData.find((item) => item.template_key === templateKey);
  if (!seed) return null;
  const now = new Date().toISOString();
  return {
    template_key: seed.template_key,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    tags: seed.tags,
    thumbnail_url: seed.thumbnail_url,
    preview_image_url: seed.preview_image_url,
    editor_data: seed.editor_data,
    is_published: seed.is_published,
    is_featured: seed.is_featured,
    price_type: seed.price_type,
    views_count: seed.views_count,
    downloads_count: seed.downloads_count,
    updated_at: now,
  };
}

export async function resolveTemplateRecordId(
  supabase: SupabaseClient,
  refs: { id?: string; template_key?: string },
): Promise<{ id: string } | { error: string; status: 404 | 500 }> {
  const seedKeyFromId = refs.id ? parseSeedTemplateKey(refs.id) : null;
  const templateKey = refs.template_key?.trim() || seedKeyFromId || undefined;

  if (refs.id && isValidTemplateUuid(refs.id)) {
    const { data, error } = await supabase
      .from("landing_page_templates")
      .select("id")
      .eq("id", refs.id)
      .maybeSingle();

    if (error) return { error: error.message, status: 500 };
    if (data?.id) return { id: String(data.id) };
  }

  if (templateKey) {
    const { data: existing, error: lookupError } = await supabase
      .from("landing_page_templates")
      .select("id")
      .eq("template_key", templateKey)
      .maybeSingle();

    if (lookupError) return { error: lookupError.message, status: 500 };
    if (existing?.id) return { id: String(existing.id) };

    const payload = seedPayloadFromKey(templateKey);
    if (!payload) {
      return { error: "Template not found.", status: 404 };
    }

    const { data: upserted, error: upsertError } = await supabase
      .from("landing_page_templates")
      .upsert(payload, { onConflict: "template_key" })
      .select("id")
      .single();

    if (upsertError) return { error: upsertError.message, status: 500 };
    return { id: String(upserted.id) };
  }

  return { error: "Template not found.", status: 404 };
}

export async function incrementTemplateStats(
  supabase: SupabaseClient,
  refs: { id?: string; template_key?: string },
  field: TemplateStatField,
) {
  const resolved = await resolveTemplateRecordId(supabase, refs);
  if ("error" in resolved) {
    return { error: resolved.error, status: resolved.status };
  }

  const templateId = resolved.id;
  const column = field === "views" ? "views_count" : "downloads_count";

  const { data: row, error: lookupError } = await supabase
    .from("landing_page_templates")
    .select(`id, ${column}`)
    .eq("id", templateId)
    .eq("is_published", true)
    .maybeSingle();

  if (lookupError) {
    return { error: lookupError.message, status: 500 as const };
  }
  if (!row) {
    return { error: "Template not found.", status: 404 as const };
  }

  const current = Number((row as Record<string, unknown>)[column] ?? 0);
  const nextValue = current + 1;
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("landing_page_templates")
    .update({ [column]: nextValue, updated_at: now })
    .eq("id", templateId);

  if (updateError) {
    return { error: updateError.message, status: 500 as const };
  }

  return {
    ok: true as const,
    template_id: templateId,
    field,
    views_count: field === "views" ? nextValue : undefined,
    downloads_count: field === "downloads" ? nextValue : undefined,
  };
}