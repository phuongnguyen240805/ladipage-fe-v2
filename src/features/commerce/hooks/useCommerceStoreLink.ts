"use client";

import { useSyncExternalStore } from "react";

import {
  commerceMockStore,
  mockMedusaOrganization,
} from "@/features/commerce/mock/commerce-mock-store";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}

function getStoreLinkSnapshot() {
  return commerceMockStore.getStoreLink();
}

export function useCommerceStoreLink() {
  const storeLink = useSyncExternalStore(
    subscribe,
    getStoreLinkSnapshot,
    getStoreLinkSnapshot,
  );

  // Constant seed object — never reallocated
  return { storeLink, organization: mockMedusaOrganization };
}
