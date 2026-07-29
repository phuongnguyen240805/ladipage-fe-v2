/**
 * In-memory mock for Commerce / Medusa UI (M0).
 * Seed mirrors Medusa Cloud organization shape provided for reference.
 */

import type {
  CommerceCategory,
  CommerceCustomer,
  CommerceInventoryRow,
  CommerceMockRole,
  CommerceOrder,
  CommerceProduct,
  CommerceProductTag,
  CommercePromotion,
  CommerceStoreLink,
  MedusaOrganizationMock,
} from "@/features/commerce/types";
import { permissionsForRole } from "@/features/commerce/utils/commerce-permissions";

const ROLE_STORAGE_KEY = "ladipage:commerce-mock-role";

/** Placeholder org id from Medusa reference → concrete mock id for UI. */
export const MOCK_MEDUSA_ORG_ID = "org_01MOCK_MY_ORGANIZATION";

export const mockMedusaOrganization: MedusaOrganizationMock = {
  id: MOCK_MEDUSA_ORG_ID,
  name: "My Organization",
  legalName: "My Organization, Inc.",
  billingEmail: "billing@example.com",
  vatNumber: "DE123456789",
  status: "active",
  accountHolder: "owner@example.com",
  createdAt: "2024-10-10T08:24:32.382Z",
  subscription: {
    plan: "Pro",
    planId: "plan_01ABC",
    status: "active",
    currentPeriodStart: "2026-04-22T14:10:00.000Z",
    currentPeriodEnd: "2026-05-22T14:10:00.000Z",
  },
  members: [
    {
      email: "alice@example.com",
      name: "Alice Example",
      id: "mem_01ABC",
      createdAt: "2024-08-30T09:07:00.000Z",
    },
    {
      email: "bob@example.com",
      name: "Bob Example",
      id: "mem_01DEF",
      createdAt: "2024-08-30T09:10:00.000Z",
    },
    {
      email: "carol@example.com",
      name: "Carol Example",
      id: "mem_01GHI",
      createdAt: "2024-08-30T09:15:00.000Z",
    },
  ],
};

/** LadiPage workspace mapped to Medusa sales channel under that org. */
export const mockStoreLinkSeed: CommerceStoreLink = {
  ladipageOrganizationId: "lp_org_demo_001",
  medusaOrganizationId: MOCK_MEDUSA_ORG_ID,
  salesChannelId: "sc_01MOCK_LADIPAGE_CHANNEL",
  salesChannelName: "LadiPage — My Organization",
  regionId: "reg_01_vn",
  currencyCode: "vnd",
  status: "active",
  healthMessage: "Gian hàng sẵn sàng (mock)",
  provisionedAt: "2026-07-18T10:00:00.000Z",
};

const seedProducts: CommerceProduct[] = [
  {
    id: "prod_01SERUM",
    title: "Serum Vitamin C 30ml",
    handle: "serum-vitamin-c-30ml",
    sku: "SERUM-VC-30",
    status: "published",
    price: 299000,
    compareAtPrice: 399000,
    currencyCode: "vnd",
    stock: 120,
    thumbnailUrl: "/images/product/skincare_product.png",
    images: [
      "/images/product/skincare_product.png",
      "/images/product/green_tea_product.png",
    ],
    shortDescription: "Serum dưỡng sáng, mờ thâm, phù hợp da dầu mụn.",
    description:
      "Serum Vitamin C 30ml giúp làm sáng da, giảm thâm nám, chống oxy hóa. Kết cấu thấm nhanh, dùng sáng tối sau toner.",
    highlights: [
      "Vitamin C ổn định 15%",
      "Không chứa paraben",
      "Phù hợp da Việt Nam",
    ],
    brand: "Ladi Care",
    badge: "Bán chạy",
    unit: "chai",
    shippingNote: "Giao 2–4 ngày · Đổi trả 7 ngày",
    salesChannelId: mockStoreLinkSeed.salesChannelId,
    createdAt: "2026-07-15T08:00:00.000Z",
    updatedAt: "2026-07-19T08:00:00.000Z",
    categoryId: "cat_serum",
    tagIds: ["tag_bestseller", "tag_skincare"],
    variants: [
      {
        id: "var_serum_30",
        title: "30ml",
        sku: "SERUM-VC-30",
        price: 299000,
        stock: 120,
        options: { "Dung tích": "30ml" },
      },
    ],
  },
  {
    id: "prod_02KIT",
    title: "Combo chăm sóc da 7 ngày",
    handle: "combo-cham-soc-da-7-ngay",
    sku: "KIT-7D",
    status: "published",
    price: 499000,
    compareAtPrice: 650000,
    currencyCode: "vnd",
    stock: 45,
    thumbnailUrl: "/images/product/green_tea_product.png",
    images: [
      "/images/product/green_tea_product.png",
      "/images/product/skincare_product.png",
    ],
    shortDescription: "Trọn bộ toner + serum + kem dưỡng dùng thử 7 ngày.",
    description:
      "Combo chăm sóc da 7 ngày giúp làm sạch, cân bằng và cấp ẩm. Phù hợp làm quà tặng hoặc trial kit trên landing.",
    highlights: ["Đủ 3 bước cơ bản", "Size travel", "Giá ưu đãi landing"],
    brand: "Ladi Care",
    badge: "Combo",
    unit: "hộp",
    shippingNote: "Freeship đơn từ 300k",
    salesChannelId: mockStoreLinkSeed.salesChannelId,
    createdAt: "2026-07-16T08:00:00.000Z",
    updatedAt: "2026-07-19T09:00:00.000Z",
    categoryId: "cat_combo",
    tagIds: ["tag_combo", "tag_skincare"],
    variants: [
      {
        id: "var_kit_default",
        title: "Bộ 7 ngày",
        sku: "KIT-7D",
        price: 499000,
        stock: 45,
        options: { Loại: "Bộ 7 ngày" },
      },
    ],
  },
  {
    id: "prod_03DRAFT",
    title: "Toner cân bằng (nháp)",
    handle: "toner-can-bang-draft",
    sku: "TONER-DRAFT",
    status: "draft",
    price: 159000,
    compareAtPrice: 0,
    currencyCode: "vnd",
    stock: 0,
    thumbnailUrl: "/images/product/smartwatch_product.png",
    images: ["/images/product/smartwatch_product.png"],
    shortDescription: "Bản nháp — chưa xuất bản bán.",
    description: "Toner cân bằng pH, làm sạch nhẹ.",
    highlights: [],
    brand: "Ladi Care",
    badge: "",
    unit: "chai",
    shippingNote: "",
    salesChannelId: mockStoreLinkSeed.salesChannelId,
    createdAt: "2026-07-17T08:00:00.000Z",
    updatedAt: "2026-07-17T08:00:00.000Z",
    categoryId: "cat_skincare",
    tagIds: [],
    variants: [
      {
        id: "var_toner_default",
        title: "Default",
        sku: "TONER-DRAFT",
        price: 159000,
        stock: 0,
        options: { Default: "Default" },
      },
    ],
  },
];

const seedOrders: CommerceOrder[] = [
  {
    id: "order_01",
    displayId: "#1001",
    email: "minh@gmail.com",
    customerName: "Minh Nguyen",
    total: 299000,
    currencyCode: "vnd",
    status: "completed",
    landingPageId: "page_flash_sale_serum",
    landingPageName: "Flash Sale Serum",
    itemsSummary: "Serum Vitamin C 30ml × 1",
    createdAt: "2026-07-18T14:22:00.000Z",
    items: [
      {
        id: "li_01",
        productId: "prod_01SERUM",
        productTitle: "Serum Vitamin C 30ml",
        sku: "SERUM-VC-30",
        quantity: 1,
        unitPrice: 299000,
        total: 299000,
        thumbnailUrl: "/images/product/skincare_product.png",
      },
    ],
    subtotal: 299000,
    discountTotal: 0,
    shippingTotal: 0,
    shippingAddress: {
      fullName: "Minh Nguyen",
      phone: "0901234567",
      line1: "12 Nguyễn Huệ",
      ward: "Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    paymentMethod: "cod",
    paymentStatus: "captured",
    salesChannelName: "LadiPage — My Organization",
  },
  {
    id: "order_02",
    displayId: "#1002",
    email: "lan@example.com",
    customerName: "Lan Tran",
    total: 499000,
    currencyCode: "vnd",
    status: "pending",
    landingPageId: "page_combo_7d",
    landingPageName: "Landing Combo 7 ngày",
    itemsSummary: "Combo chăm sóc da 7 ngày × 1",
    createdAt: "2026-07-19T11:05:00.000Z",
    items: [
      {
        id: "li_02",
        productId: "prod_02KIT",
        productTitle: "Combo chăm sóc da 7 ngày",
        sku: "KIT-7D",
        quantity: 1,
        unitPrice: 499000,
        total: 499000,
        thumbnailUrl: "/images/product/green_tea_product.png",
      },
    ],
    subtotal: 499000,
    discountTotal: 0,
    shippingTotal: 0,
    shippingAddress: {
      fullName: "Lan Tran",
      phone: "0912345678",
      line1: "45 Lê Lợi",
      ward: "Phạm Ngũ Lão",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    paymentMethod: "bank_transfer",
    paymentStatus: "awaiting",
    salesChannelName: "LadiPage — My Organization",
  },
];

const seedCategories: CommerceCategory[] = [
  {
    id: "cat_skincare",
    name: "Chăm sóc da",
    parentId: null,
    thumbnailUrl: "/images/product/skincare_product.png",
    productCount: 2,
    visible: true,
  },
  {
    id: "cat_serum",
    name: "Serum & Tinh chất",
    parentId: "cat_skincare",
    thumbnailUrl: null,
    productCount: 1,
    visible: true,
  },
  {
    id: "cat_combo",
    name: "Combo & Quà tặng",
    parentId: null,
    thumbnailUrl: "/images/product/green_tea_product.png",
    productCount: 1,
    visible: true,
  },
];

const seedTags: CommerceProductTag[] = [
  { id: "tag_bestseller", name: "Bán chạy", color: "#f59e0b", productCount: 1 },
  { id: "tag_combo", name: "Combo", color: "#8b5cf6", productCount: 1 },
  { id: "tag_new", name: "Mới", color: "#10b981", productCount: 0 },
  { id: "tag_sale", name: "Giảm giá", color: "#ef4444", productCount: 2 },
];

const seedCustomers: CommerceCustomer[] = [
  {
    id: "cus_01",
    name: "Minh Nguyen",
    email: "minh@gmail.com",
    phone: "0901234567",
    ordersCount: 1,
    totalSpent: 299000,
    currencyCode: "vnd",
    createdAt: "2026-07-18T14:22:00.000Z",
  },
  {
    id: "cus_02",
    name: "Lan Tran",
    email: "lan@example.com",
    phone: "0912345678",
    ordersCount: 1,
    totalSpent: 499000,
    currencyCode: "vnd",
    createdAt: "2026-07-19T11:05:00.000Z",
  },
];

const seedPromotions: CommercePromotion[] = [
  {
    id: "promo_welcome10",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrder: 0,
    currencyCode: "vnd",
    startAt: "2026-07-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    status: "active",
  },
  {
    id: "promo_freeship",
    code: "FREESHIP300",
    type: "fixed",
    value: 30000,
    minOrder: 300000,
    currencyCode: "vnd",
    startAt: "2026-07-15T00:00:00.000Z",
    endAt: "2026-08-15T23:59:59.000Z",
    status: "active",
  },
  {
    id: "promo_tet",
    code: "TET2027",
    type: "percentage",
    value: 20,
    minOrder: 500000,
    currencyCode: "vnd",
    startAt: "2027-01-20T00:00:00.000Z",
    endAt: "2027-02-10T23:59:59.000Z",
    status: "scheduled",
  },
];

type Listener = () => void;

function sortProducts(items: CommerceProduct[]): CommerceProduct[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function sortOrders(items: CommerceOrder[]): CommerceOrder[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Derive inventory rows from products (one row per product, MVP 1 location). */
function buildInventory(products: CommerceProduct[]): CommerceInventoryRow[] {
  return products.map((p) => ({
    productId: p.id,
    productTitle: p.title,
    sku: p.sku,
    price: p.price,
    currencyCode: p.currencyCode,
    quantity: p.stock,
    locationName: "Kho mặc định",
  }));
}

let idCounter = 0;
/** Stable-ish id for mock CRUD (browser + vitest safe). */
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter}`;
}

function slugifyHandle(title: string, fallback: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || fallback
  );
}

class CommerceMockStore {
  /** Stable snapshots for useSyncExternalStore (must not allocate on getSnapshot). */
  private productsSnapshot: CommerceProduct[] = sortProducts(
    seedProducts.map((p) => ({ ...p })),
  );
  private ordersSnapshot: CommerceOrder[] = sortOrders(
    seedOrders.map((o) => ({ ...o })),
  );
  private categoriesSnapshot: CommerceCategory[] = seedCategories.map((c) => ({
    ...c,
  }));
  private tagsSnapshot: CommerceProductTag[] = seedTags.map((t) => ({
    ...t,
  }));
  private customersSnapshot: CommerceCustomer[] = seedCustomers.map((c) => ({
    ...c,
  }));
  private promotionsSnapshot: CommercePromotion[] = seedPromotions.map((p) => ({
    ...p,
  }));
  private inventorySnapshot: CommerceInventoryRow[] = buildInventory(
    sortProducts(seedProducts.map((p) => ({ ...p }))),
  );
  private storeLink: CommerceStoreLink = { ...mockStoreLinkSeed };
  private role: CommerceMockRole = "owner";
  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (
        saved === "owner" ||
        saved === "admin" ||
        saved === "editor" ||
        saved === "viewer"
      ) {
        this.role = saved;
      }
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  getRole(): CommerceMockRole {
    return this.role;
  }

  setRole(role: CommerceMockRole) {
    if (this.role === role) return;
    this.role = role;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
    this.emit();
  }

  getPermissions() {
    return permissionsForRole(this.role);
  }

  getOrganization(): MedusaOrganizationMock {
    return mockMedusaOrganization;
  }

  /** Same object reference until storeLink is replaced. */
  getStoreLink(): CommerceStoreLink {
    return this.storeLink;
  }

  /** Same array reference until products mutate. */
  listProducts(): CommerceProduct[] {
    return this.productsSnapshot;
  }

  getProduct(id: string): CommerceProduct | null {
    return this.productsSnapshot.find((p) => p.id === id) ?? null;
  }

  /** Categories (stable snapshot). */
  listCategories(): CommerceCategory[] {
    return this.categoriesSnapshot;
  }

  /** Product tags (stable snapshot). */
  listProductTags(): CommerceProductTag[] {
    return this.tagsSnapshot;
  }

  /** Customers (stable snapshot). */
  listCustomers(): CommerceCustomer[] {
    return this.customersSnapshot;
  }

  /** Promotions (stable snapshot). */
  listPromotions(): CommercePromotion[] {
    return this.promotionsSnapshot;
  }

  /* ── Category CRUD (mock) ─────────────────────────────── */

  createCategory(input: {
    name: string;
    parentId?: string | null;
    thumbnailUrl?: string | null;
    visible?: boolean;
  }): CommerceCategory {
    const category: CommerceCategory = {
      id: nextId("cat"),
      name: input.name.trim(),
      parentId: input.parentId ?? null,
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      productCount: 0,
      visible: input.visible ?? true,
    };
    this.categoriesSnapshot = [...this.categoriesSnapshot, category];
    this.emit();
    return category;
  }

  updateCategory(
    id: string,
    patch: Partial<Pick<CommerceCategory, "name" | "parentId" | "thumbnailUrl" | "visible">>,
  ): CommerceCategory | null {
    let updated: CommerceCategory | null = null;
    this.categoriesSnapshot = this.categoriesSnapshot.map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, ...patch };
      return updated;
    });
    if (updated) this.emit();
    return updated;
  }

  deleteCategory(id: string): boolean {
    const next = this.categoriesSnapshot.filter((c) => c.id !== id);
    if (next.length === this.categoriesSnapshot.length) return false;
    this.categoriesSnapshot = next;
    this.emit();
    return true;
  }

  /* ── Product tag CRUD (mock) ──────────────────────────── */

  createProductTag(input: { name: string; color: string }): CommerceProductTag {
    const tag: CommerceProductTag = {
      id: nextId("tag"),
      name: input.name.trim(),
      color: input.color,
      productCount: 0,
    };
    this.tagsSnapshot = [...this.tagsSnapshot, tag];
    this.emit();
    return tag;
  }

  updateProductTag(
    id: string,
    patch: Partial<Pick<CommerceProductTag, "name" | "color">>,
  ): CommerceProductTag | null {
    let updated: CommerceProductTag | null = null;
    this.tagsSnapshot = this.tagsSnapshot.map((t) => {
      if (t.id !== id) return t;
      updated = { ...t, ...patch };
      return updated;
    });
    if (updated) this.emit();
    return updated;
  }

  deleteProductTag(id: string): boolean {
    const next = this.tagsSnapshot.filter((t) => t.id !== id);
    if (next.length === this.tagsSnapshot.length) return false;
    this.tagsSnapshot = next;
    this.emit();
    return true;
  }

  /* ── Customer CRUD (mock) ─────────────────────────────── */

  createCustomer(input: {
    name: string;
    email: string;
    phone?: string;
  }): CommerceCustomer {
    const customer: CommerceCustomer = {
      id: nextId("cus"),
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || "",
      ordersCount: 0,
      totalSpent: 0,
      currencyCode: this.storeLink.currencyCode,
      createdAt: new Date().toISOString(),
    };
    this.customersSnapshot = [customer, ...this.customersSnapshot];
    this.emit();
    return customer;
  }

  updateCustomer(
    id: string,
    patch: Partial<Pick<CommerceCustomer, "name" | "email" | "phone">>,
  ): CommerceCustomer | null {
    let updated: CommerceCustomer | null = null;
    this.customersSnapshot = this.customersSnapshot.map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, ...patch };
      return updated;
    });
    if (updated) this.emit();
    return updated;
  }

  deleteCustomer(id: string): boolean {
    const next = this.customersSnapshot.filter((c) => c.id !== id);
    if (next.length === this.customersSnapshot.length) return false;
    this.customersSnapshot = next;
    this.emit();
    return true;
  }

  /* ── Promotion CRUD (mock) ────────────────────────────── */

  createPromotion(input: {
    code: string;
    type: CommercePromotion["type"];
    value: number;
    minOrder?: number;
    startAt: string;
    endAt: string;
    status?: CommercePromotion["status"];
  }): CommercePromotion {
    const promo: CommercePromotion = {
      id: nextId("promo"),
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      minOrder: input.minOrder ?? 0,
      currencyCode: this.storeLink.currencyCode,
      startAt: input.startAt,
      endAt: input.endAt,
      status: input.status ?? "active",
    };
    this.promotionsSnapshot = [promo, ...this.promotionsSnapshot];
    this.emit();
    return promo;
  }

  updatePromotion(
    id: string,
    patch: Partial<
      Pick<
        CommercePromotion,
        "code" | "type" | "value" | "minOrder" | "startAt" | "endAt" | "status"
      >
    >,
  ): CommercePromotion | null {
    let updated: CommercePromotion | null = null;
    this.promotionsSnapshot = this.promotionsSnapshot.map((p) => {
      if (p.id !== id) return p;
      updated = {
        ...p,
        ...patch,
        code: patch.code ? patch.code.trim().toUpperCase() : p.code,
      };
      return updated;
    });
    if (updated) this.emit();
    return updated;
  }

  deletePromotion(id: string): boolean {
    const next = this.promotionsSnapshot.filter((p) => p.id !== id);
    if (next.length === this.promotionsSnapshot.length) return false;
    this.promotionsSnapshot = next;
    this.emit();
    return true;
  }

  /* ── Store link settings (mock) ───────────────────────── */

  updateStoreLink(
    patch: Partial<
      Pick<CommerceStoreLink, "salesChannelName" | "healthMessage" | "status">
    >,
  ): CommerceStoreLink {
    this.storeLink = { ...this.storeLink, ...patch };
    this.emit();
    return this.storeLink;
  }

  /**
   * Inventory rows derived from the current products snapshot.
   * Recomputed only when products mutate to keep a stable reference
   * for useSyncExternalStore.
   */
  listInventory(): CommerceInventoryRow[] {
    return this.inventorySnapshot;
  }

  /** Adjust stock for a product (mock inventory edit). */
  updateStock(productId: string, quantity: number) {
    const qty = Math.max(0, Math.floor(quantity));
    let changed = false;
    const next = this.productsSnapshot.map((p) => {
      if (p.id !== productId || p.stock === qty) return p;
      changed = true;
      return { ...p, stock: qty, updatedAt: new Date().toISOString() };
    });
    if (!changed) return;
    this.productsSnapshot = sortProducts(next);
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.emit();
  }

  createProduct(input: {
    title: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    stock?: number;
    description?: string;
    shortDescription?: string;
    images?: string[];
    highlights?: string[];
    brand?: string;
    badge?: string;
    unit?: string;
    shippingNote?: string;
    status?: CommerceProduct["status"];
  }): CommerceProduct {
    const now = new Date().toISOString();
    const id = `prod_${Date.now().toString(36)}`;
    const handle = input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || id;

    const images = (input.images ?? [])
      .map((u) => u.trim())
      .filter(Boolean);
    const thumbnailUrl = images[0] ?? null;

    const product: CommerceProduct = {
      id,
      title: input.title.trim(),
      handle,
      sku: input.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      status: input.status ?? "published",
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? 0,
      currencyCode: "vnd",
      stock: input.stock ?? 0,
      thumbnailUrl,
      images,
      shortDescription: input.shortDescription?.trim() || "",
      description: input.description?.trim() || "",
      highlights: (input.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      brand: input.brand?.trim() || "",
      badge: input.badge?.trim() || "",
      unit: input.unit?.trim() || "",
      shippingNote: input.shippingNote?.trim() || "",
      salesChannelId: this.storeLink.salesChannelId,
      createdAt: now,
      updatedAt: now,
    };
    this.productsSnapshot = sortProducts([product, ...this.productsSnapshot]);
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.emit();
    return product;
  }

  updateProductStatus(id: string, status: CommerceProduct["status"]) {
    let changed = false;
    const next = this.productsSnapshot.map((p) => {
      if (p.id !== id || p.status === status) return p;
      changed = true;
      return { ...p, status, updatedAt: new Date().toISOString() };
    });
    if (!changed) return;
    this.productsSnapshot = sortProducts(next);
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.emit();
  }

  /** Update editable product fields (mock). */
  updateProduct(
    id: string,
    patch: Partial<
      Pick<
        CommerceProduct,
        | "title"
        | "sku"
        | "price"
        | "compareAtPrice"
        | "stock"
        | "shortDescription"
        | "description"
        | "images"
        | "highlights"
        | "brand"
        | "badge"
        | "unit"
        | "shippingNote"
        | "status"
        | "categoryId"
        | "tagIds"
      >
    >,
  ): CommerceProduct | null {
    let updated: CommerceProduct | null = null;
    const next = this.productsSnapshot.map((p) => {
      if (p.id !== id) return p;
      const images = patch.images
        ? patch.images.map((u) => u.trim()).filter(Boolean)
        : p.images;
      updated = {
        ...p,
        ...patch,
        images,
        thumbnailUrl: images[0] ?? p.thumbnailUrl ?? null,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    if (!updated) return null;
    this.productsSnapshot = sortProducts(next);
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.emit();
    return updated;
  }

  /** Delete a product (mock). */
  deleteProduct(id: string): boolean {
    const next = this.productsSnapshot.filter((p) => p.id !== id);
    if (next.length === this.productsSnapshot.length) return false;
    this.productsSnapshot = sortProducts(next);
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.emit();
    return true;
  }

  /** Same array reference until orders mutate. */
  listOrders(): CommerceOrder[] {
    return this.ordersSnapshot;
  }

  /** Dev helper: reset to seed (tests). */
  reset() {
    this.productsSnapshot = sortProducts(seedProducts.map((p) => ({ ...p })));
    this.ordersSnapshot = sortOrders(seedOrders.map((o) => ({ ...o })));
    this.inventorySnapshot = buildInventory(this.productsSnapshot);
    this.storeLink = { ...mockStoreLinkSeed };
    this.role = "owner";
    this.emit();
  }
}

export const commerceMockStore = new CommerceMockStore();
