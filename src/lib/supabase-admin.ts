import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function resolveSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      ref?: string;
    };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    undefined
  );
}

export function getSupabaseAdminConfigError(): string | null {
  const url = resolveSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !url.startsWith("http")) {
    return "Supabase URL is missing. Set NEXT_PUBLIC_SUPABASE_URL in .env.";
  }
  if (!key) {
    return "Supabase service role key is missing. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env (Supabase Dashboard → Settings → API → service_role).";
  }
  return null;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = resolveSupabaseUrl();
  const secretKey = getSupabaseServiceRoleKey();
  if (!url || !url.startsWith("http") || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}