/**
 * In-memory mock for Commerce / Medusa UI (M0).
 * Seed mirrors Medusa Cloud organization shape provided for reference.
 */

import type {
  CommerceMockRole,
  CommerceOrder,
  CommerceProduct,
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

class CommerceMockStore {
  /** Stable snapshots for useSyncExternalStore (must not allocate on getSnapshot). */
  private productsSnapshot: CommerceProduct[] = sortProducts(
    seedProducts.map((p) => ({ ...p })),
  );
  private ordersSnapshot: CommerceOrder[] = sortOrders(
    seedOrders.map((o) => ({ ...o })),
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
    this.emit();
  }

  /** Same array reference until orders mutate. */
  listOrders(): CommerceOrder[] {
    return this.ordersSnapshot;
  }

  /** Dev helper: reset to seed (tests). */
  reset() {
    this.productsSnapshot = sortProducts(seedProducts.map((p) => ({ ...p })));
    this.ordersSnapshot = sortOrders(seedOrders.map((o) => ({ ...o })));
    this.storeLink = { ...mockStoreLinkSeed };
    this.role = "owner";
    this.emit();
  }
}

export const commerceMockStore = new CommerceMockStore();
