"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { resolveInstaticEditorUrl } from "./editor-url";
import { openEditorSession } from "./open-editor-session";

interface EditorHostPageProps {
  pageId: string;
}

/**
 * Same-tab bridge: mint SSO once → navigate to same-origin /admin SSO path.
 */
export function EditorHostPage({ pageId }: EditorHostPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const started = useRef(false);

  const go = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await openEditorSession(pageId);
      let url = resolveInstaticEditorUrl(session);
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const u = new URL(url);
        url = `${u.pathname}${u.search}${u.hash}`;
      }
      if (!url.startsWith("/")) url = `/${url}`;
      const absolute = `${window.location.origin}${url}`;
      setTargetUrl(absolute);
      window.location.replace(absolute);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open editor.");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void go();
  }, [go]);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-slate-100">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 px-3">
        <Link href="/landing-pages" className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-800">
          ← Pages
        </Link>
        <span className="text-sm text-slate-200">Opening editor…</span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        {loading ? <p className="text-sm text-slate-400">SSO session…</p> : null}
        {targetUrl ? (
          <a href={targetUrl} className="text-sm text-lime-400 underline break-all">
            Continue to editor
          </a>
        ) : null}
        {error ? (
          <>
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => {
                started.current = false;
                void go().then(() => {
                  started.current = true;
                });
              }}
              className="rounded-md bg-white px-3 py-1.5 text-sm text-slate-900"
            >
              Retry (new token)
            </button>
          </>
        ) : null}
        <p className="max-w-md text-xs text-slate-500">
          Same host as Ladipage (<code className="text-slate-400">/admin</code>). Ensure Instatic CMS+Vite
          are running and FE rewrites are configured.
        </p>
      </div>
    </div>
  );
}
