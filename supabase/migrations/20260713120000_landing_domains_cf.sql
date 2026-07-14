-- Plan B: Cloudflare Custom Hostname metadata on landing_domains

ALTER TABLE public.landing_domains
  ADD COLUMN IF NOT EXISTS cloudflare_hostname_id TEXT,
  ADD COLUMN IF NOT EXISTS cname_target TEXT,
  ADD COLUMN IF NOT EXISTS verification_errors JSONB,
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.landing_domains.cloudflare_hostname_id IS 'Cloudflare for SaaS custom_hostname id';
COMMENT ON COLUMN public.landing_domains.cname_target IS 'User-facing CNAME target (e.g. fallback.liora.app)';
COMMENT ON COLUMN public.landing_domains.verification_errors IS 'Last CF verification / SSL errors';
COMMENT ON COLUMN public.landing_domains.last_checked_at IS 'Last refresh poll against Cloudflare API';
