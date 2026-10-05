"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { attachLiquidRuntime } from "./liquid-runtime";
import { attachLiquidCursor } from "./liquid-cursor";

export function LiquidGlassProvider() {
  const pathname = usePathname();
  // These are authored/published content, not application chrome.
  const enabled = !pathname?.startsWith("/p/") && !pathname?.startsWith("/extension-preview/");
  useEffect(() => {
    if (!enabled) return;
    document.body.dataset.liquidUi = "true";
    const dispose = attachLiquidRuntime(document, { tension: true });
    const disposeCursor = attachLiquidCursor();
    return () => { disposeCursor(); dispose(); delete document.body.dataset.liquidUi; };
  }, [enabled]);
  return null;
}
