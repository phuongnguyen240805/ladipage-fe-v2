-- Junction table: landing pages <-> tags

CREATE TABLE IF NOT EXISTS public.landing_page_tags (
    page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.landing_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (page_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_landing_page_tags_page_id ON public.landing_page_tags(page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_tags_tag_id ON public.landing_page_tags(tag_id);

ALTER TABLE public.landing_page_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage landing page tags" ON public.landing_page_tags;
CREATE POLICY "owner can manage landing page tags"
    ON public.landing_page_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.landing_pages lp
            WHERE lp.id = landing_page_tags.page_id
              AND (lp.user_id = auth.uid() OR lp.user_id IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.landing_pages lp
            WHERE lp.id = landing_page_tags.page_id
              AND (lp.user_id = auth.uid() OR lp.user_id IS NULL)
        )
    );

GRANT ALL ON public.landing_page_tags TO service_role, authenticated, anon;