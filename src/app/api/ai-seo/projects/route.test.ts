import { describe, expect, it, vi } from "vitest";

import { fetchLandingPagesAsProjects } from "./projects.helpers";

describe("AI SEO projects landing page fallback isolation", () => {
  it("does not query landing pages without an authenticated owner", async () => {
    const supabase = { from: vi.fn() };

    const result = await fetchLandingPagesAsProjects(supabase as never, null);

    expect(result).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("queries only landing pages owned by the authenticated user", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const supabase = { from: vi.fn(() => query) };

    await fetchLandingPagesAsProjects(supabase as never, "user-1");

    expect(supabase.from).toHaveBeenCalledWith("landing_pages");
    expect(query.select).toHaveBeenCalledWith(
      "id, name, slug, status, updated_at, created_at, published_at, user_id",
    );
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});
