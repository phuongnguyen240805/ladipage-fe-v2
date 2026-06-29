"use client";
import React from "react";
import { HeroProps } from "../types";
import { InlineEditableText } from "../components/InlineEditableText";

interface HeroBlockProps {
  props: HeroProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
  isInlineEditing?: boolean;
  onBeginInlineEdit?: () => void;
  onEndInlineEdit?: () => void;
}

function isDarkColor(color: string): boolean {
  if (!color) return true;
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 165;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 165;
  }
  return true;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  props,
  isSelected,
  onSelect,
  onUpdate,
  isInlineEditing = false,
  onBeginInlineEdit,
  onEndInlineEdit,
}) => {
  const {
    headline, subheadline, ctaText, ctaUrl, ctaColor,
    bgColor, bgImage, textAlign, minHeight, overlayOpacity,
  } = props;

  const alignClass = textAlign === "center" ? "items-center text-center" : textAlign === "right" ? "items-end text-right" : "items-start text-left";

  const bgStyle: React.CSSProperties = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: bgColor };

  const headlineColor = bgImage || isDarkColor(bgColor) ? "#fff" : "#0f172a";
  const subheadlineColor = bgImage || isDarkColor(bgColor) ? "rgba(255,255,255,0.85)" : "#475569";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full flex flex-col justify-center overflow-hidden transition-all cursor-pointer select-none ${
        isSelected
          ? "ring-2 ring-purple-500 ring-offset-1"
          : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ minHeight, ...bgStyle }}
    >
      {bgImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      <div className={`relative z-10 w-full max-w-4xl mx-auto px-8 py-16 flex flex-col gap-5 ${alignClass}`}>
        <InlineEditableText
          tag="h1"
          value={headline}
          isSelected={isSelected}
          isInlineEditing={isInlineEditing}
          onRequestEdit={() => onBeginInlineEdit?.()}
          onCommit={(nextValue) => onUpdate?.({ ...props, headline: nextValue })}
          onCancelEdit={() => onEndInlineEdit?.()}
          className="font-bold tracking-tight leading-tight"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            color: headlineColor,
          }}
        />
        <InlineEditableText
          tag="p"
          value={subheadline}
          isSelected={isSelected}
          isInlineEditing={isInlineEditing}
          onRequestEdit={() => onBeginInlineEdit?.()}
          onCommit={(nextValue) => onUpdate?.({ ...props, subheadline: nextValue })}
          onCancelEdit={() => onEndInlineEdit?.()}
          multiline
          className="max-w-2xl leading-relaxed text-base md:text-lg font-normal opacity-90"
          style={{ color: subheadlineColor }}
        />
        <a
          href={ctaUrl}
          className="inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-lg text-white shadow-sm border border-black/10 transition hover:opacity-90 active:scale-98"
          style={{ backgroundColor: ctaColor, width: "fit-content" }}
          onClick={(e) => {
            e.preventDefault();
            if (isSelected) e.stopPropagation();
          }}
        >
          <InlineEditableText
            tag="span"
            value={ctaText}
            isSelected={isSelected}
            isInlineEditing={isInlineEditing}
            onRequestEdit={() => onBeginInlineEdit?.()}
            onCommit={(nextValue) => onUpdate?.({ ...props, ctaText: nextValue })}
            onCancelEdit={() => onEndInlineEdit?.()}
          />
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>

      {isSelected && !isInlineEditing && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          HERO
        </div>
      )}
    </div>
  );
};