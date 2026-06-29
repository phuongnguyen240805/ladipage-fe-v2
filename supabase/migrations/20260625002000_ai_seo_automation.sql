-- Supabase Migration: 20260625002000_ai_seo_automation.sql
-- Description: Create tables for AI SEO Automation Dashboard (SearchAtlas behavior)

-- 1. AI SEO Projects Table
CREATE TABLE IF NOT EXISTS public.ai_seo_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL,
    site_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
    ready_for_processing BOOLEAN NOT NULL DEFAULT false,
    is_first_processing BOOLEAN NOT NULL DEFAULT true,
    task_status TEXT NOT NULL DEFAULT 'pending' CHECK (task_status IN ('pending', 'started', 'completed', 'failed')),
    pixel_tag_state TEXT NOT NULL DEFAULT 'not_installed' CHECK (pixel_tag_state IN ('not_installed', 'checking', 'installed', 'failed')),
    is_frozen BOOLEAN NOT NULL DEFAULT false,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_engaged BOOLEAN NOT NULL DEFAULT true, -- Engaged/Disengaged auto optimization toggle
    at_risk_of_wipe BOOLEAN NOT NULL DEFAULT false,
    days_until_wipe INTEGER,
    wipe_scheduled_at TIMESTAMPTZ,
    last_analysis TIMESTAMPTZ,
    next_analysis_at TIMESTAMPTZ,
    time_saved_total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AI SEO Project Scores Table
CREATE TABLE IF NOT EXISTS public.ai_seo_project_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_seo_project_id UUID NOT NULL REFERENCES public.ai_seo_projects(id) ON DELETE CASCADE,
    healthy_pages INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL DEFAULT 0,
    ai_grade_overall INTEGER NOT NULL DEFAULT 0,
    technicals_score INTEGER NOT NULL DEFAULT 0,
    ux_score INTEGER NOT NULL DEFAULT 0,
    authority_score INTEGER NOT NULL DEFAULT 0,
    content_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ai_seo_project_scores_project_unique UNIQUE (ai_seo_project_id)
);

-- 3. AI SEO Project Integrations Table
CREATE TABLE IF NOT EXISTS public.ai_seo_project_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_seo_project_id UUID NOT NULL REFERENCES public.ai_seo_projects(id) ON DELETE CASCADE,
    is_gsc_connected BOOLEAN NOT NULL DEFAULT false,
    is_gbp_connected BOOLEAN NOT NULL DEFAULT false,
    gsc_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    gbp_details_v2 JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ai_seo_project_integrations_project_unique UNIQUE (ai_seo_project_id)
);

-- Enable RLS
ALTER TABLE public.ai_seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_seo_project_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_seo_project_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage ai seo projects of their projects"
    ON public.ai_seo_projects FOR ALL
    USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

CREATE POLICY "Users can manage ai seo project scores of their projects"
    ON public.ai_seo_project_scores FOR ALL
    USING (
        ai_seo_project_id IN (
            SELECT asp.id FROM public.ai_seo_projects asp
            JOIN public.projects p ON p.id = asp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

CREATE POLICY "Users can manage ai seo project integrations of their projects"
    ON public.ai_seo_project_integrations FOR ALL
    USING (
        ai_seo_project_id IN (
            SELECT asp.id FROM public.ai_seo_projects asp
            JOIN public.projects p ON p.id = asp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ai_seo_projects_project_id ON public.ai_seo_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_project_scores_proj_id ON public.ai_seo_project_scores(ai_seo_project_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_project_integ_proj_id ON public.ai_seo_project_integrations(ai_seo_project_id);
