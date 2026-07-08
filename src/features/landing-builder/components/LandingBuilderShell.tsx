"use client";

import { useEffect } from "react";
import { LandingEditorPageClient } from "@/components/landing-pages/editor/LandingEditorPageClient";
import { getBuilderSessionTokenFromSearch } from "../store/manual-save";
import type { BuilderMessage } from "../sdk/builder-message-protocol";

interface LandingBuilderShellProps {
  pageId: string;
}

export function LandingBuilderShell({ pageId }: LandingBuilderShellProps) {
  const builderSessionToken =
    typeof window !== "undefined"
      ? getBuilderSessionTokenFromSearch(window.location.search)
      : null;

  useEffect(() => {
    const message: BuilderMessage = { type: "EM_BUILDER_READY", pageId };
    window.opener?.postMessage(message, window.location.origin);
    window.parent?.postMessage(message, window.location.origin);
  }, [pageId]);

  return (
    <LandingEditorPageClient pageId={pageId} builderSessionToken={builderSessionToken} />
  );
}