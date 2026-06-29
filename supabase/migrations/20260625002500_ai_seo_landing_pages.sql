-- Supabase Migration: 20260625002500_ai_seo_landing_pages.sql
-- Description: Create tables for Website Builder connection and Landing Page scoring/tasks in AI SEO platform

-- 1. Website Projects Table
CREATE TABLE IF NOT EXISTS public.website_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Website Pages Table (Landing Pages in Website Builder)
CREATE TABLE IF NOT EXISTS public.website_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    website_project_id UUID REFERENCES public.website_projects(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_type TEXT NOT NULL DEFAULT 'landing_page',
    status TEXT NOT NULL DEFAULT 'draft',
    published_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI SEO Project Pages Table (links SEO Project to Landing Pages or external URLs)
CREATE TABLE IF NOT EXISTS public.ai_seo_project_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    ai_seo_project_id UUID NOT NULL REFERENCES public.ai_seo_projects(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    website_page_id UUID REFERENCES public.website_pages(id) ON DELETE SET NULL,
    page_url TEXT NOT NULL,
    page_type TEXT NOT NULL DEFAULT 'landing_page',
    source TEXT NOT NULL DEFAULT 'internal' CHECK (source IN ('internal', 'external')),
    scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'completed', 'failed')),
    last_scan_job_id UUID,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI SEO Page Scores Table
CREATE TABLE IF NOT EXISTS public.ai_seo_page_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    ai_seo_project_page_id UUID NOT NULL REFERENCES public.ai_seo_project_pages(id) ON DELETE CASCADE,
    grader_score INTEGER NOT NULL DEFAULT 0,
    content_score INTEGER NOT NULL DEFAULT 0,
    technical_score INTEGER NOT NULL DEFAULT 0,
    ux_score INTEGER NOT NULL DEFAULT 0,
    authority_score INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ai_seo_page_scores_page_unique UNIQUE (ai_seo_project_page_id)
);

-- 5. AI SEO Page Tasks Table (Recommendations per child page)
CREATE TABLE IF NOT EXISTS public.ai_seo_page_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    ai_seo_project_page_id UUID NOT NULL REFERENCES public.ai_seo_project_pages(id) ON DELETE CASCADE,
    ai_seo_project_id UUID NOT NULL REFERENCES public.ai_seo_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'on_page',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'completed')),
    before_value TEXT,
    after_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_seo_project_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_seo_page_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_seo_page_tasks ENABLE ROW LEVEL SECURITY;

-- 6. Row-Level Security Policies
CREATE POLICY "Users can manage website projects" ON public.website_projects FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can manage website pages" ON public.website_pages FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can manage ai_seo_project_pages" ON public.ai_seo_project_pages FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can manage ai_seo_page_scores" ON public.ai_seo_page_scores FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can manage ai_seo_page_tasks" ON public.ai_seo_page_tasks FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() OR user_id IS NULL));

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_website_projects_project_id ON public.website_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_website_project_id ON public.website_pages(website_project_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_project_pages_ai_seo_project_id ON public.ai_seo_project_pages(ai_seo_project_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_page_scores_page_id ON public.ai_seo_page_scores(ai_seo_project_page_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_page_tasks_page_id ON public.ai_seo_page_tasks(ai_seo_project_page_id);
