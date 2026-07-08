-- Backup raw AI HTML + generation metadata for Plan 2 Puck migration
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS ai_source_html TEXT,
  ADD COLUMN IF NOT EXISTS generation_meta JSONB DEFAULT '{}'::jsonb;