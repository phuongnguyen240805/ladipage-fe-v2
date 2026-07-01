import { createClient } from "@supabase/supabase-js";

export interface PublicLandingTemplate {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  thumbnail_url: string | null;
  preview_image_url: string | null;
  preview_html: string | null;
  published_html: string | null;
  published_at: string | null;
}

export interface PublicLandingTemplateSdkConfig {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  thumbnailUrl: string | null;
  renderUrl: string;
  minHeight: number;
  publishedAt: string | null;
}

export interface PublicLandingTemplateListItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  thumbnailUrl: string | null;
  previewUrl: string;
}

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

function getPublicSupabaseClient() {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !url.startsWith("http") || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type AdminTemplateRow = {
  id: string;
  name: string;
  template_key?: string | null;
  category?: string | null;
  thumbnail_url?: string | null;
  preview_image_url?: string | null;
  created_at?: string | null;
};

function mapAdminRowToPublic(row: AdminTemplateRow): PublicLandingTemplate {
  return {
    id: row.id,
    name: row.name,
    slug: row.template_key ?? row.id,
    category: row.category ?? null,
    thumbnail_url: row.thumbnail_url ?? null,
    preview_image_url: row.preview_image_url ?? null,
    preview_html: null,
    published_html: null,
    published_at: row.created_at ?? null,
  };
}

function toThumbnailUrl(template: Pick<PublicLandingTemplate, "thumbnail_url" | "preview_image_url">) {
  return template.thumbnail_url || template.preview_image_url || null;
}

export function toTemplateSdkConfig(template: PublicLandingTemplate): PublicLandingTemplateSdkConfig {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
    thumbnailUrl: toThumbnailUrl(template),
    renderUrl: `/templates/${encodeURIComponent(template.slug)}?embed=1`,
    minHeight: 720,
    publishedAt: template.published_at,
  };
}

export function toTemplateListItem(template: PublicLandingTemplate): PublicLandingTemplateListItem {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
    thumbnailUrl: toThumbnailUrl(template),
    previewUrl: `/templates/${encodeURIComponent(template.slug)}`,
  };
}

export async function getPublicLandingTemplateByIdOrSlug(input: {
  templateId?: string;
  slug?: string;
}): Promise<PublicLandingTemplate | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  let query = supabase
    .from("landing_page_templates")
    .select("id, name, template_key, category, thumbnail_url, preview_image_url, editor_data, created_at")
    .eq("is_published", true);

  if (input.templateId) {
    query = query.eq("id", input.templateId);
  } else if (input.slug) {
    query = query.eq("template_key", input.slug);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return mapAdminRowToPublic(data as AdminTemplateRow);
}

export async function listPublicLandingTemplates(input: {
  category?: string;
  limit?: number;
} = {}): Promise<PublicLandingTemplate[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("landing_page_templates")
    .select("id, name, template_key, category, thumbnail_url, preview_image_url, editor_data, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 24);

  if (input.category) {
    query = query.eq("category", input.category);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as AdminTemplateRow[]).map(mapAdminRowToPublic);
}
