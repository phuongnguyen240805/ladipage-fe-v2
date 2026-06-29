export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    onboarding: ["dashboard", "onboarding"] as const,
  },
  billing: {
    plans: ["billing", "plans"] as const,
    usage: ["billing", "usage"] as const,
    current: ["billing", "current"] as const,
  },
  ecom: {
    orders: (params?: unknown) => ["ecom", "orders", params] as const,
    products: (params?: unknown) => ["ecom", "products", params] as const,
    tags: (entity: string, params?: unknown) =>
      ["ecom", "tags", entity, params] as const,
    customFields: (entity: string, params?: unknown) =>
      ["ecom", "custom-fields", entity, params] as const,
    categories: (params?: unknown) => ["ecom", "categories", params] as const,
    reviews: (params?: unknown) => ["ecom", "reviews", params] as const,
  },
  crm: {
    customers: (params?: unknown) => ["crm", "customers", params] as const,
    segments: (params?: unknown) => ["crm", "segments", params] as const,
    tags: (params?: unknown) => ["crm", "tags", params] as const,
    customFields: (params?: unknown) =>
      ["crm", "custom-fields", params] as const,
  },
  analytics: {
    sales: (from: string, to: string) =>
      ["analytics", "sales", from, to] as const,
    business: (from: string, to: string) =>
      ["analytics", "business", from, to] as const,
    customers: (from: string, to: string) =>
      ["analytics", "customers", from, to] as const,
  },
  settings: {
    workspace: ["settings", "workspace"] as const,
    integrations: ["settings", "integrations"] as const,
  },
} as const;