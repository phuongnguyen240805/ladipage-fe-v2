import "server-only";

export function registeredKediCallback(): { callback: string; target: URL } | null {
  const callback = process.env.SSO_KEDIPAGE_REDIRECT_URI;
  if (!callback) return null;
  try {
    const target = new URL(callback);
    const localHttp = process.env.NODE_ENV !== "production" && target.protocol === "http:"
      && ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
    if ((!localHttp && target.protocol !== "https:") || target.username || target.password || target.search || target.hash
      || target.pathname !== "/api/auth/sso/callback") return null;
    return { callback, target };
  } catch { return null; }
}
