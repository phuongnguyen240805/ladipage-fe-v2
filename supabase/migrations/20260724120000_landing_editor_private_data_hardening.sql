-- Harden landing editor private data after Instatic rollout.

ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS external_owner_user_id TEXT,
  ADD COLUMN IF NOT EXISTS external_workspace_id TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN public.landing_pages.external_owner_user_id IS
  'Nest user uid that owns the Instatic mapping. Supabase user_id remains the primary data owner.';
COMMENT ON COLUMN public.landing_pages.external_workspace_id IS
  'Instatic workspace/site scope derived server-side from the authenticated Nest user.';

DROP POLICY IF EXISTS "Users can select their own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can insert their own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can update their own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can delete their own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Anyone can view published landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "owner can select own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "owner can insert landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "owner can update own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "owner can delete own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "public can read published landing pages" ON public.landing_pages;

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner can select own landing pages"
  ON public.landing_pages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner can insert landing pages"
  ON public.landing_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can update own landing pages"
  ON public.landing_pages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can delete own landing pages"
  ON public.landing_pages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can select versions of their own landing pages" ON public.landing_page_versions;
DROP POLICY IF EXISTS "Users can insert versions of their own landing pages" ON public.landing_page_versions;
DROP POLICY IF EXISTS "Users can delete versions of their own landing pages" ON public.landing_page_versions;
DROP POLICY IF EXISTS "owner can manage landing page versions" ON public.landing_page_versions;

ALTER TABLE public.landing_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner can manage landing page versions"
  ON public.landing_page_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.landing_pages lp
      WHERE lp.id = landing_page_versions.page_id
        AND lp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.landing_pages lp
      WHERE lp.id = landing_page_versions.page_id
        AND lp.user_id = auth.uid()
    )
  );

REVOKE ALL ON public.landing_pages FROM anon;
REVOKE ALL ON public.landing_page_versions FROM anon;
REVOKE ALL ON public.landing_pages FROM authenticated;
REVOKE ALL ON public.landing_page_versions FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_pages TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.landing_page_versions TO authenticated;
GRANT ALL ON public.landing_pages TO service_role;
GRANT ALL ON public.landing_page_versions TO service_role;
