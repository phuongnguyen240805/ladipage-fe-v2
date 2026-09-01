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

// Lighthouse results are expensive to produce. Keep the latest result in-memory
// across route/modal unmounts; the modal still refreshes data older than 10 minutes.
appQueryClient.setQueryDefaults(['landing-page-lab'], {
  staleTime: 10 * 60_000,
  gcTime: 60 * 60_000,
  refetchOnWindowFocus: false,
})
