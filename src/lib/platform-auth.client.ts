import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export interface PlatformAuthTokenOptions {
  preferNest?: boolean;
}

/** BFF token helper. Defaults to Supabase first; builder can opt into Nest-first ownership checks. */
export async function getPlatformAuthToken(
  options: PlatformAuthTokenOptions = {},
): Promise<string | null> {
  const { platform, platformStatus } = useAuthStore.getState();
  if (options.preferNest && platform.nestToken) return platform.nestToken;

  if (platformStatus === "authenticated") {
    if (platform.supabaseAccessToken) return platform.supabaseAccessToken;
    if (platform.nestToken) return platform.nestToken;
  }

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) return data.session.access_token;
    } catch {
      // ignore
    }
  }

  return platform.nestToken ?? null;
}

export async function getPlatformAuthHeaders(
  options: PlatformAuthTokenOptions = {},
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getPlatformAuthToken(options);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
