import { NextRequest, NextResponse } from "next/server";

import {
  getPublishedLandingPage,
  preparePublishedHtmlForDelivery,
} from "@/features/landing-publish/services/public-landing-html.server";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * Serve published landing pages as a standalone HTML document.
 *
 * Critical: do NOT nest published_html inside the Next.js React shell
 * (root layout + Tailwind preflight). That path broke absolute frame layout
 * and image height:100% — editor iframe preview stayed correct while /p/[slug]
 * looked wrong after publish.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const page = await getPublishedLandingPage(slug);

  if (!page || !page.published_html?.trim()) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const embed = request.nextUrl.searchParams.get("embed") === "1";
  const html = preparePublishedHtmlForDelivery(page.published_html, {
    embed,
    pageId: page.id,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
