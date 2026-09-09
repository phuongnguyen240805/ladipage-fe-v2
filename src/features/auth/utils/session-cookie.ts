import {
  FB_SESSION_COOKIE_NAME,
  NEST_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "../constants";

const SESSION_MAX_AGE_SECONDS = 86_400 * 7;
const LEGACY_SB_REFRESH_COOKIE_NAME = "ladipage-sb-refresh";

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function clearBackendSession(): void {
  if (typeof window === "undefined") return;
  void fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

export function setNestSessionCookie(token: string): void {
  setCookie(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE_SECONDS);
}

export function clearNestSessionCookie(): void {
  clearCookie(SESSION_COOKIE_NAME);
}

export function setFbSessionCookie(uid: string): void {
  setCookie(FB_SESSION_COOKIE_NAME, uid, SESSION_MAX_AGE_SECONDS);
}

export function clearFbSessionCookie(): void {
  clearCookie(FB_SESSION_COOKIE_NAME);
}

/**
 * Clears platform-auth cookies. The document.cookie deletes clean up cookies
 * written by pre-hardening builds; the HttpOnly refresh cookie is cleared by
 * the same-origin Next route.
 */
export function clearPlatformSessionCookies(): void {
  clearNestSessionCookie();
  clearCookie(NEST_REFRESH_COOKIE_NAME);
  clearCookie(LEGACY_SB_REFRESH_COOKIE_NAME);
  clearBackendSession();
}

export function clearAllSessionCookies(): void {
  clearPlatformSessionCookies();
  clearFbSessionCookie();
}

/** @deprecated Use setNestSessionCookie */
export function setSessionCookie(uid: string): void {
  setFbSessionCookie(uid);
}

/** @deprecated Use clearAllSessionCookies */
export function clearSessionCookie(): void {
  clearFbSessionCookie();
}
