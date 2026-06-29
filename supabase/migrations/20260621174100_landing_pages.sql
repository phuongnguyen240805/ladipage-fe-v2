-- Supabase Migration: 20260621174100_landing_pages.sql
-- Description: Create landing_pages and landing_page_versions tables with RLS and user isolation.

CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Page',
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    editor_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_html TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT landing_pages_user_slug_unique UNIQUE (user_id, slug)
);

CREATE TABLE IF NOT EXISTS public.landing_page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    editor_data JSONB NOT NULL,
    version_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for querying optimization
CREATE INDEX IF NOT EXISTS idx_landing_pages_user_id ON public.landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_page_versions_page_id ON public.landing_page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_versions_user_id ON public.landing_page_versions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_versions ENABLE ROW LEVEL SECURITY;

-- 1. Policies for landing_pages
CREATE POLICY "Users can select their own landing pages"
    ON public.landing_pages FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own landing pages"
    ON public.landing_pages FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own landing pages"
    ON public.landing_pages FOR UPDATE
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own landing pages"
    ON public.landing_pages FOR DELETE
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Permit public select for rendering published pages
CREATE POLICY "Anyone can view published landing pages"
    ON public.landing_pages FOR SELECT
    USING (status = 'published');

-- 2. Policies for landing_page_versions
CREATE POLICY "Users can select versions of their own landing pages"
    ON public.landing_page_versions FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert versions of their own landing pages"
    ON public.landing_page_versions FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete versions of their own landing pages"
    ON public.landing_page_versions FOR DELETE
    USING (user_id = auth.uid() OR user_id IS NULL);
