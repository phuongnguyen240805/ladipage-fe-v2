import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Smart fallback if SUPABASE_URL in env.local is a JWT token instead of a URL
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  if (supabaseUrl.startsWith("eyJ")) {
    try {
      const parts = supabaseUrl.split(".");
      if (parts[1]) {
        // Normalize base64url to standard base64 for window.atob compatibility
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        // Base64 decode compatible with both Node and browser environments
        const decoded = typeof window !== "undefined"
          ? window.atob(base64)
          : Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(decoded) as { ref?: string };
        if (payload && payload.ref) {
          supabaseUrl = `https://${payload.ref}.supabase.co`;
        }
      }
    } catch (e) {
      console.warn("Failed to parse SUPABASE_URL as JWT:", e);
    }
  }
}

const isConfigured = !!(supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    "Supabase configuration is missing or invalid. Using local storage mode only."
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
