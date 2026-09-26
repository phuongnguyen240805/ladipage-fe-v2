"use client";

/**
 * Dedicated editor entry tab — same host/port as Ladipage (e.g. /ladipage?pageId=…).
 * Mirrors product pattern appv6.ladipage.com/ladipage: separate tab, branded path,
 * then SSO into the Instatic editor origin (prod) or same-origin /admin (dev).
 */
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { resolveInstaticEditorUrl } from "@/features/landing-editor-host/editor-url";
import { openEditorSession } from "@/features/landing-editor-host/open-editor-session";

function LadipageEditorEntryInner() {
  const search = useSearchParams();
  const pageId = (search.get("pageId") || "").trim();
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!pageId) {
      setError("Missing pageId. Open editor from Landing pages list.");
      return;
    }
    started.current = true;

    void (async () => {
      try {
        const session = await openEditorSession(pageId);
        const url = resolveInstaticEditorUrl(session);
        const absolute =
          url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
        setTarget(absolute);
        window.location.replace(absolute);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to open editor");
        started.current = false;
      }
    })();
  }, [pageId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-100">
      <p className="text-sm font-medium text-slate-200">Ladipage Editor</p>
      {!error ? (
        <p className="text-sm text-slate-400">Opening editor session…</p>
      ) : (
        <>
          <p className="max-w-lg text-sm text-rose-300">{error}</p>
          <button
            type="button"
            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-slate-950"
            onClick={() => {
              started.current = false;
              setError(null);
              window.location.reload();
            }}
          >
            Retry
          </button>
        </>
      )}
      {target ? (
        <a href={target} className="text-xs text-brand-400/80 underline break-all">
          Continue
        </a>
      ) : null}
      <Link href="/landing-pages" className="text-xs text-slate-500 hover:text-slate-300">
        ← Back to pages
      </Link>
    </div>
  );
}

export default function LadipageEditorEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <LadipageEditorEntryInner />
    </Suspense>
  );
}
