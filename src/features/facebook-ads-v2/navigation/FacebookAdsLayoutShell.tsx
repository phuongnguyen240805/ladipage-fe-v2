"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import FacebookAdsNavigationSidebar from "./FacebookAdsNavigationSidebar";

type FacebookAdsLayoutProps = {
  children: ReactNode;
};

export default function FacebookAdsLayoutShell({
  children,
}: FacebookAdsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="facebook-ads-workspace flex min-h-[calc(100vh-64px)] min-w-0 flex-col bg-background md:flex-row">
      <FacebookAdsNavigationSidebar
        pathname={pathname}
        className="shrink-0 border-b md:w-56 md:border-b-0 md:border-r"
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}