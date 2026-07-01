"use client";

import React, { useEffect, useState } from "react";
import type { PlanTier } from "@liora/api-types";

const MOCK_TIER_COOKIE = "X-Mock-Tier";
const TIERS: PlanTier[] = ["free", "pro", "enterprise"];

function readMockTier(): PlanTier {
  if (typeof document === "undefined") return "free";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${MOCK_TIER_COOKIE}=([^;]+)`));
  const value = match?.[1] as PlanTier | undefined;
  return value && TIERS.includes(value) ? value : "free";
}

function writeMockTier(tier: PlanTier) {
  document.cookie = `${MOCK_TIER_COOKIE}=${tier}; path=/; max-age=86400; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("ladipage:mock-tier-changed", { detail: tier }));
}

export default function MockTierPanel() {
  const [tier, setTier] = useState<PlanTier>("free");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setTier(readMockTier());
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleChange = (nextTier: PlanTier) => {
    writeMockTier(nextTier);
    setTier(nextTier);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200000]">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 shadow-lg dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200"
        >
          Dev: {tier}
        </button>
      ) : (
        <div className="w-56 rounded-xl border border-amber-200 bg-white p-3 shadow-2xl dark:border-amber-900/50 dark:bg-[#11121e]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">
              Giả lập gói
            </span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Thu gọn
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {TIERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(option)}
                className={`rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                  tier === option
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-900"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}