import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface PublishedLandingPage {
  id: string;
  name: string;
  slug: string;
  status: string;
  visibility: string;
  published_html: string | null;
  published_at: string | null;
  published_meta?: {
    title?: string;
    description?: string;
    ogImage?: string;
  } | null;
}

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

export function getPublicSupabaseClient(): SupabaseClient | null {
  const url = resolveSupabaseUrl();
  if (!url || !url.startsWith("http")) return null;
  return getSupabaseAdmin();
}

export async function getPublishedLandingPage(
  slug: string,
): Promise<PublishedLandingPage | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("landing_pages")
    .select(
      "id, name, slug, status, visibility, published_html, published_at, published_meta",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublishedLandingPage;
}

/**
 * Append embed resize messenger for SDK iframe embeds (?embed=1).
 */
export function withEmbedResizeScript(
  html: string,
  page: Pick<PublishedLandingPage, "id">,
): string {
  const script = `
<script>
(function () {
  var pageId = ${JSON.stringify(page.id)};
  function postHeight() {
    var body = document.body;
    var doc = document.documentElement;
    var height = Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      doc ? doc.clientHeight : 0,
      doc ? doc.scrollHeight : 0,
      doc ? doc.offsetHeight : 0
    );
    parent.postMessage({ type: "EM_PUBLIC_PAGE_RESIZE", pageId: pageId, height: height }, "*");
  }
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);
  if ("ResizeObserver" in window) {
    new ResizeObserver(postHeight).observe(document.documentElement);
  }
  setTimeout(postHeight, 100);
})();
</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${script}</body>`);
  }

  return `${html}${script}`;
}

/**
 * Ensure published HTML is a full document so browsers don't render it as a
 * fragment inside the Next.js app shell (Tailwind preflight breaks absolute
 * frames and image height:100%).
 */
export function ensureFullHtmlDocument(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("<!doctype") || lower.startsWith("<html")) {
    return trimmed;
  }

  return [
    "<!doctype html>",
    '<html lang="vi">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "</head>",
    "<body style=\"margin:0\">",
    trimmed,
    "</body>",
    "</html>",
  ].join("\n");
}

/**
 * Prefix root-relative asset URLs so free-subdomain / custom-domain hosts still
 * load media from the app origin (or explicit asset base).
 */
export function rewriteRootRelativeAssets(
  html: string,
  assetBaseUrl: string | null | undefined,
): string {
  if (!assetBaseUrl) return html;

  let base: string;
  try {
    const url = new URL(
      assetBaseUrl.includes("://") ? assetBaseUrl : `https://${assetBaseUrl}`,
    );
    base = url.origin;
  } catch {
    return html;
  }

  // src="/...", href="/images/...", url('/...'), url("/...")
  return html
    .replace(
      /(\s(?:src|href)=["'])\/(?!\/)/gi,
      `$1${base}/`,
    )
    .replace(
      /url\(\s*(['"]?)\/(?!\/)/gi,
      (_match, quote: string) => `url(${quote}${base}/`,
    );
}

export function resolveLandingAssetBaseUrl(): string | null {
  const raw =
    process.env.LANDING_ASSET_BASE_URL ||
    process.env.LANDING_ORIGIN_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    null;
  if (!raw || !String(raw).trim()) return null;
  try {
    const url = new URL(
      String(raw).includes("://") ? String(raw) : `https://${raw}`,
    );
    return url.origin;
  } catch {
    return null;
  }
}

export function preparePublishedHtmlForDelivery(
  html: string,
  options?: {
    embed?: boolean;
    pageId?: string;
    assetBaseUrl?: string | null;
  },
): string {
  let out = ensureFullHtmlDocument(html);
  const base =
    options?.assetBaseUrl !== undefined
      ? options.assetBaseUrl
      : resolveLandingAssetBaseUrl();
  out = rewriteRootRelativeAssets(out, base);
  if (options?.embed && options.pageId) {
    out = withEmbedResizeScript(out, { id: options.pageId });
  }
  return out;
}
