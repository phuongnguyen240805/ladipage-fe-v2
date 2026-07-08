import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { landingAiApi } from '@/lib/endpoints/landing-ai.api'

const TERMINAL_STATUSES = new Set(['success', 'failed', 'cancelled'])

export function useLandingAiJobPolling(jobId: string | null | undefined) {
  const [isPolling, setIsPolling] = useState(false)

  const { data: job } = useQuery({
    queryKey: ['landing-ai-job', jobId],
    queryFn: () => landingAiApi.getJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const current = query.state.data
      if (current && TERMINAL_STATUSES.has(current.status)) {
        return false
      }
      return 2000
    },
  })

  const { data: events = [] } = useQuery({
    queryKey: ['landing-ai-job-events', jobId],
    queryFn: () => landingAiApi.getJobEvents(jobId!),
    enabled: !!jobId,
    refetchInterval: () => {
      if (job && TERMINAL_STATUSES.has(job.status)) {
        return false
      }
      return 2000
    },
  })

  useEffect(() => {
    if (!jobId) {
      setIsPolling(false)
      return
    }

    if (!job) {
      return
    }

    setIsPolling(!TERMINAL_STATUSES.has(job.status))
  }, [job, jobId])

  return {
    job,
    events,
    isPolling,
    latestEvent: events.length > 0 ? events[events.length - 1] : null,
  }
}

export default useLandingAiJobPolling