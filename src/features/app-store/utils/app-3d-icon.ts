import type { App3DIconName } from "@/components/navigation/App3DIcon";
import type { AppItem } from "../types";

export const app3dIconByCatalogName: Record<AppItem["iconName"], App3DIconName> = {
  website: "website",
  store: "ecommerce",
  dynamic: "automation",
  elearning: "learning",
  fbads: "ads",
  cloudphone: "cloudphone",
  offerkit: "offerkit",
  seo: "seo",
  metrics: "analytics",
  local: "local",
  content: "content",
  keywords: "keywords",
  reports: "reports",
  authority: "authority",
};
