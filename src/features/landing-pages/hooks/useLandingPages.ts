"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { landingApiFetch } from "@/lib/landing-api-client";
import { queryKeys } from "@/lib/query-keys";

export type LandingPageListItem = {
  id: string;
  name: string;
  slug: string;
  status: "PUBLISHED" | "UNPUBLISHED";
  updatedAt: string;
  views: number;
  conversions: number;
  conversionRate: string;
};

type LandingPageApiRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
  status?: string | null;
  updated_at?: string | null;
};

function formatConversionRate(views: number, conversions: number): string {
  if (views <= 0) return "—";
  return `${((conversions / views) * 100).toFixed(1)}%`;
}

function mapLandingPageRow(row: LandingPageApiRow): LandingPageListItem {
  const views = 0;
  const conversions = 0;

  return {
    id: row.id,
    name: row.name || "Untitled Page",
    slug: row.slug || row.id,
    status: row.status === "published" ? "PUBLISHED" : "UNPUBLISHED",
    updatedAt: row.updated_at || "",
    views,
    conversions,
    conversionRate: formatConversionRate(views, conversions),
  };
}

async function fetchLandingPages(): Promise<LandingPageListItem[]> {
  const result = await landingApiFetch<{ pages: LandingPageApiRow[] }>(
    "/api/landing-pages"
  );
  return (result.pages ?? []).map(mapLandingPageRow);
}

export function useLandingPages(limit?: number) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.landingPages.list,
    queryFn: async () => {
      const pages = await fetchLandingPages();
      return pages.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    enabled,
    select: (pages) => (limit ? pages.slice(0, limit) : pages),
  });
}