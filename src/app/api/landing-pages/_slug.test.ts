import { describe, expect, it } from "vitest";
import {
  isDuplicateUserSlugError,
  normalizeLandingSlug,
  resolveUniqueLandingSlug,
} from "./_slug";

describe("landing page slugs", () => {
  it("normalizes names into url-safe slugs", () => {
    expect(normalizeLandingSlug("Restaurant Website", "abc")).toBe("restaurant-website");
    expect(normalizeLandingSlug("  Tasty Food!! ", "abc")).toBe("tasty-food");
    expect(normalizeLandingSlug("", "abcdef12-xxxx")).toBe("page-abcdef12");
  });

  it("detects the per-user unique slug constraint", () => {
    expect(
      isDuplicateUserSlugError(
        'duplicate key value violates unique constraint "landing_pages_user_slug_unique"',
      ),
    ).toBe(true);
  });

  it("appends a suffix when the preferred slug is already taken", async () => {
    const taken = new Set(["restaurant"]);
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: (_column: string, slug: string) => ({
              maybeSingle: async () => ({
                data: taken.has(slug) ? { id: "other-page" } : null,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    await expect(
      resolveUniqueLandingSlug(client, "user-1", "restaurant", "page-new"),
    ).resolves.toBe("restaurant-2");
  });
});
