import { getPlatformAuthHeaders, getPlatformAuthToken } from "@/lib/platform-auth.client";
import { formatApiErrorBody } from "@/lib/format-api-error";

export { getPlatformAuthToken };

export async function getLandingApiHeaders(): Promise<Record<string, string>> {
  return getPlatformAuthHeaders();
}

export async function landingApiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = await getLandingApiHeaders();
  const mergedHeaders = new Headers(headers);
  new Headers(init?.headers).forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  const request = () => fetch(path, {
    ...init,
    credentials: "include",
    headers: mergedHeaders,
  });

  let response: Response;
  try {
    response = await request();
  } catch (error) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (
      method !== "GET" ||
      init?.signal?.aborted ||
      !(error instanceof TypeError)
    ) {
      throw error;
    }
    // Dev-server recompiles and short network interruptions can drop a
    // same-origin request. Retrying idempotent reads avoids blank sub-views.
    response = await request();
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatApiErrorBody(body, `Request failed (${response.status}).`));
  }
  return body as T;
}
