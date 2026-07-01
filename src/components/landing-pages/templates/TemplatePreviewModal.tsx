import React from "react";
import { TemplateItem } from "../dung-chung/types";
import { IconDownload, IconEye, IconPlus, IconX } from "../dung-chung/icons";
import { TemplateUiPreview } from "./TemplateUiPreview";

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  onClose: () => void;
  onUseTemplate: (template: TemplateItem) => void;
  canApplyTemplate?: (template: TemplateItem) => boolean;
}

function compactTemplateName(name: string): { code: string; title: string } {
  const [rawCode, ...rest] = name.split(" - ");
  return {
    code: rawCode?.trim() || "LDP",
    title: rest.join(" - ").trim() || name,
  };
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onUseTemplate,
  canApplyTemplate = () => true,
}) => {
  if (!template) return null;

  const name = compactTemplateName(template.name);
  const isLocked = !canApplyTemplate(template);

  return (
    <div className="landing-product-library fixed inset-0 z-999999 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl dark:bg-slate-950">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {name.code}
              </span>
              <span className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-black text-white">
                {template.isPro ? "PRO" : "FREE"}
              </span>
            </div>
            <h3 className="mt-2 truncate text-lg font-black text-slate-950 dark:text-white">{name.title}</h3>
            <div className="mt-1 flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="inline-flex items-center gap-1">
                <IconEye size={13} />
                {template.views.toLocaleString()} lượt xem
              </span>
              <span className="inline-flex items-center gap-1">
                <IconDownload size={13} />
                {template.downloads.toLocaleString()} lượt tải
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            aria-label="Đóng preview"
          >
            <IconX size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 dark:bg-slate-900">
          <div className="mx-auto max-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="h-3 w-3 rounded-full bg-slate-400" />
              <span className="h-3 w-3 rounded-full bg-slate-500" />
              <span className="ml-4 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 py-1 text-center text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-950">
                ladi.page/preview/{template.id}
              </span>
            </div>
            <TemplateUiPreview template={template} mode="modal" />
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Sử dụng template sẽ tạo một landing page mới và mở được trong editor.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Đóng
            </button>
            <button
              onClick={() => onUseTemplate(template)}
              title={isLocked ? "Yêu cầu gói Pro" : "Sử dụng template"}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-[13px] font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              <IconPlus size={16} />
              {isLocked ? "Nâng cấp để sử dụng" : "Sử dụng template này"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
