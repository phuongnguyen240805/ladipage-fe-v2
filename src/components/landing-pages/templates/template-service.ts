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

const templateListRequests = new Map<string, Promise<unknown[]>>();
const TEMPLATE_LIST_RETRY_DELAY_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function fetchTemplateItems(url: string): Promise<unknown[]> {
  let lastNetworkError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) {
      await wait(TEMPLATE_LIST_RETRY_DELAY_MS);
    }

    try {
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          formatApiErrorBody(
            payload,
            `Không tải được danh sách template (HTTP ${response.status}).`,
          ),
        );
      }

      const body = (await response.json()) as { items?: unknown[] };
      return body.items ?? [];
    } catch (error) {
      if (!(error instanceof TypeError) || attempt === 1) {
        throw error;
      }
      lastNetworkError = error;
    }
  }

  throw lastNetworkError;
}

export async function listTemplates(filters?: ListTemplatesFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.is_featured) params.set("is_featured", "true");

  const query = params.toString();
  const url = `/api/templates/list${query ? `?${query}` : ""}`;
  let request = templateListRequests.get(url);
  if (!request) {
    request = fetchTemplateItems(url);
    templateListRequests.set(url, request);
  }

  try {
    const items = await request;
    if (filters?.offset !== undefined || filters?.limit !== undefined) {
      const offset = filters.offset ?? 0;
      const limit = filters.limit ?? items.length;
      return items.slice(offset, offset + limit);
    }
    return items;
  } finally {
    if (templateListRequests.get(url) === request) {
      templateListRequests.delete(url);
    }
  }
}

type TemplateDetailPayload = {
  editor_data?: unknown;
  editor_data_url?: string | null;
} & Record<string, unknown>;

function artifactCandidateUrls(editorDataUrl: string): string[] {
  const urls = [editorDataUrl];
  if (/^https?:\/\//i.test(editorDataUrl)) {
    try {
      urls.push(new URL(editorDataUrl).pathname);
    } catch {
      /* keep the original absolute URL only */
    }
  }
  return [...new Set(urls.filter(Boolean))];
}

async function fetchEditorDataFromUrl(editorDataUrl: string): Promise<unknown | null> {
  for (const url of artifactCandidateUrls(editorDataUrl)) {
    try {
      const response = await fetch(url, {
        cache: "force-cache",
        credentials: "same-origin",
      });
      if (!response.ok) continue;
      return await response.json();
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

async function hydrateTemplateDetail(
  payload: TemplateDetailPayload,
): Promise<TemplateDetailPayload> {
  if (payload.editor_data || !payload.editor_data_url) return payload;
  const editorData = await fetchEditorDataFromUrl(payload.editor_data_url);
  return editorData ? { ...payload, editor_data: editorData } : payload;
}

export async function loadTemplateEditorData(input: {
  id: string;
  editor_data?: unknown;
  editor_data_url?: string | null;
}): Promise<unknown | null> {
  if (input.editor_data) return input.editor_data;

  try {
    const detail = (await getTemplateById(input.id)) as TemplateDetailPayload | null;
    if (detail?.editor_data) return detail.editor_data;
    const url = detail?.editor_data_url || input.editor_data_url;
    if (url) return fetchEditorDataFromUrl(url);
  } catch {
    if (input.editor_data_url) return fetchEditorDataFromUrl(input.editor_data_url);
  }

  return null;
}

export async function getTemplateById(templateId: string) {
  const params = new URLSearchParams({ id: templateId });
  const response = await fetch(`/api/templates/detail?${params.toString()}`, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      formatApiErrorBody(
        payload,
        `Không tải được template (HTTP ${response.status}).`,
      ),
    );
  }

  return hydrateTemplateDetail((await response.json()) as TemplateDetailPayload);
}

export async function getTemplateByKey(templateKey: string) {
  const params = new URLSearchParams({ template_key: templateKey });
  const response = await fetch(`/api/templates/detail?${params.toString()}`, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      formatApiErrorBody(
        payload,
        `Không tải được template (HTTP ${response.status}).`,
      ),
    );
  }

  return hydrateTemplateDetail((await response.json()) as TemplateDetailPayload);
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
