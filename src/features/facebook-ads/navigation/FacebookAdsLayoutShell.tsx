"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useFacebookAdsEmbedContext } from "../runtime/useFacebookAdsEmbedContext";
import AdsMetaFloatingSupport from "./AdsMetaFloatingSupport";
import AdsMetaHeader from "./AdsMetaHeader";
import AdsMetaNavigationDrawer from "./AdsMetaNavigationDrawer";
import FacebookAdsSurface from "./FacebookAdsSurface";

type FacebookAdsLayoutProps = { children: ReactNode };

export default function FacebookAdsLayoutShell({ children }: FacebookAdsLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isEmbedded = useFacebookAdsEmbedContext();
  return (
    <FacebookAdsSurface surface={isEmbedded ? "extension" : "workspace"}>
      <div className="flex h-full min-w-0 flex-col overflow-hidden">
        <AdsMetaHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className="adsmeta-content-host min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <AdsMetaNavigationDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AdsMetaFloatingSupport />
    </FacebookAdsSurface>
  );
}
