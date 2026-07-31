"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import AdsMetaFloatingSupport from "./AdsMetaFloatingSupport";
import AdsMetaHeader from "./AdsMetaHeader";
import AdsMetaNavigationDrawer from "./AdsMetaNavigationDrawer";

type FacebookAdsLayoutProps = { children: ReactNode };

export default function FacebookAdsLayoutShell({ children }: FacebookAdsLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="adsmeta-clone dark h-dvh min-h-[640px] overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex h-full min-w-0 flex-col overflow-hidden">
        <AdsMetaHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className="adsmeta-content-host min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <AdsMetaNavigationDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AdsMetaFloatingSupport />
    </div>
  );
}
