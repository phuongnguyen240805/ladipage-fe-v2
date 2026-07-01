import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/** Token gửi kèm BFF landing/builder — ưu tiên Supabase, fallback Nest legacy. */
export async function getPlatformAuthToken(): Promise<string | null> {
  const { platform, platformStatus } = useAuthStore.getState();
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

export async function getPlatformAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getPlatformAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}