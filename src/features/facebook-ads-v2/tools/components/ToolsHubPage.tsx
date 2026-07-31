"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles, Wrench } from "lucide-react";
import MockNotice from "../../shared/components/MockNotice";
import { adsToolCategories, adsTools } from "../tool-catalog";

const toneClasses = {
  blue: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300",
  green: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
  orange: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
};

export default function ToolsHubPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất cả");

  const filteredTools = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return adsTools.filter(
      (tool) =>
        (category === "Tất cả" || tool.category === category) &&
        (!query ||
          `${tool.name} ${tool.description}`
            .toLocaleLowerCase("vi")
            .includes(query)),
    );
  }, [category, search]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wrench size={17} />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Bộ công cụ AdsMeta</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  32 màn hình tiện ích mock, đồng bộ giao diện chính của LadiPage.
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm công cụ…"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </header>

        <div className="mt-5">
          <MockNotice />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {["Tất cả", ...adsToolCategories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium transition ${
                category === item
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/facebook-ads/tools/${tool.slug}`}
                className="group rounded-xl border border-border bg-card p-4 shadow-theme-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-theme-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tool.tone]}`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">{tool.name}</h2>
                      {["ai-ad-copy", "winning-ad-detector", "spend-forecast"].includes(tool.slug) && (
                        <Sparkles size={13} className="shrink-0 text-warning-500" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                        {tool.category}
                      </span>
                      <ArrowRight
                        size={15}
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm font-semibold">Không tìm thấy công cụ</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thử đổi từ khóa hoặc nhóm công cụ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
