import type { EditorData } from "@/components/landing-pages/editor/types";
import { formatApiErrorBody } from "@/lib/format-api-error";

type BuilderPageRecord = {
  id?: string;
  name?: string;
  slug?: string;
  status?: string;
  visibility?: string;
  updated_at?: string;
  editor_data?: Record<string, unknown>;
};

type BuilderDraftResponse = {
  savedAt?: string;
  page?: BuilderPageRecord;
};

type BuilderPageResponse = {
  page?: BuilderPageRecord;
};

type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function getBuilderSessionTokenFromSearch(search: string): string | null {
  const token = new URLSearchParams(search).get("session");
  return token && token.trim() ? token : null;
}

/** Load landing page via BFF admin client — bypasses Supabase RLS for Nest JWT sessions. */
export async function loadBuilderPage({
  pageId,
  sessionToken,
  fetcher = fetch,
}: {
  pageId: string;
  sessionToken: string;
  fetcher?: Fetcher;
}): Promise<BuilderPageRecord | null> {
  const response = await fetcher(`/api/builder/pages/${encodeURIComponent(pageId)}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "x-builder-session": sessionToken,
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(formatApiErrorBody(result, `Cannot load builder page (${response.status}).`));
  }

  const body = (await response.json()) as BuilderPageResponse;
  return body.page ?? null;
}

export async function saveBuilderDraft({
  pageId,
  editorData,
  name,
  slug,
  sessionToken,
  fetcher = fetch,
}: {
  pageId: string;
  editorData: EditorData | Record<string, unknown>;
  name?: string;
  slug?: string;
  sessionToken?: string | null;
  fetcher?: Fetcher;
}): Promise<BuilderDraftResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers["x-builder-session"] = sessionToken;
  }

  const response = await fetcher(`/api/builder/pages/${encodeURIComponent(pageId)}`, {
    method: "PATCH",
    credentials: "include",
    headers,
    body: JSON.stringify({
      editor_data: editorData,
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      formatApiErrorBody(result, `Cannot save builder draft (${response.status}).`)
    );
  }

  return response.json().catch(() => ({}));
}