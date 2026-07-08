-- Tighten RLS: remove shared orphan pool (user_id IS NULL) on landing satellite tables.

-- landing_page_tags: only owner of the parent page
DROP POLICY IF EXISTS "owner can manage landing page tags" ON public.landing_page_tags;
CREATE POLICY "owner can manage landing page tags"
    ON public.landing_page_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.landing_pages lp
            WHERE lp.id = landing_page_tags.page_id
              AND lp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.landing_pages lp
            WHERE lp.id = landing_page_tags.page_id
              AND lp.user_id = auth.uid()
        )
    );

-- landing_domains
DROP POLICY IF EXISTS "owner can manage landing domains" ON public.landing_domains;
CREATE POLICY "owner can manage landing domains"
    ON public.landing_domains FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- landing_leads
DROP POLICY IF EXISTS "owner can manage landing leads" ON public.landing_leads;
CREATE POLICY "owner can manage landing leads"
    ON public.landing_leads FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- landing_tags
DROP POLICY IF EXISTS "owner can manage landing tags" ON public.landing_tags;
CREATE POLICY "owner can manage landing tags"
    ON public.landing_tags FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- landing_form_configs
DROP POLICY IF EXISTS "owner can manage landing form configs" ON public.landing_form_configs;
CREATE POLICY "owner can manage landing form configs"
    ON public.landing_form_configs FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());