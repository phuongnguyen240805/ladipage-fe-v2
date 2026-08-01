"use client";

import type { HTMLAttributes } from "react";
import type { FacebookAdsScenarioId, FacebookAdsSurface as SurfaceName } from "../contracts/runtime";
import { FacebookAdsRuntimeProvider } from "../runtime/FacebookAdsRuntimeProvider";

type FacebookAdsSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  surface?: SurfaceName;
  scenario?: FacebookAdsScenarioId;
};

export default function FacebookAdsSurface({
  surface = "workspace",
  scenario,
  className = "",
  ...props
}: FacebookAdsSurfaceProps) {
  const sizingClass =
    surface !== "workspace"
      ? "flex h-dvh min-h-0 flex-col overflow-hidden"
      : "h-dvh min-h-[640px] overflow-hidden";

  return (
    <FacebookAdsRuntimeProvider surface={surface} scenario={scenario}>
      <div
        {...props}
        data-facebook-ads-surface={surface}
        data-facebook-ads-scenario={scenario ?? "happy"}
        className={`adsmeta-clone dark bg-slate-950 text-slate-100 ${sizingClass} ${className}`.trim()}
      />
    </FacebookAdsRuntimeProvider>
  );
}
