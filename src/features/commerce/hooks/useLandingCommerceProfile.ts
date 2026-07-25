"use client";

import { useCallback, useSyncExternalStore } from "react";

import { landingCommerceBindingsStore } from "@/features/commerce/mock/landing-commerce-bindings-store";
import type {
  LandingCommerceProfile,
  LandingPagePurpose,
  PageCommerceBinding,
} from "@/features/commerce/types";

function subscribe(cb: () => void) {
  return landingCommerceBindingsStore.subscribe(cb);
}

function getVersion() {
  return landingCommerceBindingsStore.getVersion();
}

export function useLandingCommerceVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export function useLandingCommerceProfile(pageId: string, pageName = "") {
  const version = useLandingCommerceVersion();
  // version forces re-read after mutate; profile object may be new each save
  void version;
  const profile = landingCommerceBindingsStore.getProfile(pageId, pageName);

  const save = useCallback(
    (input: {
      pageName?: string;
      purpose: LandingPagePurpose;
      primaryConversion?: "lead" | "purchase";
      bindings: PageCommerceBinding[];
    }) =>
      landingCommerceBindingsStore.saveProfile({
        pageId,
        pageName: input.pageName ?? pageName,
        purpose: input.purpose,
        primaryConversion: input.primaryConversion,
        bindings: input.bindings,
      }),
    [pageId, pageName],
  );

  return { profile, save };
}

export function getLandingCommerceProfile(
  pageId: string,
  pageName = "",
): LandingCommerceProfile {
  return landingCommerceBindingsStore.getProfile(pageId, pageName);
}
