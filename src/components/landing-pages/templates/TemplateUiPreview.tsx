"use client";

import React, { useEffect, useRef } from "react";
import { TemplateItem } from "../dung-chung/types";
import { LANDING_TEMPLATE_PRESETS, LandingTemplatePreset, resolveTemplatePresetId } from "../editor/template-library";
import { EditorBlock } from "../editor/types";
import { HeroBlock } from "../editor/blocks/HeroBlock";
import { TextBlock } from "../editor/blocks/TextBlock";
import { ImageBlock } from "../editor/blocks/ImageBlock";
import { ButtonBlock } from "../editor/blocks/ButtonBlock";
import { SpacerBlock, DividerBlock } from "../editor/blocks/SpacerBlock";
import { FeatureCardBlock, TestimonialBlock } from "../editor/blocks/SocialBlocks";
import { CountdownBlock, VideoBlock, FormCaptureBlock } from "../editor/blocks/AdvancedBlocks";
import { TeaLandingBlock } from "../editor/blocks/TeaLandingBlock";
import { ChatWidgetBlock, FunnelPopupBlock } from "../editor/blocks/WidgetBlocks";
import {
  AccordionBlock,
  BoxBlock,
  CarouselBlock,
  CollectionListBlock,
  FrameBlock,
  GalleryBlock,
  HtmlCodeBlock,
  IconBlock,
  MenuBlock,
  ProductCardBlock,
  SurveyBlock,
  TableBlock,
  TabsBlock,
} from "../editor/blocks/NewLadiBlocks";

function getPreset(template: TemplateItem): LandingTemplatePreset {
  const presetId = resolveTemplatePresetId({ id: template.id, name: template.name, templateId: template.templateId });
  return LANDING_TEMPLATE_PRESETS.find((preset) => preset.id === presetId) ?? LANDING_TEMPLATE_PRESETS[0];
}

function renderBlock(block: Omit<EditorBlock, "id">, index: number) {
  const props = block.props;
  const noop = () => undefined;

  switch (block.type) {
    case "hero":
      return <HeroBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "text":
      return <TextBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "image":
      return <ImageBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "button":
      return <ButtonBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "spacer":
      return <SpacerBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "divider":
      return <DividerBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "feature_card":
      return <FeatureCardBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "testimonial":
      return <TestimonialBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "countdown":
      return <CountdownBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "video":
      return <VideoBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "form_capture":
      return <FormCaptureBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "chat_widget":
      return <ChatWidgetBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "funnel_popup":
      return <FunnelPopupBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "tea_landing":
      return <TeaLandingBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "gallery":
      return <GalleryBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "box":
      return <BoxBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "icon":
      return <IconBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "product_card":
      return <ProductCardBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "collection_list":
      return <CollectionListBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "carousel":
      return <CarouselBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "tabs":
      return <TabsBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "frame":
      return <FrameBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "accordion":
      return <AccordionBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "table":
      return <TableBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "survey":
      return <SurveyBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "menu":
      return <MenuBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    case "html_code":
      return <HtmlCodeBlock key={index} props={props} isSelected={false} onSelect={noop} />;
    default:
      return null;
  }
}

/** On-screen pixels per second. Same speed for every template, so long pages are not rushed. */
const PREVIEW_PAN_VISUAL_SPEED = 72;
const PREVIEW_PAN_MIN_SECONDS = 6.5;
const PREVIEW_RETURN_MS = 900;

export function previewPanVisualSpeed(visualTravel: number): number {
  if (visualTravel <= 0) return PREVIEW_PAN_VISUAL_SPEED;
  return Math.min(PREVIEW_PAN_VISUAL_SPEED, visualTravel / PREVIEW_PAN_MIN_SECONDS);
}

function isPreservedHtmlSection(section: { children?: Array<{ type?: string; props?: { preserveHtml?: boolean; mode?: string } }> }) {
  return (section.children ?? []).some((child) => {
    const props = child?.props;
    return child?.type === "html_code" && (props?.preserveHtml === true || props?.mode === "iframe");
  });
}

const SELF_CONTAINED_SECTION_TYPES = new Set([
  "tea_landing", "smartwatch_landing",
  "menu",
  "feature_card", "collection_list", "testimonial",
  "countdown", "video", "chat_widget", "funnel_popup",
  "gallery", "tabs", "accordion", "product_card", "carousel",
  "form_capture", "survey", "table", "html_code",
  "columns",
]);

export function TemplateUiPreview({
  template,
  mode = "card",
  playing = false,
}: {
  template: TemplateItem;
  mode?: "card" | "modal";
  /** Card hover: pan the full page from top to bottom. */
  playing?: boolean;
}) {
  const preset = getPreset(template);
  const scale = mode === "card" ? 0.34 : 1;
  const hasEditorData = Boolean(
    template.editor_data && Array.isArray(template.editor_data.sections),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(playing);
  const offsetRef = useRef(0);
  const kickRef = useRef<() => void>(() => undefined);
  const wasPlayingRef = useRef(false);
  const returnFromRef = useRef(0);
  const returnStartedRef = useRef(0);

  playingRef.current = playing;

  useEffect(() => {
    if (mode !== "card") return;
    const element = scrollRef.current;
    if (!element) return;

    element.style.setProperty("transition", "none", "important");

    let frame = 0;
    let alive = true;
    let looping = false;
    let last = 0;
    let height = element.offsetHeight;
    let viewport = element.parentElement?.clientHeight ?? 0;

    const paint = (offset: number) => {
      offsetRef.current = offset;
      element.style.transform = `scale(${scale}) translate3d(0, ${offset}px, 0)`;
    };

    const tick = (now: number) => {
      if (!alive) return;
      const dt = last === 0 ? 0.016 : Math.min(0.034, Math.max(0, (now - last) / 1000));
      last = now;
      const playingNow = playingRef.current;

      if (playingNow !== wasPlayingRef.current) {
        if (!playingNow) {
          returnFromRef.current = offsetRef.current;
          returnStartedRef.current = now;
        }
        wasPlayingRef.current = playingNow;
      }

      const measured = viewport > 0 && height > 0;
      const distance = measured ? Math.min(0, viewport / scale - height) : 0;
      let next = offsetRef.current;
      let moving = false;

      if (playingNow) {
        if (measured && distance < -1) {
          const visualTravel = Math.max(0, height * scale - viewport);
          const unscaledSpeed = previewPanVisualSpeed(visualTravel) / scale;
          next = Math.max(distance, offsetRef.current - unscaledSpeed * dt);
          moving = offsetRef.current - distance > 0.5;
        }
      } else if (offsetRef.current < -0.5) {
        const progress = Math.min(1, (now - returnStartedRef.current) / PREVIEW_RETURN_MS);
        const eased = 1 - (1 - progress) ** 3;
        next = returnFromRef.current * (1 - eased);
        moving = progress < 1;
        if (!moving) next = 0;
      }

      if (Math.abs(next - offsetRef.current) > 0.01) paint(next);

      if (moving) {
        frame = requestAnimationFrame(tick);
        return;
      }
      looping = false;
    };

    const kick = () => {
      if (!alive || looping) return;
      looping = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    const measure = () => {
      height = element.offsetHeight;
      viewport = element.parentElement?.clientHeight ?? 0;
      kick();
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    if (element.parentElement) observer?.observe(element.parentElement);

    return () => {
      alive = false;
      looping = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (kickRef.current === kick) kickRef.current = () => undefined;
    };
  }, [mode, scale, hasEditorData, template.id]);

  useEffect(() => {
    kickRef.current();
  }, [playing]);

  if (!hasEditorData && template.image) {
    return (
      <div className="landing-product-surface h-full w-full overflow-hidden bg-white text-slate-950">
        <img
          src={template.image}
          alt={template.name}
          className={mode === "modal" ? "h-auto w-full object-contain" : "h-full w-full object-cover"}
        />
      </div>
    );
  }

  const renderContent = () => {
    if (hasEditorData) {
      const sections = template.editor_data.sections;
      return (
        <div className="w-full flex flex-col">
          {sections.map((section: any, secIdx: number) => {
            const flowPreview = mode === "card" && isPreservedHtmlSection(section);
            const isSelfContained = SELF_CONTAINED_SECTION_TYPES.has(section.type);
            const naturalHeight = section.frame?.height ?? (section.props?.minHeight || 120);

            if (flowPreview) {
              return (
                <div
                  key={section.id || secIdx}
                  data-preview-flow="true"
                  style={{ position: "relative", width: "100%", height: "auto", overflow: "visible" }}
                >
                  {(section.children ?? []).map((element: any, childIdx: number) => (
                    <div key={element.id || childIdx} style={{ position: "relative", width: "100%", pointerEvents: "none" }}>
                      {renderBlock(element, childIdx)}
                    </div>
                  ))}
                </div>
              );
            }

            const sectionStyle: React.CSSProperties = isSelfContained
              ? {
                  position: "relative",
                  width: "100%",
                  minHeight: `${naturalHeight}px`,
                  zIndex: section.frame?.zIndex ?? 1,
                  overflow: "visible",
                }
              : {
                  position: "relative",
                  width: "100%",
                  height: `${naturalHeight}px`,
                  zIndex: section.frame?.zIndex ?? 1,
                  overflow: "hidden",
                };

            return (
              <div key={section.id || secIdx} style={sectionStyle}>
                {/* Section Background */}
                <div style={{ width: "100%", height: isSelfContained ? "auto" : "100%", pointerEvents: "none" }}>
                  {renderBlock(section, 0)}
                </div>

                {/* Absolute Children Elements */}
                {!isSelfContained && (section.children ?? []).map((element: any, childIdx: number) => {
                  const frame = element.frame || { x: 0, y: 0, width: 300, height: 100, zIndex: 1, rotate: 0 };
                  const childStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${frame.x}px`,
                    top: `${frame.y}px`,
                    width: `${frame.width}px`,
                    height: `${frame.height}px`,
                    zIndex: frame.zIndex ?? 1,
                    transform: frame.rotate ? `rotate(${frame.rotate}deg)` : undefined,
                    pointerEvents: "none",
                  };

                  return (
                    <div key={element.id || childIdx} style={childStyle}>
                      {renderBlock(element, childIdx)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <>
        {preset.blocks.map((block, index) => renderBlock(block, index))}
      </>
    );
  };

  if (mode === "modal") {
    return (
      <div data-liquid-exclude="authored-page" className="landing-product-surface bg-white text-slate-950">
        {renderContent()}
      </div>
    );
  }

  return (
    <div data-liquid-exclude="authored-page" className="landing-product-surface h-full w-full overflow-hidden bg-white text-slate-950">
      <div
        ref={scrollRef}
        className={`template-ui-scroll-effect pointer-events-none${playing ? " is-playing" : ""}`}
        style={{
          width: `${100 / scale}%`,
          "--preview-scale": scale,
        } as React.CSSProperties}
      >
        {renderContent()}
      </div>
    </div>
  );
}
