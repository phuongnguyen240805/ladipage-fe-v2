import { formatApiErrorBody } from "@/lib/format-api-error";

export interface ListTemplatesFilters {
  category?: string;
  search?: string;
  tag?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

export type TemplateStatRefs = {
  id: string;
  template_key?: string;
};

type IncrementStatResult = {
  ok?: boolean;
  template_id?: string;
  field?: "views" | "downloads";
  views_count?: number;
  downloads_count?: number;
};

export async function listTemplates(filters?: ListTemplatesFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.is_featured) params.set("is_featured", "true");

  const query = params.toString();
  const response = await fetch(`/api/templates/list${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatApiErrorBody(payload, `Không tải được danh sách template (HTTP ${response.status}).`));
  }

  const body = (await response.json()) as { items?: unknown[] };
  const items = body.items ?? [];
  if (filters?.offset !== undefined || filters?.limit !== undefined) {
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? items.length;
    return items.slice(offset, offset + limit);
  }
  return items;
}

export async function getTemplateById(templateId: string) {
  const items = (await listTemplates()) as Array<{ id: string }>;
  return items.find((item) => item.id === templateId) ?? null;
}

export async function getTemplateByKey(templateKey: string) {
  const items = (await listTemplates()) as Array<{ template_key?: string }>;
  return items.find((item) => item.template_key === templateKey) ?? null;
}

async function incrementTemplateStat(
  refs: TemplateStatRefs,
  field: "views" | "downloads",
) {
  const response = await fetch("/api/templates/stats", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: refs.id,
      template_key: refs.template_key,
      field,
    }),
  });

  const payload = (await response.json().catch(() => null)) as IncrementStatResult | null;

  if (!response.ok) {
    throw new Error(formatApiErrorBody(payload, `Cannot increment template ${field} (HTTP ${response.status}).`));
  }

  return payload ?? { ok: true };
}

export async function incrementTemplateViews(refs: TemplateStatRefs) {
  try {
    return await incrementTemplateStat(refs, "views");
  } catch (err) {
    console.warn("[TemplateService] increment views failed:", err);
    return null;
  }
}

export async function incrementTemplateDownloads(refs: TemplateStatRefs) {
  try {
    return await incrementTemplateStat(refs, "downloads");
  } catch (err) {
    console.warn("[TemplateService] increment downloads failed:", err);
    return null;
  }
}