import type { AuthMode } from "@liora/api-types";

export function getAuthMode(): AuthMode {
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE?.toLowerCase();
  if (mode === "supabase") return "supabase";
  return "legacy";
}

export function isLegacyAuthMode(): boolean {
  return getAuthMode() === "legacy";
}