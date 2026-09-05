import { QueryClient } from '@tanstack/react-query'

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Customer Care is realtime-first (WebSocket + sync recovery). Keep its query
// data in memory longer so route changes do not force the inbox/messages to
// rebuild from the network, while still allowing background revalidation.
appQueryClient.setQueryDefaults(['customer-care'], {
  staleTime: 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
})

// Lighthouse results are expensive to produce. Keep the latest result in-memory
// across route/modal unmounts; the modal still refreshes data older than 10 minutes.
appQueryClient.setQueryDefaults(['landing-page-lab'], {
  staleTime: 10 * 60_000,
  gcTime: 60 * 60_000,
  refetchOnWindowFocus: false,
})
