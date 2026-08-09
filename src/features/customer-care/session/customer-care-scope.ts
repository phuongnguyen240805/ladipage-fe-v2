import type { AuthState } from '@/features/auth/types'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export interface CustomerCareScope {
  tenantId: string
  userId: string
  key: string
}

export function customerCareScopeFromState(
  state: Pick<AuthState, 'platform'>,
): CustomerCareScope | null {
  const tenantId = state.platform.tenant.tenantId ?? state.platform.tenant.activeTenantId
  const profile = state.platform.profile as {
    id?: string | number
    uid?: string | number
  } | null
  const userId = profile?.id ?? profile?.uid
  if (tenantId === undefined || tenantId === null || userId === undefined || userId === null) {
    return null
  }
  const tenant = String(tenantId).trim()
  const user = String(userId).trim()
  if (!tenant || tenant === '0' || !user || user === '0') return null
  return { tenantId: tenant, userId: user, key: `${tenant}:${user}` }
}

export function currentCustomerCareScope(): CustomerCareScope | null {
  return customerCareScopeFromState(useAuthStore.getState())
}

export function requireCustomerCareScope(): CustomerCareScope {
  const scope = currentCustomerCareScope()
  if (!scope) throw new Error('Customer Care requires an authenticated tenant and user')
  return scope
}

export function selectCustomerCareScopeKey(state: AuthState): string | null {
  return customerCareScopeFromState(state)?.key ?? null
}

export function useCustomerCareScopeKey() {
  return useAuthStore(selectCustomerCareScopeKey)
}

export function customerCareQueryKey(
  scopeKey: string,
  ...parts: readonly unknown[]
) {
  return ['customer-care', scopeKey, ...parts] as const
}
