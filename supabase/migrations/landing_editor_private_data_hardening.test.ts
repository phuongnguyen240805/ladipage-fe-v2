import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260724120000_landing_editor_private_data_hardening.sql"),
  "utf8",
);

describe("landing editor private data hardening migration", () => {
  it("drops old permissive landing page policies", () => {
    expect(migration).toContain('DROP POLICY IF EXISTS "Users can select their own landing pages"');
    expect(migration).toContain('DROP POLICY IF EXISTS "Anyone can view published landing pages"');
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Users can select versions of their own landing pages"',
    );
  });

  it("does not recreate orphan user_id policies", () => {
    expect(migration).not.toMatch(/user_id\s+IS\s+NULL/i);
    expect(migration).not.toMatch(/user_id\.is\.null/i);
  });

  it("removes anon table access to private editor tables", () => {
    expect(migration).toContain("REVOKE ALL ON public.landing_pages FROM anon");
    expect(migration).toContain("REVOKE ALL ON public.landing_page_versions FROM anon");
  });
});
