-- Supabase Migration: 20260625001500_seo_project_wizard.sql
-- Description: Database schema for SEO Project Wizard: settings, business profiles, integrations, installations, and crawl settings.

-- 1. SEO Project Settings
CREATE TABLE IF NOT EXISTS public.seo_project_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
    country_code TEXT NOT NULL DEFAULT 'VN',
    language_code TEXT NOT NULL DEFAULT 'vi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT seo_project_settings_project_unique UNIQUE (seo_project_id)
);

-- 2. Crawl Settings
CREATE TABLE IF NOT EXISTS public.crawl_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
    crawl_budget INTEGER NOT NULL DEFAULT 100,
    user_agent TEXT NOT NULL DEFAULT 'AI-SEO-Bot',
    crawl_concurrency INTEGER NOT NULL DEFAULT 2,
    respect_robots_txt BOOLEAN NOT NULL DEFAULT true,
    url_exclusion_rules TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT crawl_settings_project_unique UNIQUE (seo_project_id)
);

-- 3. SEO Project Business Profiles
CREATE TABLE IF NOT EXISTS public.seo_project_business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    industry TEXT,
    audience TEXT,
    location TEXT,
    language TEXT NOT NULL DEFAULT 'vi',
    phone TEXT,
    email TEXT,
    address TEXT,
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    social_profiles TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT seo_project_business_profiles_unique UNIQUE (seo_project_id)
);

-- 4. SEO Project Integrations
CREATE TABLE IF NOT EXISTS public.seo_project_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
    gsc_property TEXT,
    gbp_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT seo_project_integrations_unique UNIQUE (seo_project_id)
);

-- 5. SEO Project Installations
CREATE TABLE IF NOT EXISTS public.seo_project_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_project_id UUID NOT NULL REFERENCES public.seo_projects(id) ON DELETE CASCADE,
    installation_type TEXT NOT NULL CHECK (installation_type IN ('wordpress', 'cloudflare', 'custom_script')),
    script_tag TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_installed' CHECK (status IN ('not_installed', 'checking', 'installed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT seo_project_installations_unique UNIQUE (seo_project_id)
);

-- Enable RLS
ALTER TABLE public.seo_project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_project_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_project_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_project_installations ENABLE ROW LEVEL SECURITY;

-- Helper to check organization membership recursively
-- RLS Policy: settings
CREATE POLICY "Users can manage settings of their seo projects"
    ON public.seo_project_settings FOR ALL
    USING (
        seo_project_id IN (
            SELECT sp.id FROM public.seo_projects sp
            JOIN public.projects p ON p.id = sp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- RLS Policy: crawl settings
CREATE POLICY "Users can manage crawl settings of their seo projects"
    ON public.crawl_settings FOR ALL
    USING (
        seo_project_id IN (
            SELECT sp.id FROM public.seo_projects sp
            JOIN public.projects p ON p.id = sp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- RLS Policy: business profiles
CREATE POLICY "Users can manage business profiles of their seo projects"
    ON public.seo_project_business_profiles FOR ALL
    USING (
        seo_project_id IN (
            SELECT sp.id FROM public.seo_projects sp
            JOIN public.projects p ON p.id = sp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- RLS Policy: integrations
CREATE POLICY "Users can manage integrations of their seo projects"
    ON public.seo_project_integrations FOR ALL
    USING (
        seo_project_id IN (
            SELECT sp.id FROM public.seo_projects sp
            JOIN public.projects p ON p.id = sp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- RLS Policy: installations
CREATE POLICY "Users can manage installations of their seo projects"
    ON public.seo_project_installations FOR ALL
    USING (
        seo_project_id IN (
            SELECT sp.id FROM public.seo_projects sp
            JOIN public.projects p ON p.id = sp.project_id
            WHERE p.organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_seo_proj_settings_seo_proj_id ON public.seo_project_settings(seo_project_id);
CREATE INDEX IF NOT EXISTS idx_crawl_settings_seo_proj_id ON public.crawl_settings(seo_project_id);
CREATE INDEX IF NOT EXISTS idx_seo_proj_business_seo_proj_id ON public.seo_project_business_profiles(seo_project_id);
CREATE INDEX IF NOT EXISTS idx_seo_proj_integrations_seo_proj_id ON public.seo_project_integrations(seo_project_id);
CREATE INDEX IF NOT EXISTS idx_seo_proj_installations_seo_proj_id ON public.seo_project_installations(seo_project_id);
