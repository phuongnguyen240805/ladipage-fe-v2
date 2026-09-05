import "@/features/facebook-ads/styles/adsmeta-facebook-ads.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FacebookAdsExtensionPreview from "@/features/facebook-ads/navigation/FacebookAdsExtensionPreview";

export const metadata: Metadata = {
  title: "Facebook Ads Extension Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FacebookAdsExtensionPreviewPage() {
  const previewEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.FACEBOOK_ADS_DEV_PREVIEW_ENABLED === "true" ||
    process.env.EXTENSION_PREVIEW_ENABLED === "true";

  if (!previewEnabled) {
    notFound();
  }

  return <FacebookAdsExtensionPreview />;
}
