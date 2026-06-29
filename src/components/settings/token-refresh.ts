import type { FacebookTokenSet } from "@/features/auth/types";
import type { RefreshTokenResult } from "./types";

export function isMockToken(value?: string) {
  return String(value || "").includes("_MOCK_");
}

export function isMockCookie(value?: string) {
  const cookie = String(value || "");
  return cookie.includes("mock_session") || cookie.includes("xs=mock_") || cookie.includes("mock_session_xs_value");
}

export function sanitizeToken(value?: string) {
  const trimmedValue = String(value || "").trim();
  return isMockToken(trimmedValue) ? "" : trimmedValue;
}

export function sanitizeCookie(value?: string) {
  const trimmedValue = String(value || "").trim();
  return isMockCookie(trimmedValue) ? "" : trimmedValue;
}

export function sanitizeTokenSet(tokens: FacebookTokenSet): FacebookTokenSet {
  return {
    eaag: sanitizeToken(tokens.eaag) || undefined,
    eaab: sanitizeToken(tokens.eaab) || undefined,
    eaai: sanitizeToken(tokens.eaai) || undefined,
    eaah: sanitizeToken(tokens.eaah) || undefined,
  };
}

export function normalizeTokenResult(result: RefreshTokenResult | FacebookTokenSet): FacebookTokenSet {
  const data = "data" in result && result.data ? result.data : {};

  return sanitizeTokenSet({
    eaag: ("eaag" in result ? result.eaag : undefined) || data.accessToken || data.EAAG,
    eaab: ("eaab" in result ? result.eaab : undefined) || data.accessToken2 || data.EAAB,
    eaai: ("eaai" in result ? result.eaai : undefined) || data.accessToken4 || data.EAAI,
    eaah: ("eaah" in result ? result.eaah : undefined) || data.accessToken5 || data.EAAH,
  });
}
