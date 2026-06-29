import { FUNNELX_DISTINCT_ID_KEY } from "./constants";

function createDistinctId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `fx_${Date.now().toString(36)}_${random}`;
}

export function getFunnelDistinctId(storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null) {
  if (!storage) return createDistinctId();

  const existing = storage.getItem(FUNNELX_DISTINCT_ID_KEY);
  if (existing) return existing;

  const next = createDistinctId();
  storage.setItem(FUNNELX_DISTINCT_ID_KEY, next);
  return next;
}

export function buildFunnelAttributes(input?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return { ...input };
  }

  return {
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    device: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    ...input,
  };
}
