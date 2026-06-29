import {
  FB_SESSION_COOKIE_NAME,
  SB_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "../constants";

const MAX_AGE_SECONDS = 86_400 * 7;
const SB_REFRESH_MAX_AGE = 86_400 * 30;

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setNestSessionCookie(token: string): void {
  setCookie(SESSION_COOKIE_NAME, token, MAX_AGE_SECONDS);
}

export function clearNestSessionCookie(): void {
  clearCookie(SESSION_COOKIE_NAME);
}

export function setFbSessionCookie(uid: string): void {
  setCookie(FB_SESSION_COOKIE_NAME, uid, MAX_AGE_SECONDS);
}

export function clearFbSessionCookie(): void {
  clearCookie(FB_SESSION_COOKIE_NAME);
}

export function setSupabaseRefreshCookie(refreshToken: string): void {
  setCookie(SB_REFRESH_COOKIE_NAME, refreshToken, SB_REFRESH_MAX_AGE);
}

export function clearSupabaseRefreshCookie(): void {
  clearCookie(SB_REFRESH_COOKIE_NAME);
}

export function clearAllSessionCookies(): void {
  clearNestSessionCookie();
  clearFbSessionCookie();
  clearSupabaseRefreshCookie();
}

/** @deprecated Use setNestSessionCookie */
export function setSessionCookie(uid: string): void {
  setFbSessionCookie(uid);
}

/** @deprecated Use clearAllSessionCookies */
export function clearSessionCookie(): void {
  clearFbSessionCookie();
}