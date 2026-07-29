import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  fetchDashboardProjects,
  reconcilePublishedProjects,
} from '../api/dashboard.api'

export function useDashboardProjects(params: {
  page: number
  search: string
  status: 'all' | 'scanning' | 'not_installed' | 'ready'
  sort: 'updated_desc' | 'updated_asc' | 'favorites'
}) {
  const reconcileAttempted = useRef(false)

  return useQuery({
    queryKey: ['ai-seo', 'dashboard-projects', params],
    queryFn: async () => {
      const dashboard = await fetchDashboardProjects({
        ...params,
        pageSize: 10,
      })
      const isUnfilteredFirstPage =
        params.page === 1
        && !params.search.trim()
        && params.status === 'all'

      if (
        dashboard.pagination.totalItems === 0
        && isUnfilteredFirstPage
        && !reconcileAttempted.current
      ) {
        reconcileAttempted.current = true
        try {
          const reconciliation = await reconcilePublishedProjects()
          if (reconciliation.synced > 0) {
            return fetchDashboardProjects({
              ...params,
              pageSize: 10,
            })
          }
          if (reconciliation.eligible > 0 && reconciliation.failed > 0) {
            throw new Error('Không thể đồng bộ dự án đã publish vào AI-SEO.')
          }
        } catch (error) {
          reconcileAttempted.current = false
          throw error
        }
      }

      return dashboard
    },
    placeholderData: (previous) => previous,
    refetchInterval: (query) => {
      const scanning = query.state.data?.items.some(
        (project) => project.taskStatus === 'running'
      )
      return scanning ? 15_000 : 30_000
    },
  })
}
