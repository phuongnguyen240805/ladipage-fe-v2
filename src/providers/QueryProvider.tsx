"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { appQueryClient, syncQueryCacheScope } from "@/lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

function QueryCacheScopeBoundary() {
  const platformStatus = useAuthStore((state) => state.platformStatus);
  const tenant = useAuthStore((state) => state.platform.tenant);
  const profile = useAuthStore((state) => state.platform.profile);

  const scope = useMemo(() => {
    if (platformStatus !== "authenticated") return "anonymous";

    const tenantScope = String(
      tenant.activeTenantId ?? tenant.tenantId ?? "unknown-tenant",
    );
    const organizationScope = String(tenant.organizationId ?? "unknown-org");
    const userScope = profile?.email || profile?.username || "pending-user";
    return `org:${organizationScope}:tenant:${tenantScope}:user:${userScope}`;
  }, [platformStatus, profile?.email, profile?.username, tenant.activeTenantId, tenant.organizationId, tenant.tenantId]);

  useEffect(() => {
    syncQueryCacheScope(scope);
  }, [scope]);

  return null;
}

/**
 * Application-wide TanStack Query provider for authenticated app surfaces.
 * Feature-specific lifecycle hooks must be installed by the feature layout,
 * not here, so public/auth routes do not pull feature runtimes into startup.
 *
 * The cache is also scoped to the effective authenticated tenant/user. Query
 * keys inside individual features should still include tenant context when
 * practical, but this boundary prevents stale data surviving account/workspace
 * changes even for legacy keys that have not migrated yet.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={appQueryClient}>
      <QueryCacheScopeBoundary />
      {children}
    </QueryClientProvider>
  );
}
