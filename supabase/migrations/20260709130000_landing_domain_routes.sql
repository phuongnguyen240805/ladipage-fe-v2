-- Phase 2 optional: custom domain → landing page mapping (Cloudflare edge)

CREATE TABLE IF NOT EXISTS public.landing_domain_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES public.landing_domains(id) ON DELETE CASCADE,
    landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    path_prefix TEXT NOT NULL DEFAULT '/',
    origin_slug TEXT NOT NULL,
    edge_status TEXT NOT NULL DEFAULT 'pending',
    cloudflare_hostname_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT landing_domain_routes_unique_path UNIQUE (domain_id, path_prefix)
);

CREATE INDEX IF NOT EXISTS idx_landing_domain_routes_page
  ON public.landing_domain_routes (landing_page_id);

CREATE INDEX IF NOT EXISTS idx_landing_domain_routes_domain
  ON public.landing_domain_routes (domain_id);

ALTER TABLE public.landing_domain_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing domain routes" ON public.landing_domain_routes;
CREATE POLICY "owner can manage landing domain routes"
    ON public.landing_domain_routes FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.landing_domains d
        WHERE d.id = landing_domain_routes.domain_id
          AND (d.user_id = auth.uid() OR d.user_id IS NULL)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.landing_domains d
        WHERE d.id = landing_domain_routes.domain_id
          AND (d.user_id = auth.uid() OR d.user_id IS NULL)
      )
    );

GRANT ALL ON public.landing_domain_routes TO service_role, authenticated;