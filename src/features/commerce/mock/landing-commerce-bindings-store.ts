/**
 * Mock store: gắn SP online vào landing page (UI only).
 * Stable snapshots for useSyncExternalStore.
 */

import type {
  CommerceCtaMode,
  CommerceEngine,
  LandingCommerceProfile,
  LandingPagePurpose,
  PageCommerceBinding,
} from "@/features/commerce/types";

const STORAGE_KEY = "ladipage:landing-commerce-profiles-v1";

type Listener = () => void;

function emptyProfile(
  pageId: string,
  pageName: string,
): LandingCommerceProfile {
  return {
    pageId,
    pageName,
    purpose: "lead",
    commerceEngine: "none",
    primaryConversion: "lead",
    bindings: [],
    updatedAt: new Date().toISOString(),
  };
}

function loadFromStorage(): Map<string, LandingCommerceProfile> {
  const map = new Map<string, LandingCommerceProfile>();
  if (typeof window === "undefined") return map;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return map;
    const arr = JSON.parse(raw) as LandingCommerceProfile[];
    if (!Array.isArray(arr)) return map;
    for (const p of arr) {
      if (p?.pageId) map.set(p.pageId, p);
    }
  } catch {
    /* ignore */
  }
  return map;
}

class LandingCommerceBindingsStore {
  private profiles = loadFromStorage();
  /** Monotonic version — stable primitive snapshot for React. */
  private version = 0;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.version += 1;
    this.persist();
    this.listeners.forEach((l) => l());
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...this.profiles.values()]),
      );
    } catch {
      /* ignore */
    }
  }

  /** useSyncExternalStore: return number (stable until mutate). */
  getVersion(): number {
    return this.version;
  }

  getProfile(pageId: string, pageName = ""): LandingCommerceProfile {
    const existing = this.profiles.get(pageId);
    if (existing) return existing;
    return emptyProfile(pageId, pageName);
  }

  listProfiles(): LandingCommerceProfile[] {
    return [...this.profiles.values()];
  }

  saveProfile(input: {
    pageId: string;
    pageName: string;
    purpose: LandingPagePurpose;
    commerceEngine?: CommerceEngine;
    primaryConversion?: "lead" | "purchase";
    bindings: PageCommerceBinding[];
  }): LandingCommerceProfile {
    const purpose = input.purpose;
    let engine: CommerceEngine =
      input.commerceEngine ??
      (purpose === "sales" || purpose === "hybrid_lead_sales"
        ? "medusa"
        : "none");

    if (purpose === "lead" || purpose === "content") {
      engine = "none";
    }

    const profile: LandingCommerceProfile = {
      pageId: input.pageId,
      pageName: input.pageName,
      purpose,
      commerceEngine: engine,
      primaryConversion:
        input.primaryConversion ??
        (purpose === "sales" ? "purchase" : "lead"),
      bindings:
        engine === "none"
          ? []
          : input.bindings.map((b) => ({ ...b })),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(input.pageId, profile);
    this.emit();
    return profile;
  }

  clearPage(pageId: string) {
    if (!this.profiles.has(pageId)) return;
    this.profiles.delete(pageId);
    this.emit();
  }

  reset() {
    this.profiles.clear();
    this.emit();
  }
}

export const landingCommerceBindingsStore = new LandingCommerceBindingsStore();

export function createBindingFromProduct(input: {
  productId: string;
  productTitle: string;
  productSku: string;
  price: number;
  currencyCode: string;
  placement?: PageCommerceBinding["placement"];
  ctaMode?: CommerceCtaMode;
}): PageCommerceBinding {
  return {
    id: `bind_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    productId: input.productId,
    productTitle: input.productTitle,
    productSku: input.productSku,
    price: input.price,
    currencyCode: input.currencyCode,
    placement: input.placement ?? "product_card",
    ctaMode: input.ctaMode ?? "buy_now",
    snapshotAt: new Date().toISOString(),
  };
}
