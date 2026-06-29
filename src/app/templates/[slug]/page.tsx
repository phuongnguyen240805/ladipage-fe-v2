import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicLandingTemplateByIdOrSlug,
  PublicLandingTemplate,
} from "@/features/landing-templates/shared/public-template-service";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ embed?: string }>;
}

function getRenderableHtml(template: PublicLandingTemplate) {
  return template.preview_html || template.published_html || "";
}

function withEmbedResizeScript(html: string, template: PublicLandingTemplate) {
  const script = `
<script>
(function () {
  var templateId = ${JSON.stringify(template.id)};
  var slug = ${JSON.stringify(template.slug)};
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
    parent.postMessage({ type: "EM_TEMPLATE_RESIZE", templateId: templateId, slug: slug, height: height }, "*");
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
  const template = await getPublicLandingTemplateByIdOrSlug({ slug });

  if (!template) {
    return {
      title: "Template không tồn tại",
      description: "Template này không tìm thấy hoặc chưa được xuất bản.",
    };
  }

  return {
    title: template.name,
    description: `Xem trước template ${template.name}`,
    openGraph: {
      title: template.name,
      type: "website",
      images: template.thumbnail_url || template.preview_image_url ? [template.thumbnail_url || template.preview_image_url || ""] : undefined,
    },
  };
}

export default async function PublicLandingTemplatePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const template = await getPublicLandingTemplateByIdOrSlug({ slug });

  if (!template) {
    notFound();
  }

  const html = getRenderableHtml(template);
  if (!html) {
    notFound();
  }

  const renderedHtml = query?.embed === "1" ? withEmbedResizeScript(html, template) : html;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      style={{ all: "initial", display: "block" } as React.CSSProperties}
    />
  );
}
