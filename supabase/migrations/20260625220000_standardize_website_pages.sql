-- Migration: Standardize website_pages and ensure idempotent connect-ai-seo links
-- Path: supabase/migrations/20260625220000_standardize_website_pages.sql

-- 1. Add integration columns to website_pages table if they do not exist
ALTER TABLE public.website_pages 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'builder',
ADD COLUMN IF NOT EXISTS source_landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- 2. Clean up any existing duplicate links before applying unique constraint
DELETE FROM public.ai_seo_project_pages a
USING public.ai_seo_project_pages b
WHERE a.id < b.id 
  AND a.ai_seo_project_id = b.ai_seo_project_id 
  AND a.website_page_id = b.website_page_id;

-- 3. Add unique constraint to ai_seo_project_pages(ai_seo_project_id, website_page_id)
ALTER TABLE public.ai_seo_project_pages
DROP CONSTRAINT IF EXISTS ai_seo_project_pages_project_page_unique;

ALTER TABLE public.ai_seo_project_pages
ADD CONSTRAINT ai_seo_project_pages_project_page_unique UNIQUE (ai_seo_project_id, website_page_id);
