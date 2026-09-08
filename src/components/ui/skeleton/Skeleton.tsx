import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

export default function Skeleton({
  className = "",
  rounded = "md",
  ...props
}: SkeletonProps) {
  const radius = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={`ladi-skeleton ${radius} ${className}`}
      {...props}
    />
  );
}
