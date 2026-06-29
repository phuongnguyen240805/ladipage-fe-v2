"use client";

import React from "react";
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
}: {
  template: TemplateItem;
  mode?: "card" | "modal";
}) {
  const preset = getPreset(template);
  const scale = mode === "card" ? 0.34 : 1;

  const renderContent = () => {
    if (template.editor_data && Array.isArray(template.editor_data.sections)) {
      const sections = template.editor_data.sections;
      return (
        <div className="w-full flex flex-col">
          {sections.map((section: any, secIdx: number) => {
            const isSelfContained = SELF_CONTAINED_SECTION_TYPES.has(section.type);
            const naturalHeight = section.frame?.height ?? (section.props?.minHeight || 120);

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
      <div className="landing-product-surface bg-white text-slate-950">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="landing-product-surface h-full w-full overflow-hidden bg-white text-slate-950">
      <div
        className="template-ui-scroll-effect pointer-events-none"
        style={{
          width: `${100 / scale}%`,
          "--preview-scale": scale,
          "--scroll-dist": template.scrollDist || "calc(-100% + 780px)",
        } as React.CSSProperties}
      >
        {renderContent()}
      </div>
    </div>
  );
}
