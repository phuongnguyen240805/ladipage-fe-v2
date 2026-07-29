import { NextRequest, NextResponse } from "next/server"

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership"
import { resolveLandingPublicViewUrl } from "@/features/landing-domain-edge/services/free-subdomain.service"
import {
  listNestAiSeoLandingPageIds,
  syncNestAiSeoAfterPublish,
} from "@/features/landing-publish/services/nest-ai-seo-publish.server"
import { extractNestBearerToken } from "@/lib/platform-auth.server"
import {
  getSupabaseAdmin,
  getSupabaseAdminConfigError,
} from "@/lib/supabase-admin"

export const runtime = "nodejs"

type PublishedPage = {
  id: string
  name: string | null
  slug: string | null
  published_html: string | null
}

type ReconcileItem = {
  pageId: string
  projectId: string | null
  status: "synced" | "failed"
  message?: string
}

async function reconcileBatch(input: {
  pages: PublishedPage[]
  authHeader: string
  ownerId: string
  origin: string
}): Promise<ReconcileItem[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  return Promise.all(
    input.pages.map(async (page): Promise<ReconcileItem> => {
      const slug = page.slug?.trim() || page.id
      const publicUrl = resolveLandingPublicViewUrl(slug, {
        origin: input.origin,
      })
      const result = await syncNestAiSeoAfterPublish({
        pageId: page.id,
        html: page.published_html,
        publicUrl,
        name: page.name?.trim() || slug,
        slug,
        authHeader: input.authHeader,
      })

      if (!result?.seoProjectId || result.seoSyncStatus === "failed") {
        return {
          pageId: page.id,
          projectId: result?.seoProjectId ?? null,
          status: "failed",
          ...(result?.message ? { message: result.message } : {}),
        }
      }

      if (result.html && result.html !== page.published_html) {
        const { error } = await supabase
          .from("landing_pages")
          .update({
            published_html: result.html,
            updated_at: new Date().toISOString(),
          })
          .eq("id", page.id)
          .eq("user_id", input.ownerId)
        if (error) {
          console.warn(
            `[ai-seo/reconcile] failed to persist tracking HTML page=${page.id}: ${error.message}`,
          )
        }
      }

      return {
        pageId: page.id,
        projectId: result.seoProjectId,
        status: "synced",
      }
    }),
  )
}

/**
 * Idempotent repair for pages published before the Instatic publish callback
 * was wired to AI-SEO. It only syncs owned, published pages with no project in
 * the current Nest tenant.
 */
export async function POST(request: NextRequest) {
  const auth = await requireLandingPageOwner(request)
  if ("error" in auth) return auth.error

  const nestToken = extractNestBearerToken(request)
  if (!nestToken) {
    return NextResponse.json(
      { error: "Nest workspace session is required for AI-SEO sync." },
      { status: 401 },
    )
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          getSupabaseAdminConfigError()
          ?? "Supabase server configuration is missing.",
      },
      { status: 500 },
    )
  }

  const linkedPageIds = await listNestAiSeoLandingPageIds(
    `Bearer ${nestToken}`,
  )
  if (!linkedPageIds) {
    return NextResponse.json(
      { error: "Could not read existing AI-SEO projects." },
      { status: 502 },
    )
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, name, slug, published_html")
    .eq("user_id", auth.ownerId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const publishedPages = (data ?? []) as PublishedPage[]
  const missingPages = publishedPages.filter(
    (page) => !linkedPageIds.has(page.id),
  )
  const results: ReconcileItem[] = []

  // Keep OpenSEO/Umami provisioning load bounded while repairing old pages.
  for (let index = 0; index < missingPages.length; index += 4) {
    results.push(
      ...(await reconcileBatch({
        pages: missingPages.slice(index, index + 4),
        authHeader: `Bearer ${nestToken}`,
        ownerId: auth.ownerId,
        origin: request.nextUrl.origin,
      })),
    )
  }

  const synced = results.filter((item) => item.status === "synced").length
  const failed = results.length - synced
  return NextResponse.json({
    eligible: publishedPages.length,
    alreadyLinked: publishedPages.length - missingPages.length,
    synced,
    failed,
    results,
  })
}
