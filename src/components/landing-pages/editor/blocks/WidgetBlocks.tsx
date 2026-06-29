"use client";
import React from "react";
import { ChatWidgetProps, FunnelPopupProps } from "../types";

type UpdateFn = (props: Record<string, unknown>) => void;

const Editable: React.FC<{
  value: string;
  isSelected: boolean;
  className?: string;
  onCommit: (value: string) => void;
  as?: "span" | "p" | "h2" | "h3";
}> = ({ value, isSelected, className, onCommit, as = "span" }) => {
  const Tag = as;
  return (
    <Tag
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={(event) => onCommit(event.currentTarget.textContent || "")}
      onClick={(event) => {
        if (isSelected) event.stopPropagation();
      }}
      className={className}
      style={{ outline: "none" }}
    >
      {value}
    </Tag>
  );
};

export const ChatWidgetBlock: React.FC<{
  props: ChatWidgetProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: UpdateFn;
}> = ({ props, isSelected, onSelect, onUpdate }) => {
  const update = (next: Partial<ChatWidgetProps>) => onUpdate?.({ ...props, ...next });
  const isLeft = props.position === "left";
  const visualSrc = "/images/landing/support-ai-section.png";

  return (
    <section
      onClick={onSelect}
      className={`relative cursor-pointer px-4 py-8 transition-all sm:px-8 sm:py-12 ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: "#f7f8fb" }}
    >
      <div
        className="mx-auto grid max-w-5xl items-center gap-5 sm:gap-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))" }}
      >
        <div className={`${isLeft ? "lg:order-2" : ""} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,.10)]`}>
          <div className="relative aspect-[16/10] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={visualSrc} alt="AI support workspace" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-sm sm:p-5">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {["Lead", "Course", "Support"].map((item) => (
                  <div key={item} className="min-w-0 rounded-xl border border-slate-200 bg-white/90 px-2 py-2 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm sm:text-[12px]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${isLeft ? "lg:order-1" : ""} w-full overflow-hidden rounded-2xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,.14)]`}
          style={{ backgroundColor: props.bgColor }}
        >
          <div className="p-5 text-white" style={{ backgroundColor: props.accentColor }}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/18 text-sm font-black">LC</div>
              <div className="min-w-0 flex-1">
                <Editable
                  as="h3"
                  value={props.title}
                  isSelected={isSelected}
                  onCommit={(title) => update({ title })}
                  className="block text-[18px] font-black leading-tight"
                />
                <Editable
                  value={props.replyTime}
                  isSelected={isSelected}
                  onCommit={(replyTime) => update({ replyTime })}
                  className="mt-0.5 block text-xs font-semibold text-white/75"
                />
              </div>
            </div>
            <Editable
              as="p"
              value={props.greeting}
              isSelected={isSelected}
              onCommit={(greeting) => update({ greeting })}
              className="mt-5 block text-sm leading-relaxed text-white/90"
            />
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1">
                <Editable
                  value={props.agentName}
                  isSelected={isSelected}
                  onCommit={(agentName) => update({ agentName })}
                  className="block break-words text-sm font-black text-slate-900"
                />
                <span className="text-xs font-medium text-slate-500">Online</span>
              </div>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))" }}>
              <button className="min-h-10 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold leading-tight text-slate-700">
                <Editable value={props.primaryChannel} isSelected={isSelected} onCommit={(primaryChannel) => update({ primaryChannel })} />
              </button>
              <button className="min-h-10 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold leading-tight text-slate-700">
                <Editable value={props.secondaryChannel} isSelected={isSelected} onCommit={(secondaryChannel) => update({ secondaryChannel })} />
              </button>
            </div>

            {props.showSurvey && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">Bạn quan tâm nội dung nào?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Tư vấn", "Báo giá", "Hỗ trợ"].map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="min-h-12 w-full rounded-xl px-4 py-3 text-sm font-black leading-tight text-white" style={{ backgroundColor: props.accentColor }}>
              <Editable value={props.buttonLabel} isSelected={isSelected} onCommit={(buttonLabel) => update({ buttonLabel })} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FunnelPopupBlock: React.FC<{
  props: FunnelPopupProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: UpdateFn;
}> = ({ props, isSelected, onSelect, onUpdate }) => {
  const update = (next: Partial<FunnelPopupProps>) => onUpdate?.({ ...props, ...next });

  return (
    <section
      onClick={onSelect}
      className={`relative cursor-pointer overflow-hidden px-8 py-12 transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: props.showBackdrop ? "rgba(15,23,42,.72)" : "#f8fafc" }}
    >
      <div
        className="mx-auto grid max-w-3xl overflow-hidden rounded-2xl border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,.24)] md:grid-cols-[.85fr_1.15fr]"
        style={{ backgroundColor: props.bgColor }}
      >
        <div className="min-h-[260px] bg-slate-100">
          {props.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.imageUrl} alt={props.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[260px] flex-col justify-end bg-slate-100 p-6">
              <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm">FunnelX</span>
              <div className="mt-4 h-24 rounded-xl bg-white/65 shadow-inner" />
            </div>
          )}
        </div>
        <div className="p-7">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Trigger: {props.trigger.replaceAll("_", " ")}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Frequency: {props.frequency}</span>
          </div>
          <Editable
            as="h2"
            value={props.title}
            isSelected={isSelected}
            onCommit={(title) => update({ title })}
            className="block text-3xl font-black leading-tight text-slate-950"
          />
          <Editable
            as="p"
            value={props.description}
            isSelected={isSelected}
            onCommit={(description) => update({ description })}
            className="mt-3 block text-sm leading-relaxed text-slate-600"
          />
          <a
            href={props.ctaUrl}
            onClick={(event) => event.preventDefault()}
            className="mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg"
            style={{ backgroundColor: props.accentColor }}
          >
            <Editable value={props.ctaText} isSelected={isSelected} onCommit={(ctaText) => update({ ctaText })} />
          </a>
          <p className="mt-5 text-xs font-medium text-slate-400">Popup preview. Trigger chạy ở trang xuất bản theo cấu hình.</p>
        </div>
      </div>
    </section>
  );
};
