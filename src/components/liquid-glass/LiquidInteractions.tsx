"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { attachLiquidRuntime } from "./liquid-runtime";
/** Standalone scope for previews; the app uses one document-wide provider. */
export function LiquidInteractions({ children, className = "", enabled = true }: { children: ReactNode; className?: string; enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { if (root.current && enabled) return attachLiquidRuntime(root.current); }, [enabled]);
  return <div ref={root} className={`liquid-interactions ${className}`}>{children}</div>;
}
