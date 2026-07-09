"use client";

import { usePlatformAuth } from "@/features/auth/hooks/usePlatformAuth";

/** Org id gửi qua header `x-org-id` cho BFF AI-SEO — khớp virtual Website Builder project. */
export function useAiSeoOrgId(fallback = "org-1"): string {
  const { platform } = usePlatformAuth();
  return platform.tenant?.organizationId || fallback;
}