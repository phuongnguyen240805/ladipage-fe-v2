-- Supabase Migration: 20260624235500_ai_seo_platform.sql
-- Description: Database schema for AI SEO Platform with multi-tenancy, background jobs, and quota tracking.

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT organization_members_org_user_unique UNIQUE (organization_id, user_id)
);

-- 3. Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SEO Projects (OTTO Automation Settings)
CREATE TABLE IF NOT EXISTS public.seo_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    gsc_connected BOOLEAN NOT NULL DEFAULT false,
    ga_connected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT seo_projects_project_unique UNIQUE (project_id)
);

-- 5. SEO Tasks (Recommendations Board)
CREATE TABLE IF NOT EXISTS public.seo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    importance TEXT NOT NULL CHECK (importance IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SEO Task Activity Logs
CREATE TABLE IF NOT EXISTS public.seo_task_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.seo_tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Quota Definitions
CREATE TABLE IF NOT EXISTS public.quota_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    limit_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Quota Balances
CREATE TABLE IF NOT EXISTS public.quota_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    quota_definition_id UUID NOT NULL REFERENCES public.quota_definitions(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT quota_balances_org_definition_unique UNIQUE (organization_id, quota_definition_id)
);

-- 9. Quota Usage Logs
CREATE TABLE IF NOT EXISTS public.quota_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    quota_definition_id UUID NOT NULL REFERENCES public.quota_definitions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Jobs (Async Background Task State)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Job Events (Streaming Log Output)
CREATE TABLE IF NOT EXISTS public.job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_seo_projects_project_id ON public.seo_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_project_id ON public.seo_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_task_activity_task_id ON public.seo_task_activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_quota_balances_org_id ON public.quota_balances(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_proj_id ON public.jobs(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_job_events_job_id ON public.job_events(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

-- 1. Policies for organizations (members of the organization can view)
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- 2. Policies for organization_members
CREATE POLICY "Users can view members of their organizations"
    ON public.organization_members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- 3. Policies for projects
CREATE POLICY "Users can manage projects in their organizations"
    ON public.projects FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- 4. Policies for seo_projects
CREATE POLICY "Users can manage seo projects of their projects"
    ON public.seo_projects FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- 5. Policies for seo_tasks
CREATE POLICY "Users can manage seo tasks of their projects"
    ON public.seo_tasks FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members 
                WHERE user_id = auth.uid() OR user_id IS NULL
            )
        )
    );

-- 6. Policies for jobs
CREATE POLICY "Users can view jobs in their organizations"
    ON public.jobs FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Seed Initial Quota Definitions & Static Data
INSERT INTO public.quota_definitions (name, limit_value)
VALUES 
    ('seo_audits', 10),
    ('content_words', 50000),
    ('keyword_lookups', 500)
ON CONFLICT (name) DO UPDATE SET limit_value = EXCLUDED.limit_value;
