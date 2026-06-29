"use client";
import React from "react";
import { EditorData } from "../types";
import { PageSettingsPanel } from "../InspectorPanel";
import { BUILDER_FONT_STYLE_PRESETS } from "../builder-presets";

interface BrandingPanelProps {
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const applyFontPreset = (preset: (typeof BUILDER_FONT_STYLE_PRESETS)[number]) => {
    onUpdateSettings("fontFamily", preset.fonts.bodyStack);
    onUpdateSettings("primaryColor", preset.theme.primaryColor);
    onUpdateSettings("bgColor", preset.theme.bgColor);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white text-gray-800">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-1.178-.256H5.25a2.25 2.25 0 00-2.25 2.25v1.875c0 .345.029.689.086 1.026a3.385 3.385 0 006.084 1.15l.982-1.656a3 3 0 00.57-1.56h.03c.105 0 .21-.005.312-.015" />
          <circle cx="12" cy="7" r="1.5" />
          <circle cx="17" cy="10" r="1.5" />
          <circle cx="15" cy="15" r="1.5" />
        </svg>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cấu hình Brand & Trang</h3>
      </div>
      <PageSettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />

      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
          Preset font từ Builder
        </div>
        <div className="grid grid-cols-1 gap-2">
          {BUILDER_FONT_STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyFontPreset(preset)}
              className="group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-purple-400 hover:bg-purple-50"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm ring-1 ring-gray-200"
                  style={{ fontFamily: preset.fonts.displayStack, color: preset.theme.primaryColor }}
                >
                  {preset.emoji}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-gray-850" style={{ fontFamily: preset.fonts.displayStack }}>
                    {preset.name}
                  </div>
                  <div className="mt-1 text-[10px] font-medium leading-relaxed text-gray-500">{preset.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-gray-400">
                    <span>{preset.fonts.display}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{preset.fonts.body}</span>
                    <span className="ml-auto h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: preset.theme.primaryColor }} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
