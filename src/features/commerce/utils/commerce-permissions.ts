import type {
  CommerceMockRole,
  CommercePermission,
} from "@/features/commerce/types";

export const ALL_COMMERCE_PERMISSIONS: CommercePermission[] = [
  "commerce:product:read",
  "commerce:product:write",
  "commerce:page:bind",
  "commerce:order:read",
  "commerce:order:refund",
  "commerce:store:manage",
];

const ROLE_PERMISSIONS: Record<CommerceMockRole, CommercePermission[]> = {
  owner: [...ALL_COMMERCE_PERMISSIONS],
  admin: [...ALL_COMMERCE_PERMISSIONS],
  editor: [
    "commerce:product:read",
    "commerce:page:bind",
    "commerce:order:read",
  ],
  viewer: ["commerce:product:read", "commerce:order:read"],
};

export function permissionsForRole(role: CommerceMockRole): CommercePermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function hasCommercePermission(
  permissions: CommercePermission[],
  required: CommercePermission | CommercePermission[],
): boolean {
  const need = Array.isArray(required) ? required : [required];
  return need.every((p) => permissions.includes(p));
}

export function canWriteProduct(permissions: CommercePermission[]): boolean {
  return hasCommercePermission(permissions, "commerce:product:write");
}

export function canReadProduct(permissions: CommercePermission[]): boolean {
  return hasCommercePermission(permissions, "commerce:product:read");
}

export function canBindPage(permissions: CommercePermission[]): boolean {
  return hasCommercePermission(permissions, "commerce:page:bind");
}

export function canReadOrders(permissions: CommercePermission[]): boolean {
  return hasCommercePermission(permissions, "commerce:order:read");
}

export function canManageStore(permissions: CommercePermission[]): boolean {
  return hasCommercePermission(permissions, "commerce:store:manage");
}

/** M0: always false — monetize later (M1). */
export function isCommerceMonetizeEnabled(): boolean {
  return false;
}
