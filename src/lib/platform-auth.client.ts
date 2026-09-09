import { useAuthStore } from "@/features/auth/stores/auth.store";

export interface PlatformAuthTokenOptions {
  preferNest?: boolean;
}

/**
 * Platform authentication is backend-owned. BFF requests use the Nest access
 * token only; Supabase browser sessions are not part of the platform session.
 */
export async function getPlatformAuthToken(
  _options: PlatformAuthTokenOptions = {},
): Promise<string | null> {
  return useAuthStore.getState().platform.nestToken ?? null;
}

export async function getPlatformAuthHeaders(
  options: PlatformAuthTokenOptions = {},
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getPlatformAuthToken(options);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
