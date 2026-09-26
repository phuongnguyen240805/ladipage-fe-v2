type SlugLookupClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (
          column: string,
          value: string,
        ) => {
          maybeSingle: () => PromiseLike<{
            data: { id?: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export function normalizeLandingSlug(raw: string, pageId: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `page-${pageId.slice(0, 8)}`;
}

export function isDuplicateUserSlugError(message: string): boolean {
  return message.toLowerCase().includes("landing_pages_user_slug_unique");
}

export async function resolveUniqueLandingSlug(
  client: SlugLookupClient,
  userId: string,
  preferredSlug: string,
  pageId: string,
): Promise<string> {
  const base = normalizeLandingSlug(preferredSlug, pageId);

  const isAvailable = async (slug: string): Promise<boolean> => {
    const { data, error } = await client
      .from("landing_pages")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve landing page slug: ${error.message}`);
    }

    return !data || data.id === pageId;
  };

  if (await isAvailable(base)) return base;

  for (let suffix = 2; suffix <= 99; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (await isAvailable(candidate)) return candidate;
  }

  return `${base}-${pageId.slice(0, 8)}`;
}
