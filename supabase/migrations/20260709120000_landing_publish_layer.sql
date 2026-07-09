-- Plan 1.5: Publish 3-layer metadata (L1 versioning + L3 SEO meta)

ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS render_engine TEXT NOT NULL DEFAULT 'visual-editor',
  ADD COLUMN IF NOT EXISTS publish_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS page_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_meta JSONB;

ALTER TABLE public.landing_page_versions
  ADD COLUMN IF NOT EXISTS published_html TEXT,
  ADD COLUMN IF NOT EXISTS published_meta JSONB,
  ADD COLUMN IF NOT EXISTS render_engine TEXT;

CREATE INDEX IF NOT EXISTS idx_landing_pages_published_lookup
  ON public.landing_pages (slug)
  WHERE status = 'published' AND visibility = 'public';