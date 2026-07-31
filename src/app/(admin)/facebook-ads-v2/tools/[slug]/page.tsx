import ToolPreviewPage from "@/features/facebook-ads/tools/components/ToolPreviewPage";
import { adsTools } from "@/features/facebook-ads/tools/tool-catalog";

export function generateStaticParams() {
  return adsTools.map((tool) => ({ slug: tool.slug }));
}

export default async function FacebookAdsToolRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolPreviewPage slug={slug} />;
}
