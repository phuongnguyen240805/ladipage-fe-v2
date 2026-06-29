"use client";
import React from "react";
import { FeatureCardProps, TestimonialProps } from "../types";

// ── Feature Card Block ────────────────────────────────────────
interface FeatureCardBlockProps {
  props: FeatureCardProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

export const FeatureCardBlock: React.FC<FeatureCardBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const { icon, iconColor, iconBg, title, description, bgColor, borderColor, borderRadius } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-16 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="flex flex-col gap-4 p-6"
        style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <span
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...props, icon: e.currentTarget.textContent || "" })}
            onClick={(e) => {
              if (isSelected) e.stopPropagation();
            }}
            style={{ outline: "none" }}
          >
            {icon}
          </span>
        </div>
        {/* Text */}
        <div>
          <h3
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...props, title: e.currentTarget.textContent || "" })}
            onClick={(e) => {
              if (isSelected) e.stopPropagation();
            }}
            className="font-bold text-lg mb-1"
            style={{ color: "#0f172a", outline: "none" }}
          >
            {title}
          </h3>
          <p
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...props, description: e.currentTarget.textContent || "" })}
            onClick={(e) => {
              if (isSelected) e.stopPropagation();
            }}
            className="text-sm leading-relaxed"
            style={{ color: "#64748b", outline: "none" }}
          >
            {description}
          </p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          FEATURE CARD
        </div>
      )}
    </div>
  );
};

// ── Testimonial Block ─────────────────────────────────────────
interface TestimonialBlockProps {
  props: TestimonialProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const { quote, authorName, authorRole, authorAvatar, rating, bgColor, textColor, showRating } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-16 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="p-10 rounded-2xl"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {/* Stars */}
        {showRating && (
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5"
                fill={i < rating ? "#f59e0b" : "#e5e7eb"}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}

        {/* Quote */}
        <p
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...props, quote: e.currentTarget.textContent?.replace(/^"|"$/g, "") || "" })}
          onClick={(e) => {
            if (isSelected) e.stopPropagation();
          }}
          className="text-xl leading-relaxed mb-6 italic font-medium"
          style={{ color: textColor, outline: "none" }}
        >
          &ldquo;{quote}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p
              contentEditable={isSelected}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.({ ...props, authorName: e.currentTarget.textContent || "" })}
              onClick={(e) => {
                if (isSelected) e.stopPropagation();
              }}
              className="font-semibold text-sm"
              style={{ outline: "none" }}
            >
              {authorName}
            </p>
            <p
              contentEditable={isSelected}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.({ ...props, authorRole: e.currentTarget.textContent || "" })}
              onClick={(e) => {
                if (isSelected) e.stopPropagation();
              }}
              className="text-xs opacity-60"
              style={{ outline: "none" }}
            >
              {authorRole}
            </p>
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TESTIMONIAL
        </div>
      )}
    </div>
  );
};
