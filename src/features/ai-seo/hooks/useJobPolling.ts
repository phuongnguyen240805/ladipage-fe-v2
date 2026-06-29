import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJobDetails, fetchJobEvents } from "../api/jobs.api";

export function useJobPolling(
  arg1: string | null | undefined,
  arg2?: string | null | undefined,
  arg3?: any
) {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);

  // Parse polymorphic arguments
  let orgId = "org-1";
  let jobId: string | null = null;
  let onComplete: (() => void) | undefined = undefined;

  if (arg1 && arg1.startsWith("org-")) {
    // Signature 1: useJobPolling(orgId, jobId, seoProjectId)
    orgId = arg1;
    jobId = arg2 || null;
  } else {
    // Signature 2: useJobPolling(jobId, orgId, onComplete)
    jobId = arg1 || null;
    if (typeof arg2 === "string") {
      orgId = arg2;
    }
    if (typeof arg3 === "function") {
      onComplete = arg3;
    }
  }

  // Poll Job Details
  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobDetails(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const currentJob = query.state.data;
      if (
        currentJob?.status === "success" ||
        currentJob?.status === "failed" ||
        currentJob?.status === "cancelled"
      ) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Poll Job Events
  const { data: events = [] } = useQuery({
    queryKey: ["job-events", jobId],
    queryFn: () => fetchJobEvents(jobId!),
    enabled: !!jobId,
    refetchInterval: () => {
      if (
        job?.status === "success" ||
        job?.status === "failed" ||
        job?.status === "cancelled"
      ) {
        return false;
      }
      return 2000;
    },
  });

  useEffect(() => {
    if (!jobId) {
      setIsPolling(false);
      return;
    }

    if (
      job?.status === "success" ||
      job?.status === "failed" ||
      job?.status === "cancelled"
    ) {
      setIsPolling(false);
      if (job.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["ai-seo-projects", { orgId }] });
        if (onComplete) {
          onComplete();
        }
      }
    } else if (job) {
      setIsPolling(true);
    }
  }, [job, jobId, queryClient, orgId, onComplete]);

  return {
    job,
    events,
    isPolling,
  };
}
export default useJobPolling;
