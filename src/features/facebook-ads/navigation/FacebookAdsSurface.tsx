import type { HTMLAttributes } from "react";

type FacebookAdsSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "workspace" | "extension";
};

export default function FacebookAdsSurface({
  variant = "workspace",
  className = "",
  ...props
}: FacebookAdsSurfaceProps) {
  const sizingClass =
    variant === "extension"
      ? "flex h-dvh min-h-0 flex-col overflow-hidden"
      : "h-dvh min-h-[640px] overflow-hidden";

  return (
    <div
      {...props}
      data-facebook-ads-surface={variant}
      className={`adsmeta-clone dark bg-slate-950 text-slate-100 ${sizingClass} ${className}`.trim()}
    />
  );
}
