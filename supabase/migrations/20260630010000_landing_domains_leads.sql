-- Landing Pages: domains, leads, tags, form configs

CREATE TABLE IF NOT EXISTS public.landing_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Ladipage',
    status TEXT NOT NULL DEFAULT 'VERIFIED',
    ssl_status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_domains_user_id ON public.landing_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_domains_name ON public.landing_domains(name);

ALTER TABLE public.landing_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing domains" ON public.landing_domains;
CREATE POLICY "owner can manage landing domains"
    ON public.landing_domains FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS public.landing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
    landing_page_slug TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Mới',
    is_error BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_leads_user_id ON public.landing_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_leads_page_id ON public.landing_leads(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created_at ON public.landing_leads(created_at DESC);

ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing leads" ON public.landing_leads;
CREATE POLICY "owner can manage landing leads"
    ON public.landing_leads FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS public.landing_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNLOCKED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_tags_user_id ON public.landing_tags(user_id);

ALTER TABLE public.landing_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing tags" ON public.landing_tags;
CREATE POLICY "owner can manage landing tags"
    ON public.landing_tags FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS public.landing_form_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'API',
    linked_accounts INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_form_configs_user_id ON public.landing_form_configs(user_id);

ALTER TABLE public.landing_form_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing form configs" ON public.landing_form_configs;
CREATE POLICY "owner can manage landing form configs"
    ON public.landing_form_configs FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Grant service_role and authenticated access via PostgREST
GRANT ALL ON public.landing_domains TO service_role, authenticated, anon;
GRANT ALL ON public.landing_leads TO service_role, authenticated, anon;
GRANT ALL ON public.landing_tags TO service_role, authenticated, anon;
GRANT ALL ON public.landing_form_configs TO service_role, authenticated, anon;
GRANT ALL ON public.landing_pages TO service_role, authenticated, anon;
GRANT ALL ON public.landing_page_versions TO service_role, authenticated, anon;
GRANT ALL ON public.landing_page_templates TO service_role, authenticated, anon;