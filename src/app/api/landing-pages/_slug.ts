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
  lookupPageId: (slug: string) => Promise<string | null>,
  preferredSlug: string,
  pageId: string,
): Promise<string> {
  const base = normalizeLandingSlug(preferredSlug, pageId);

  const isAvailable = async (slug: string): Promise<boolean> => {
    const existingId = await lookupPageId(slug);
    return !existingId || existingId === pageId;
  };

  if (await isAvailable(base)) return base;

  for (let suffix = 2; suffix <= 99; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (await isAvailable(candidate)) return candidate;
  }

  return `${base}-${pageId.slice(0, 8)}`;
}
