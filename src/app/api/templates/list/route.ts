import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { templateSeedData } from "@/components/landing-pages/templates/template-seed-data";

export const runtime = "nodejs";

function resolveSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      ref?: string;
    };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

function getServiceClient() {
  const url = resolveSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url?.startsWith("http") || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function withSeedIds() {
  return templateSeedData.map((item, index) => ({
    ...item,
    id: `seed-${item.template_key || index}`,
  }));
}

function filterSeed(
  items: ReturnType<typeof withSeedIds>,
  filters: {
    category?: string | null;
    search?: string | null;
    tag?: string | null;
    is_featured?: string | null;
  }
) {
  return items.filter((item) => {
    if (filters.category && filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (filters.is_featured === "true" && !item.is_featured) return false;
    if (filters.tag && !item.tags?.includes(filters.tag)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    category: searchParams.get("category"),
    search: searchParams.get("search"),
    tag: searchParams.get("tag"),
    is_featured: searchParams.get("is_featured"),
  };

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ items: filterSeed(withSeedIds(), filters) });
  }

  let query = supabase
    .from("landing_page_templates")
    .select("*")
    .eq("is_published", true);

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.is_featured === "true") {
    query = query.eq("is_featured", true);
  }
  if (filters.tag) {
    query = query.contains("tags", [filters.tag]);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("[api/templates/list]", error.message);
    return NextResponse.json({ items: filterSeed(withSeedIds(), filters) });
  }

  if (!data?.length) {
    return NextResponse.json({ items: filterSeed(withSeedIds(), filters) });
  }

  return NextResponse.json({ items: data });
}