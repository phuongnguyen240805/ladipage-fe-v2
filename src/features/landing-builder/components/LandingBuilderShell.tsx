"use client";

import { useEffect } from "react";
import { LandingEditorPageClient } from "@/components/landing-pages/editor/LandingEditorPageClient";
import type { BuilderMessage } from "../sdk/builder-message-protocol";

interface LandingBuilderShellProps {
  pageId: string;
}

export function LandingBuilderShell({ pageId }: LandingBuilderShellProps) {
  useEffect(() => {
    const message: BuilderMessage = { type: "EM_BUILDER_READY", pageId };
    window.opener?.postMessage(message, window.location.origin);
    window.parent?.postMessage(message, window.location.origin);
  }, [pageId]);

  return <LandingEditorPageClient pageId={pageId} />;
}
