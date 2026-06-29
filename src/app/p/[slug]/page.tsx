import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { ref?: string };
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

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ embed?: string }>;
}

interface PublishedPage {
  id: string;
  name: string;
  slug: string;
  status: string;
  visibility: string;
  published_html: string | null;
  published_at: string | null;
}

async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, name, slug, status, visibility, published_html, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublishedPage;
}

function withEmbedResizeScript(html: string, page: PublishedPage) {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    return {
      title: "Trang không tồn tại",
      description: "Trang này không tìm thấy hoặc chưa được xuất bản.",
    };
  }

  return {
    title: page.name,
    description: `Xem trang ${page.name}`,
    openGraph: {
      title: page.name,
      type: "website",
    },
  };
}

export default async function PublicLandingPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = await getPublishedPage(slug);

  if (!page || !page.published_html) {
    notFound();
  }

  const html =
    query?.embed === "1"
      ? withEmbedResizeScript(page.published_html, page)
      : page.published_html;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ all: "initial", display: "block" } as React.CSSProperties}
    />
  );
}
