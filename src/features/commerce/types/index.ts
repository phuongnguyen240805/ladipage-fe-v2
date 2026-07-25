/** Commerce facade types (M0 UI mock → later BFF/Medusa). */

export type CommercePermission =
  | "commerce:product:read"
  | "commerce:product:write"
  | "commerce:page:bind"
  | "commerce:order:read"
  | "commerce:order:refund"
  | "commerce:store:manage";

export type CommerceMockRole = "owner" | "admin" | "editor" | "viewer";

export type CommerceProductStatus = "published" | "draft" | "archived";

export type CommerceOrderStatus =
  | "pending"
  | "completed"
  | "canceled"
  | "requires_action";

/** Medusa Cloud-style organization snapshot (mock). */
export type MedusaOrganizationMock = {
  id: string;
  name: string;
  legalName: string;
  billingEmail: string;
  vatNumber: string;
  status: "active" | "inactive";
  accountHolder: string;
  createdAt: string;
  subscription: {
    plan: string;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  members: Array<{
    email: string;
    name: string;
    id: string;
    createdAt: string;
  }>;
};

/** LadiPage org ↔ Medusa sales channel link. */
export type CommerceStoreLink = {
  ladipageOrganizationId: string;
  medusaOrganizationId: string;
  salesChannelId: string;
  salesChannelName: string;
  regionId: string;
  currencyCode: string;
  status: "pending" | "active" | "error";
  healthMessage?: string;
  provisionedAt: string | null;
};

export type CommerceProduct = {
  id: string;
  title: string;
  handle: string;
  sku: string;
  status: CommerceProductStatus;
  price: number;
  /** Giá gạch (so sánh), 0 = ẩn */
  compareAtPrice: number;
  currencyCode: string;
  stock: number;
  thumbnailUrl: string | null;
  /** Thư viện ảnh URL */
  images: string[];
  shortDescription: string;
  description: string;
  highlights: string[];
  brand: string;
  badge: string;
  unit: string;
  shippingNote: string;
  salesChannelId: string;
  createdAt: string;
  updatedAt: string;
};

export type CommerceOrder = {
  id: string;
  displayId: string;
  email: string;
  customerName: string;
  total: number;
  currencyCode: string;
  status: CommerceOrderStatus;
  landingPageId: string | null;
  landingPageName: string | null;
  itemsSummary: string;
  createdAt: string;
};

export type CommerceAccessSnapshot = {
  role: CommerceMockRole;
  permissions: CommercePermission[];
  monetizeEnabled: boolean;
};

/** Landing purpose — UI M0 (plan landing-page-modes). */
export type LandingPagePurpose =
  | "lead"
  | "sales"
  | "hybrid_lead_sales"
  | "content";

export type CommerceEngine = "none" | "legacy_ecom" | "medusa";

export type CommerceCtaMode = "buy_now" | "add_to_cart" | "redirect";

/** Product placement on a landing page (mock → later editor_data / API). */
export type PageCommerceBinding = {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  price: number;
  currencyCode: string;
  placement: "hero_cta" | "product_card" | "sticky_bar";
  ctaMode: CommerceCtaMode;
  snapshotAt: string;
};

export type LandingCommerceProfile = {
  pageId: string;
  pageName: string;
  purpose: LandingPagePurpose;
  commerceEngine: CommerceEngine;
  primaryConversion: "lead" | "purchase";
  bindings: PageCommerceBinding[];
  updatedAt: string;
};
