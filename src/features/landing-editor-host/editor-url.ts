import type { EditorSessionResponse } from "./types";

const DEV_INSTATIC_PORTS = new Set(["5173", "5174", "8787", "3001"]);

export interface ResolveInstaticEditorUrlOptions {
  /** Instatic public origin (Dokploy). Localhost values keep Next rewrites. */
  instaticOrigin?: string;
}

/**
 * Editor URL:
 * - Dev Vite/CMS ports → relative `/admin/...` (Next rewrite).
 * - Production Instatic origin (sslip.io) → keep/build absolute URL.
 * Cloudflare OpenNext cannot host the Instatic SPA at `/admin`.
 */
export function resolveInstaticEditorUrl(
  session: EditorSessionResponse,
  options?: ResolveInstaticEditorUrlOptions,
): string {
  const raw = (session.editorUrl || session.cmsPath || "").trim();
  const instaticOrigin = (
    options?.instaticOrigin ??
    process.env.NEXT_PUBLIC_INSTATIC_EDITOR_ORIGIN ??
    ""
  ).replace(/\/$/, "");

  if (raw) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const u = new URL(raw);
        if (DEV_INSTATIC_PORTS.has(u.port)) {
          return `${u.pathname}${u.search}${u.hash}`;
        }
        return raw;
      } catch {
        /* fall through */
      }
    }

    const path = toAdminPath(raw);
    if (path) return withInstaticOrigin(path, instaticOrigin);
    if (raw.startsWith("/")) return withInstaticOrigin(raw, instaticOrigin);
    return raw;
  }

  if (session.sessionToken) {
    return withInstaticOrigin(
      `/admin/api/cms/auth/ladipage-sso?token=${encodeURIComponent(session.sessionToken)}`,
      instaticOrigin,
    );
  }

  return session.editPath || `/landing-pages/${encodeURIComponent(session.pageId)}/edit`;
}

function withInstaticOrigin(path: string, origin: string): string {
  if (!shouldOpenOnRemoteInstatic(origin)) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

function shouldOpenOnRemoteInstatic(origin: string): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

/** Map /_cms/admin and /admin paths; leave non-admin URLs alone. */
function toAdminPath(urlOrPath: string): string | null {
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
  return null;
}
