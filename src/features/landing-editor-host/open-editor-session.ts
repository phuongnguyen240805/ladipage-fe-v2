"use client";

import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";
import { formatApiErrorBody } from "@/lib/format-api-error";

import { normalizeEditorSessionPayload } from "./session-payload";
import type { EditorSessionResponse } from "./types";

export { normalizeEditorSessionPayload } from "./session-payload";

/** Dedupe concurrent mint for the same pageId (React Strict Mode / double click). */
const inflightSession = new Map<string, Promise<EditorSessionResponse>>();

/**
 * Mint Instatic SSO session via Ladipage BFF → Nest landing-cms.
 * Concurrent callers for the same pageId share one request (single token).
 */
export async function openEditorSession(pageId: string): Promise<EditorSessionResponse> {
  const key = pageId.trim();
  const existing = inflightSession.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const headers = await getPlatformAuthHeaders({ preferNest: true });

    const response = await fetch("/api/landing-cms/session", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ pageId: key }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiErrorBody(payload, "Cannot open Instatic editor session."));
    }

    return normalizeEditorSessionPayload(payload, key);
  })().finally(() => {
    inflightSession.delete(key);
  });

  inflightSession.set(key, promise);
  return promise;
}

/** Guard: only one open navigation per pageId at a time. */
const openLock = new Set<string>();

/**
 * Open dedicated editor tab on same Ladipage origin:
 *   /ladipage?pageId=...  →  SSO → /admin/site
 * Mirrors product path style (e.g. appv6…/ladipage): separate tab, same host:port.
 */
export async function openInstaticEditor(options: {
  pageId: string;
  mode?: "new-tab" | "same-tab";
}): Promise<void> {
  const pageId = options.pageId.trim();
  if (!pageId) throw new Error("pageId is required");
  if (openLock.has(pageId)) return;
  openLock.add(pageId);

  try {
    const mode = options.mode ?? "new-tab";
    // Entry path only — session mint happens inside /ladipage to avoid double-mint
    // when the entry page also mints (single consumer of SSO token).
    const entry = `/ladipage?pageId=${encodeURIComponent(pageId)}`;
    const absolute = `${window.location.origin}${entry}`;

    if (mode === "same-tab") {
      window.location.assign(absolute);
      return;
    }

    // IMPORTANT: do not pass "noopener" in the features string.
    // Many browsers then return null from window.open even when the tab opened,
    // and a fallback location.href would also navigate the *current* (list) tab.
    const opened = window.open(absolute, "_blank");
    if (opened) {
      try {
        opened.opener = null;
      } catch {
        /* cross-origin / browser policy */
      }
      return;
    }

    // Popup blocked — never hijack existing tabs; ask user to allow pop-ups.
    throw new Error(
      "Trình duyệt đã chặn tab editor. Hãy cho phép pop-up cho trang này rồi thử lại.",
    );
  } finally {
    window.setTimeout(() => openLock.delete(pageId), 1500);
  }
}
