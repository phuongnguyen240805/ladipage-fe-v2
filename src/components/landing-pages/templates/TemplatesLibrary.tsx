import React from "react";
import { TemplateItem } from "../dung-chung/types";
import { IconDownload, IconEye, IconHeart, IconPlus, IconSearch } from "../dung-chung/icons";
import { TemplateUiPreview } from "./TemplateUiPreview";

interface TemplatesLibraryProps {
  activeTemplateTab: string;
  setActiveTemplateTab: (tab: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  templateSearchQuery: string;
  setTemplateSearchQuery: (query: string) => void;
  filteredTemplates: TemplateItem[];
  likedTemplates: Record<string, boolean>;
  toggleLikeTemplate: (e: React.MouseEvent, id: string) => void;
  setSelectedTemplateForPreview: (template: TemplateItem) => void;
  handleUseTemplate: (template: TemplateItem) => void;
  canApplyTemplate?: (template: TemplateItem) => boolean;
  isLoading?: boolean;
  error?: string | null;
}

const templateTabs = [
  { id: "sample", label: "Giao diện mẫu" },
  { id: "featured", label: "Mẫu nổi bật" },
  { id: "marketplace", label: "Marketplace" },
  { id: "service", label: "Dịch vụ thiết kế" },
];

const categories = [
  { id: "all", label: "Tất cả" },
  { id: "ecommerce", label: "Thương mại điện tử" },
  { id: "service", label: "Dịch vụ" },
  { id: "others", label: "Khác" },
];

const categoryLabels: Record<TemplateItem["category"], string> = {
  all: "Tất cả",
  ecommerce: "Bán hàng",
  service: "Dịch vụ",
  others: "Khác",
};

function compactTemplateName(name: string): { code: string; title: string } {
  const [rawCode, ...rest] = name.split(" - ");
  return {
    code: rawCode?.trim() || "LDP",
    title: rest.join(" - ").trim() || name,
  };
}

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  activeTemplateTab,
  setActiveTemplateTab,
  activeCategory,
  setActiveCategory,
  templateSearchQuery,
  setTemplateSearchQuery,
  filteredTemplates,
  likedTemplates,
  toggleLikeTemplate,
  setSelectedTemplateForPreview,
  handleUseTemplate,
  canApplyTemplate = () => true,
  isLoading = false,
  error = null,
}) => {
  return (
    <div className="landing-product-library mx-auto flex w-full max-w-[1320px] flex-col gap-5">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-slate-950 dark:text-white">Kho Template</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Chọn mẫu, xem trước và tạo landing page có sẵn bố cục chỉnh sửa được.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13px] font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-9-9" />
            </svg>
            Khám phá Marketplace
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2">
          {templateTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTemplateTab(tab.id)}
              className={`h-9 rounded-lg px-4 text-xs font-black transition ${
                activeTemplateTab === tab.id
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`h-9 rounded-full px-4 text-sm font-bold transition ${
                  activeCategory === category.id
                    ? "bg-slate-950 text-white ring-1 ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[340px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm template..."
                value={templateSearchQuery}
                onChange={(event) => setTemplateSearchQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-lime-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              Dịch vụ thiết kế chỉ từ 1tr500k
              <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-black text-white">ƯU ĐÃI</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="aspect-[4/3.35] rounded-xl bg-slate-100 dark:bg-slate-900" />
              <div className="mt-4 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-500 dark:bg-red-900/50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-black text-red-800 dark:text-red-200">Không tải được Kho Template</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredTemplates.map((item) => {
            const name = compactTemplateName(item.name);
            const isLocked = !canApplyTemplate(item);

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="relative aspect-[4/3.35] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <TemplateUiPreview template={item} />

                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                      {item.isPro ? "PRO" : "FREE"}
                    </span>
                    <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-black text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-300">
                      {categoryLabels[item.category]}
                    </span>
                  </div>

                  <button
                    onClick={(event) => toggleLikeTemplate(event, item.id)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-rose-500 opacity-0 shadow-sm transition hover:scale-105 group-hover:opacity-100 dark:bg-slate-950/90"
                    aria-label="Yêu thích template"
                  >
                    <IconHeart size={16} fill={likedTemplates[item.id] ? "currentColor" : "none"} />
                  </button>

                  <div className="absolute inset-x-3 bottom-3 grid translate-y-3 grid-cols-2 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedTemplateForPreview(item)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <IconEye size={14} />
                      Xem trước
                    </button>
                    <button
                      onClick={() => handleUseTemplate(item)}
                      title={isLocked ? "Yêu cầu gói Pro" : "Sử dụng template"}
                      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-black shadow-sm transition ${
                        isLocked
                          ? "bg-slate-700 text-white hover:bg-slate-600"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      <IconPlus size={14} />
                      {isLocked ? "Nâng cấp" : "Sử dụng"}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-wide text-lime-600 dark:text-lime-300">{name.code}</div>
                      <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-snug text-slate-950 dark:text-white">
                        {name.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-400 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      <IconEye size={13} />
                      {item.views.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IconDownload size={13} />
                      {item.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-900">
            <IconSearch size={22} />
          </div>
          <p className="mt-4 text-sm font-black text-slate-800 dark:text-slate-100">Không tìm thấy template phù hợp</p>
          <p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc chọn lại danh mục.</p>
        </div>
      )}
    </div>
  );
};
