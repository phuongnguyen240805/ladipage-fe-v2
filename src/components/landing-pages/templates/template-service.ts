import { supabase } from "@/lib/supabase";

export interface ListTemplatesFilters {
  category?: string;
  search?: string;
  tag?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function listTemplates(filters?: ListTemplatesFilters) {
  if (!supabase) return [];

  let query = supabase
    .from("landing_page_templates")
    .select("*")
    .eq("is_published", true);

  if (filters?.category && filters.category !== "all") {
    // Standardize category matching
    query = query.eq("category", filters.category);
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }

  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  } else if (filters?.limit !== undefined) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[TemplateService] listTemplates failed:", error.message);
    throw error;
  }
  return data || [];
}

export async function getTemplateById(templateId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("landing_page_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (error) {
    console.error(`[TemplateService] getTemplateById failed for ${templateId}:`, error.message);
    return null;
  }
  return data;
}

export async function getTemplateByKey(templateKey: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("landing_page_templates")
    .select("*")
    .eq("template_key", templateKey)
    .single();

  if (error) {
    console.error(`[TemplateService] getTemplateByKey failed for ${templateKey}:`, error.message);
    return null;
  }
  return data;
}

export async function incrementTemplateViews(templateId: string) {
  if (!supabase) return;
  try {
    const { data: current } = await supabase
      .from("landing_page_templates")
      .select("views_count")
      .eq("id", templateId)
      .single();
    
    if (current) {
      await supabase
        .from("landing_page_templates")
        .update({ views_count: (current.views_count || 0) + 1 })
        .eq("id", templateId);
    }
  } catch (err) {
    console.error(`[TemplateService] incrementTemplateViews failed:`, err);
  }
}

export async function incrementTemplateDownloads(templateId: string) {
  if (!supabase) return;
  try {
    const { data: current } = await supabase
      .from("landing_page_templates")
      .select("downloads_count")
      .eq("id", templateId)
      .single();
    
    if (current) {
      await supabase
        .from("landing_page_templates")
        .update({ downloads_count: (current.downloads_count || 0) + 1 })
        .eq("id", templateId);
    }
  } catch (err) {
    console.error(`[TemplateService] incrementTemplateDownloads failed:`, err);
  }
}
