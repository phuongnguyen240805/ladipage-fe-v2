import type { QueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/stores/auth.store'
import { customerCareSocket } from '@/features/customer-care/realtime/customer-care-socket'
import { useConversationUiStore } from '@/features/customer-care/stores/conversation-ui.store'
import { clearCustomerCareCache } from '@/features/customer-care/storage/customer-care-db'

import { customerCareScopeFromState } from './customer-care-scope'

async function clearPreviousScope(queryClient: QueryClient, scopeKey: string) {
  customerCareSocket.disconnect()
  await queryClient.cancelQueries({ queryKey: ['customer-care', scopeKey] })
  queryClient.removeQueries({ queryKey: ['customer-care', scopeKey] })
  useConversationUiStore.getState().resetSession()
  await clearCustomerCareCache(scopeKey).catch(() => undefined)
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
