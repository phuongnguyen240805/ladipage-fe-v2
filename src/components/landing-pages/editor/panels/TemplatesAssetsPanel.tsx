"use client";
import React from "react";
import { LANDING_ASSETS, LANDING_TEMPLATE_PRESETS } from "../template-library";
import { BUILDER_ASPECT_RATIOS, BUILDER_IMAGE_STYLES, BUILDER_OUTPUT_TYPE_PRESETS } from "../builder-presets";

interface TemplatesAssetsPanelProps {
  onApplyTemplate: (templateId: string, mode: "append" | "replace") => void;
  onUseAsset: (url: string, name: string) => void;
}

export const TemplatesAssetsPanel: React.FC<TemplatesAssetsPanelProps> = ({
  onApplyTemplate,
  onUseAsset,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M21 3H3" />
        </svg>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Templates & Assets</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Mẫu dùng nhanh</span>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-600 border border-purple-100">
              {LANDING_TEMPLATE_PRESETS.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {LANDING_TEMPLATE_PRESETS.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-purple-500/40 hover:bg-purple-50/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-gray-800">{template.name}</div>
                    <div className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-gray-500">{template.description}</div>
                  </div>
                  <span className="rounded bg-gray-200/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-600">
                    {template.category}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onApplyTemplate(template.id, "append")}
                    className="cursor-pointer rounded-md border border-purple-500/30 py-1 text-[10px] font-bold text-purple-600 transition hover:bg-purple-50"
                  >
                    Thêm tiếp
                  </button>
                  <button
                    onClick={() => onApplyTemplate(template.id, "replace")}
                    className="cursor-pointer rounded-md border border-gray-300 py-1 text-[10px] font-bold text-gray-700 transition hover:bg-gray-100"
                  >
                    Dùng mẫu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Thư viện ảnh mẫu</div>
          <div className="grid grid-cols-2 gap-2">
            {LANDING_ASSETS.map((img) => (
              <div
                key={img.id}
                onClick={() => onUseAsset(img.url, img.name)}
                className="group relative cursor-pointer aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 hover:border-purple-500/60 transition shadow-sm"
                title="Gán vào block đang chọn hoặc copy URL"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 text-[9px] text-white truncate group-hover:bg-black/75">
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">AI image presets từ Builder</div>
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400">Phong cách ảnh</div>
              <div className="flex flex-wrap gap-1.5">
                {BUILDER_IMAGE_STYLES.map((style) => (
                  <span key={style.value} className="rounded-full border border-white bg-white px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
                    <span className="mr-1">{style.emoji}</span>
                    {style.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400">Kiểu đầu ra</div>
              <div className="flex flex-wrap gap-1.5">
                {BUILDER_OUTPUT_TYPE_PRESETS.map((type) => (
                  <span key={type.id} className="rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">
                    <span className="mr-1">{type.emoji}</span>
                    {type.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400">Tỉ lệ</div>
              <div className="grid grid-cols-4 gap-1.5">
                {BUILDER_ASPECT_RATIOS.map((ratio) => (
                  <span key={ratio.value} className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-center text-[9px] font-black text-gray-600 shadow-sm" title={ratio.tag}>
                    {ratio.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
