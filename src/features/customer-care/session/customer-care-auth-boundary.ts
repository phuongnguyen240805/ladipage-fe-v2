import type { QueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/stores/auth.store'

import { customerCareScopeFromState } from './customer-care-scope'

async function clearPreviousScope(queryClient: QueryClient, scopeKey: string) {
  // Cleanup code is needed only when the authenticated Customer Care scope changes.
  // Loading it here keeps Socket.IO and IndexedDB modules out of the normal app startup path.
  const [socketModule, uiStoreModule, dbModule] = await Promise.all([
    import('@/features/customer-care/realtime/customer-care-socket'),
    import('@/features/customer-care/stores/conversation-ui.store'),
    import('@/features/customer-care/storage/customer-care-db'),
  ])

  socketModule.customerCareSocket.disconnect()
  await queryClient.cancelQueries({ queryKey: ['customer-care', scopeKey] })
  queryClient.removeQueries({ queryKey: ['customer-care', scopeKey] })
  uiStoreModule.useConversationUiStore.getState().resetSession()
  await dbModule.clearCustomerCareCache(scopeKey).catch(() => undefined)
}

export function installCustomerCareAuthBoundary(queryClient: QueryClient) {
  return useAuthStore.subscribe((state, previous) => {
    const previousScope = customerCareScopeFromState(previous)
    const nextScope = customerCareScopeFromState(state)
    const scopeChanged = previousScope?.key !== nextScope?.key
    const signedOut = Boolean(previous.platform.nestToken && !state.platform.nestToken)
    if (previousScope && (scopeChanged || signedOut)) {
      void clearPreviousScope(queryClient, previousScope.key)
    }
  })
}
