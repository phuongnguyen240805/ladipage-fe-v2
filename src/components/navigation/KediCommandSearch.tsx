"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

type CommandItem = {
  label: string;
  path: string;
  group: string;
  keywords?: string[];
};

const COMMANDS: CommandItem[] = [
  { label: "Tổng quan", path: "/", group: "Công việc", keywords: ["dashboard", "home"] },
  { label: "Landing Page", path: "/landing-pages", group: "Công việc", keywords: ["website", "page", "builder"] },
  { label: "Bán hàng", path: "/ban-hang", group: "Công việc", keywords: ["sales", "order", "don hang"] },
  { label: "Khách hàng", path: "/khach-hang", group: "Công việc", keywords: ["crm", "customer", "lead"] },
  { label: "Hội thoại CSKH", path: "/cskh/hoi-thoai", group: "Công việc", keywords: ["chat", "support", "message"] },
  { label: "Automation", path: "/automation", group: "Công việc", keywords: ["workflow", "tu dong hoa"] },
  { label: "Báo cáo", path: "/bao-cao", group: "Công việc", keywords: ["report", "analytics"] },
  { label: "Kho ứng dụng", path: "/kho-ung-dung", group: "Ứng dụng", keywords: ["app", "store"] },
  { label: "Kedi Ads", path: "/facebook-ads/manager", group: "Ứng dụng", keywords: ["facebook", "meta", "ads"] },
  { label: "Kedi SEO", path: "/ai-seo", group: "Ứng dụng", keywords: ["seo", "ai", "search"] },
  { label: "Kedi Analytics", path: "/site-metrics", group: "Ứng dụng", keywords: ["metrics", "analytics", "tracking"] },
  { label: "Kedi Content", path: "/content", group: "Ứng dụng", keywords: ["content", "blog"] },
  { label: "Kedi CloudPhone", path: "/cloudphone/cua-hang-cho-thue", group: "Ứng dụng", keywords: ["phone", "device"] },
  { label: "Kedi Learning", path: "/e-learning", group: "Ứng dụng", keywords: ["education", "course"] },
  { label: "Cài đặt", path: "/settings", group: "Hệ thống", keywords: ["settings", "account"] },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi")
    .trim();
}

export default function KediCommandSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return COMMANDS.slice(0, 7);

    return COMMANDS.filter((item) => {
      const haystack = normalize(
        [item.label, item.group, ...(item.keywords ?? [])].join(" "),
      );
      return haystack.includes(normalizedQuery);
    }).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, [pathname]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const navigate = (item: CommandItem | undefined) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(item.path);
  };

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-kedi-navy/45 dark:text-white/45"
        strokeWidth={2}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            navigate(results[activeIndex]);
          } else if (event.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Tìm trang hoặc chức năng..."
        className="h-9 w-full rounded-lg border border-kedi-navy/15 bg-white py-0 pl-9 pr-14 text-sm text-kedi-navy outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-kedi-navy/40 hover:border-kedi-navy/30 focus:border-kedi-yellow focus:ring-3 focus:ring-kedi-yellow/20 dark:border-white/20 dark:bg-kedi-navy dark:text-white dark:placeholder:text-white/40 dark:hover:border-kedi-yellow/40 dark:focus:border-kedi-yellow"
        role="combobox"
        aria-expanded={open}
        aria-controls="kedi-command-results"
        aria-autocomplete="list"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-kedi-navy/10 bg-gray-50 px-1.5 py-1 text-xs font-semibold text-kedi-navy/45 dark:border-white/15 dark:bg-white/5 dark:text-white/50">
        <span>⌘</span>
        <span>K</span>
      </span>

      {open && (
        <div
          id="kedi-command-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100000] overflow-hidden rounded-xl border border-kedi-navy/10 bg-white p-1.5 shadow-theme-lg dark:border-white/15 dark:bg-gray-900"
        >
          {results.length > 0 ? (
            <>
              <div className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-[0.08em] text-kedi-navy/45 dark:text-white/45">
                Đi đến
              </div>
              {results.map((item, index) => (
                <button
                  key={item.path}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(item)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors ${
                    index === activeIndex
                      ? "bg-brand-50 text-kedi-navy dark:bg-kedi-yellow/10 dark:text-kedi-yellow"
                      : "text-kedi-navy/80 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
                  }`}
                >
                  <Search className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                  <span className="shrink-0 text-xs text-current opacity-55">{item.group}</span>
                  {index === activeIndex && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-55" aria-hidden="true" />
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-6 text-center text-sm text-kedi-navy/55 dark:text-white/55">
              Không tìm thấy trang phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
