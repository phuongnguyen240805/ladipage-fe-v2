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
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatApiErrorBody(body, `Request failed (${response.status}).`));
  }
  return body as T;
}