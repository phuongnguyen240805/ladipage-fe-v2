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

/** Product variant (mock → later Medusa variant + options). */
export type CommerceVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  /** Option map e.g. { "Dung tích": "30ml" } */
  options: Record<string, string>;
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
  /** Danh mục & tag ids (optional — enrich detail). */
  categoryId?: string | null;
  tagIds?: string[];
  /** Biến thể (optional — MVP 1 variant Default). */
  variants?: CommerceVariant[];
};

/** One line in an order (mock → later Medusa order.items). */
export type CommerceOrderLineItem = {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  thumbnailUrl: string | null;
};

/** Shipping / billing address on an order (optional, mock). */
export type CommerceOrderAddress = {
  fullName: string;
  phone: string;
  line1: string;
  ward?: string;
  district?: string;
  city: string;
};

export type CommerceOrderPaymentMethod = "cod" | "bank_transfer" | "gateway";
export type CommerceOrderPaymentStatus =
  | "awaiting"
  | "captured"
  | "refunded"
  | "failed";

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
  /** Full line-item breakdown (optional — enriches detail drawer). */
  items?: CommerceOrderLineItem[];
  /** Money breakdown (optional). */
  subtotal?: number;
  discountTotal?: number;
  shippingTotal?: number;
  /** Fulfilment / payment context (optional). */
  shippingAddress?: CommerceOrderAddress;
  paymentMethod?: CommerceOrderPaymentMethod;
  paymentStatus?: CommerceOrderPaymentStatus;
  salesChannelName?: string;
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

/* ── Catalog control (Medusa parity, mock-first) ───────────────── */

/** Product category (mock → Medusa product_category, phân cấp cha-con). */
export type CommerceCategory = {
  id: string;
  name: string;
  parentId: string | null;
  thumbnailUrl: string | null;
  /** Số sản phẩm gắn (mock: đếm theo categoryId). */
  productCount: number;
  visible: boolean;
};

/** Product tag (mock → Medusa product_tag; màu là metadata phía LadiPage). */
export type CommerceProductTag = {
  id: string;
  name: string;
  /** Màu chip (extension LadiPage, Medusa tag không có màu). */
  color: string;
  productCount: number;
};

/** One inventory row (mock → Medusa inventory_item + stock_location). */
export type CommerceInventoryRow = {
  productId: string;
  productTitle: string;
  sku: string;
  price: number;
  currencyCode: string;
  quantity: number;
  locationName: string;
};

/** Customer (mock → Medusa customer). */
export type CommerceCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  currencyCode: string;
  createdAt: string;
};

export type CommercePromotionType = "percentage" | "fixed";
export type CommercePromotionStatus = "active" | "scheduled" | "expired";

/** Promotion / mã giảm (mock → Medusa promotion + campaign). */
export type CommercePromotion = {
  id: string;
  code: string;
  type: CommercePromotionType;
  value: number;
  minOrder: number;
  currencyCode: string;
  startAt: string;
  endAt: string;
  status: CommercePromotionStatus;
};
