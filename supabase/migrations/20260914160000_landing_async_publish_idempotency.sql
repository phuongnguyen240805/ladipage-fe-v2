-- Phase 7: durable idempotency marker for async landing publish execution.
-- Additive only: existing rows remain NULL and synchronous publishing is unaffected.
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS last_publish_job_id TEXT,
  ADD COLUMN IF NOT EXISTS last_publish_job_sequence BIGINT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_last_publish_job_id
  ON public.landing_pages(last_publish_job_id)
  WHERE last_publish_job_id IS NOT NULL;

-- One deterministic snapshot per async job. This makes retries safe even when
-- a worker times out after the page row was committed but before it received a response.
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_page_versions_publish_job
  ON public.landing_page_versions(page_id, version_name)
  WHERE version_name LIKE 'publish-job:%';
