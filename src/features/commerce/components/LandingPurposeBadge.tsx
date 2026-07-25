"use client";

import React from "react";

import type {
  LandingCommerceProfile,
  LandingPagePurpose,
} from "@/features/commerce/types";

const PURPOSE_META: Record<
  LandingPagePurpose,
  { label: string; className: string }
> = {
  lead: {
    label: "Lead",
    className:
      "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-gray-800 border-slate-200/60 dark:border-gray-700",
  },
  sales: {
    label: "Bán hàng",
    className:
      "text-[#65a30d] bg-lime-50 dark:text-lime-300 dark:bg-lime-950/40 border-lime-200/60 dark:border-lime-900/50",
  },
  hybrid_lead_sales: {
    label: "Lead + Bán",
    className:
      "text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/40 border-sky-200/60 dark:border-sky-900/50",
  },
  content: {
    label: "Nội dung",
    className:
      "text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/40 border-violet-200/60",
  },
};

export function LandingPurposeBadge({
  purpose,
  bindingCount = 0,
}: {
  purpose: LandingPagePurpose;
  bindingCount?: number;
}) {
  const meta = PURPOSE_META[purpose];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${meta.className}`}
    >
      {meta.label}
      {bindingCount > 0 && (
        <span className="opacity-80">· {bindingCount} SP</span>
      )}
    </span>
  );
}

export function LandingCommerceSummaryBadges({
  profile,
}: {
  profile: LandingCommerceProfile;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <LandingPurposeBadge
        purpose={profile.purpose}
        bindingCount={profile.bindings.length}
      />
      {profile.commerceEngine === "medusa" && profile.bindings.length > 0 && (
        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30 border-emerald-200/50">
          Online
        </span>
      )}
    </div>
  );
}
