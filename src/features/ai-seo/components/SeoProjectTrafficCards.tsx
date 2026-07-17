"use client";

import React from "react";
import { Activity, Users, Eye, AlertTriangle } from "lucide-react";

import { mapTrafficEnvelopeToCard } from "@/lib/mappers/ai-seo-traffic.mapper";

import {
  useProjectTrafficQuery,
  useProvisionTrafficMutation,
} from "../hooks/useTrafficQueries";
import { isAiSeoNestApi } from "../utils/ai-seo-api-mode";

interface SeoProjectTrafficCardsProps {
  projectId: string;
  range?: "7d" | "30d";
}

export function SeoProjectTrafficCards({
  projectId,
  range = "7d",
}: SeoProjectTrafficCardsProps) {
  const nest = isAiSeoNestApi();
  const { data, isLoading, isError, refetch, isFetching } =
    useProjectTrafficQuery(projectId, range);
  const provisionMutation = useProvisionTrafficMutation(projectId);
  const model = mapTrafficEnvelopeToCard(data);

  if (!nest) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        Traffic (Umami): bật{" "}
        <code className="text-[10px] font-mono">NEXT_PUBLIC_AI_SEO_USE_NEST=true</code> để
        đồng bộ qua Nest.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/80"
          />
        ))}
      </div>
    );
  }

  const showDegraded =
    model.status === "degraded" ||
    model.status === "not_configured" ||
    model.status === "disabled" ||
    isError;

  const statusLabel =
    model.status === "ok"
      ? model.stale
        ? "Stale cache"
        : `Traffic ${range}`
      : model.status === "degraded"
        ? "Tạm không đồng bộ"
        : model.status === "not_configured"
          ? "Chưa provision Umami"
          : model.status === "disabled"
            ? "Umami tắt"
            : "Lỗi tải traffic";

  const cards = [
    {
      label: "Pageviews",
      value: formatStat(model.pageviews),
      icon: Eye,
    },
    {
      label: "Visitors",
      value: formatStat(model.visitors),
      icon: Users,
    },
    {
      label: "Visits",
      value: formatStat(model.visits),
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {statusLabel}
        </span>
        {model.stale && (
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
            stale
          </span>
        )}
      </div>

      {showDegraded && (model.message || model.status === "not_configured") && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-amber-100 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 px-2.5 py-1.5 text-[10px] text-amber-800 dark:text-amber-200">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {model.message ||
                "Umami website is not provisioned. Kiểm tra BE UMAMI_* rồi bấm kết nối."}
            </span>
          </div>
          {(model.status === "not_configured" || model.status === "degraded") && (
            <button
              type="button"
              disabled={provisionMutation.isPending || isFetching}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await provisionMutation.mutateAsync();
                  await refetch();
                } catch {
                  // error surface via message after refetch
                }
              }}
              className="self-start text-[10px] font-bold underline underline-offset-2 disabled:opacity-50"
            >
              {provisionMutation.isPending ? "Đang kết nối Umami…" : "Thử provision Umami"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900/50 px-2.5 py-2"
          >
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
              <Icon className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wide">
                {label}
              </span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStat(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export default SeoProjectTrafficCards;
