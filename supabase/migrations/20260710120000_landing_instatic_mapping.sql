-- Instatic editor mapping (Ladipage registry ↔ CMS page)

ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS external_site_id TEXT,
  ADD COLUMN IF NOT EXISTS external_page_id TEXT;

COMMENT ON COLUMN public.landing_pages.external_site_id IS 'Instatic site id for workspace mapping';
COMMENT ON COLUMN public.landing_pages.external_page_id IS 'Instatic page id for editor + artifact';

-- render_engine may be: visual-editor | puck | instatic
CREATE INDEX IF NOT EXISTS idx_landing_pages_external_page
  ON public.landing_pages (external_page_id)
  WHERE external_page_id IS NOT NULL;
