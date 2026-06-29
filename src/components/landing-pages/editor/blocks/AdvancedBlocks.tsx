"use client";
import React, { useEffect, useState } from "react";
import { CountdownProps, FormCaptureProps, VideoProps } from "../types";
import { InlineEditableText } from "../components/InlineEditableText";

// ── Countdown Block ───────────────────────────────────────────
interface CountdownBlockProps {
  props: CountdownProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Unit = ({ value, label, accentColor }: { value: number; label: string; accentColor: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-black text-white tabular-nums"
      style={{ backgroundColor: accentColor }}
    >
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-xs mt-1 font-medium uppercase tracking-wider opacity-70">{label}</span>
  </div>
);

const calculateTimeLeft = (targetDate: string): TimeLeft => {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

export const CountdownBlock: React.FC<CountdownBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const { targetDate, title, expiredText, bgColor, accentColor } = props;

  const [time, setTime] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const t = setInterval(() => setTime(calculateTimeLeft(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const isExpired = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full py-20 px-8 cursor-pointer transition-all flex flex-col items-center gap-6 ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: bgColor, color: "#fff" }}
    >
      <p
        contentEditable={isSelected}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...props, title: e.currentTarget.textContent || "" })}
        onClick={(e) => {
          if (isSelected) e.stopPropagation();
        }}
        className="text-sm font-semibold tracking-wider uppercase opacity-80"
        style={{ outline: "none" }}
      >
        {title}
      </p>
      {isExpired ? (
        <p
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...props, expiredText: e.currentTarget.textContent || "" })}
          onClick={(e) => {
            if (isSelected) e.stopPropagation();
          }}
          className="text-xl font-bold opacity-70"
          style={{ outline: "none" }}
        >
          {expiredText}
        </p>
      ) : (
        <div className="flex items-end gap-4">
          <Unit value={time.days} label="Ngày" accentColor={accentColor} />
          <span className="text-2xl font-black mb-4 opacity-50">:</span>
          <Unit value={time.hours} label="Giờ" accentColor={accentColor} />
          <span className="text-2xl font-black mb-4 opacity-50">:</span>
          <Unit value={time.minutes} label="Phút" accentColor={accentColor} />
          <span className="text-2xl font-black mb-4 opacity-50">:</span>
          <Unit value={time.seconds} label="Giây" accentColor={accentColor} />
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          COUNTDOWN
        </div>
      )}
    </div>
  );
};

// ── Video Block ───────────────────────────────────────────────
interface VideoBlockProps {
  props: VideoProps;
  isSelected: boolean;
  onSelect: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ props, isSelected, onSelect }) => {
  const { url, thumbnail, aspectRatio, borderRadius } = props;

  // Embed YouTube/Vimeo
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return null;
    // YouTube
    const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  const paddingRatio = aspectRatio === "16/9" ? "56.25%" : aspectRatio === "4/3" ? "75%" : "100%";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-6 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      {embedUrl ? (
        <div className="w-full overflow-hidden" style={{ borderRadius, paddingTop: paddingRatio, position: "relative" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            title="Embedded video"
          />
        </div>
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 gap-2"
          style={{ minHeight: 200, borderRadius }}
        >
          <svg className="w-14 h-14 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
          </svg>
          <span className="text-sm">Dán URL YouTube / Vimeo vào Inspector →</span>
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          VIDEO
        </div>
      )}
    </div>
  );
};

// ── Form Capture Block ────────────────────────────────────────
interface FormCaptureBlockProps {
  props: FormCaptureProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
  isInlineEditing?: boolean;
  onBeginInlineEdit?: () => void;
  onEndInlineEdit?: () => void;
}

export const FormCaptureBlock: React.FC<FormCaptureBlockProps> = ({
  props,
  isSelected,
  onSelect,
  onUpdate,
  isInlineEditing = false,
  onBeginInlineEdit,
  onEndInlineEdit,
}) => {
  const { title, subtitle, fields, submitLabel, submitColor, bgColor, borderRadius } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full px-8 py-16 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="w-full max-w-lg mx-auto p-8 shadow-sm"
        style={{ backgroundColor: bgColor, borderRadius, border: "1px solid #e5e7eb" }}
      >
        <InlineEditableText
          tag="h3"
          value={title}
          isSelected={isSelected}
          isInlineEditing={isInlineEditing}
          onRequestEdit={() => onBeginInlineEdit?.()}
          onCommit={(nextValue) => onUpdate?.({ ...props, title: nextValue })}
          onCancelEdit={() => onEndInlineEdit?.()}
          className="text-xl font-bold text-gray-800 mb-1 text-center"
        />
        <InlineEditableText
          tag="p"
          value={subtitle}
          isSelected={isSelected}
          isInlineEditing={isInlineEditing}
          onRequestEdit={() => onBeginInlineEdit?.()}
          onCommit={(nextValue) => onUpdate?.({ ...props, subtitle: nextValue })}
          onCancelEdit={() => onEndInlineEdit?.()}
          multiline
          className="text-sm text-gray-500 text-center mb-6"
        />
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type === "email" ? "email" : "text"}
                placeholder={field.label}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lime-300"
                readOnly
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-bold text-sm shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: submitColor }}
          >
          <InlineEditableText
            tag="span"
            value={submitLabel}
            isSelected={isSelected}
            isInlineEditing={isInlineEditing}
            onRequestEdit={() => onBeginInlineEdit?.()}
            onCommit={(nextValue) => onUpdate?.({ ...props, submitLabel: nextValue })}
            onCancelEdit={() => onEndInlineEdit?.()}
          />
        </button>
        </form>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          FORM
        </div>
      )}
    </div>
  );
};
