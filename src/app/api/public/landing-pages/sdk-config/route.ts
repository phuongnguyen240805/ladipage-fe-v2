import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  pageId: z.string().uuid().optional(),
  slug: z.string().min(1).optional(),
  domain: z.string().optional(),
  href: z.string().optional(),
}).refine((value) => value.pageId || value.slug, {
  message: "pageId or slug is required.",
});

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

function getPublicSupabaseClient() {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !url.startsWith("http") || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    pageId: request.nextUrl.searchParams.get("pageId") || undefined,
    slug: request.nextUrl.searchParams.get("slug") || undefined,
    domain: request.nextUrl.searchParams.get("domain") || undefined,
    href: request.nextUrl.searchParams.get("href") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid SDK config request." }, { status: 400 });
  }

  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase public configuration is missing." }, { status: 500 });
  }

  let query = supabase
    .from("landing_pages")
    .select("id, slug, name, published_at")
    .eq("status", "published")
    .eq("visibility", "public")
    .limit(1);

  query = parsed.data.pageId
    ? query.eq("id", parsed.data.pageId)
    : query.eq("slug", parsed.data.slug);

  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    name: data.name,
    renderUrl: `/p/${data.slug}?embed=1`,
    minHeight: 480,
    publishedAt: data.published_at,
  });
}
