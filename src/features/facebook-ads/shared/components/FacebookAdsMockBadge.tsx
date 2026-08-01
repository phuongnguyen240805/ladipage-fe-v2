"use client";

import { FlaskConical } from "lucide-react";
import { useFacebookAdsRuntime } from "../../runtime/FacebookAdsRuntimeProvider";

export default function FacebookAdsMockBadge({ className = "" }: { className?: string }) {
  const runtime = useFacebookAdsRuntime();

  if (runtime.provenance.source !== "fixture") return null;

  return (
    <span
      className={`adsmeta-mock-badge ${className}`.trim()}
      title="Dữ liệu mô phỏng, không gọi Meta API"
    >
      <FlaskConical aria-hidden="true" size={10} />
      MOCK
    </span>
  );
}

