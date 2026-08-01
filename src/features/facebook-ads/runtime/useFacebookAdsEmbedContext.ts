"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribeToFrameContext = () => () => undefined;
const getServerFrameSnapshot = () => false;
const getClientFrameSnapshot = () => window.self !== window.top;

export function resolveFacebookAdsEmbedded(
  hasEmbeddedQuery: boolean,
  isInsideFrame: boolean,
) {
  return hasEmbeddedQuery || isInsideFrame;
}

/**
 * Keeps the extension surface embedded after client-side navigation removes
 * the original `embedded=1` query string.
 */
export function useFacebookAdsEmbedContext() {
  const searchParams = useSearchParams();
  const isInsideFrame = useSyncExternalStore(
    subscribeToFrameContext,
    getClientFrameSnapshot,
    getServerFrameSnapshot,
  );

  return resolveFacebookAdsEmbedded(
    searchParams.get("embedded") === "1",
    isInsideFrame,
  );
}
