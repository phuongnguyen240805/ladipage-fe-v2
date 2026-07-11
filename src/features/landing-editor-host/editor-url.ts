import type { EditorSessionResponse } from "./types";

/**
 * Same-origin editor URL for customers (stay on Ladipage host:port).
 *
 * Prefer Nest `editorUrl` when it points at the app origin / relative path.
 * Rewrite absolute :5174/:8787 URLs to same-origin /admin/... so a new tab
 * still shows localhost:3000 (or production app host), not Instatic ports.
 */
export function resolveInstaticEditorUrl(session: EditorSessionResponse): string {
  const raw = (session.editorUrl || session.cmsPath || "").trim();

  if (raw) {
    const sameOrigin = toSameOriginAdminPath(raw);
    if (sameOrigin) return sameOrigin;
    if (raw.startsWith("/")) return raw;
    // Absolute same host already (e.g. http://localhost:3000/admin/...)
    if (typeof window !== "undefined") {
      try {
        const u = new URL(raw, window.location.origin);
        if (u.origin === window.location.origin) {
          return `${u.pathname}${u.search}${u.hash}`;
        }
      } catch {
        /* ignore */
      }
    }
    return raw;
  }

  if (session.sessionToken) {
    return `/admin/api/cms/auth/ladipage-sso?token=${encodeURIComponent(session.sessionToken)}`;
  }

  return session.editPath || `/landing-pages/${encodeURIComponent(session.pageId)}/edit`;
}

/** Map http://127.0.0.1:5174/admin/... → /admin/... (same Ladipage port). */
function toSameOriginAdminPath(urlOrPath: string): string | null {
  if (urlOrPath.startsWith("/admin")) {
    return urlOrPath;
  }
  if (urlOrPath.startsWith("/_cms/admin")) {
    return urlOrPath.replace(/^\/_cms/, "") || "/admin";
  }
  if (urlOrPath.startsWith("/_cms/")) {
    const rest = urlOrPath.slice("/_cms".length);
    return rest.startsWith("/admin") ? rest : `/admin${rest.startsWith("/") ? rest : `/${rest}`}`;
  }

  try {
    const u = new URL(urlOrPath);
    // Strip Instatic dev ports — customer must not leave Ladipage origin/port
    if (
      u.pathname.startsWith("/admin") ||
      u.pathname.startsWith("/_cms/admin")
    ) {
      const path = u.pathname.startsWith("/_cms")
        ? u.pathname.replace(/^\/_cms/, "")
        : u.pathname;
      return `${path}${u.search}${u.hash}`;
    }
  } catch {
    /* not a URL */
  }
  return null;
}
