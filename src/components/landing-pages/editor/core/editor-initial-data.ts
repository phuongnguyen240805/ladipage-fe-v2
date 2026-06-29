import { LandingPageItem } from "../../dung-chung/types";
import { LANDING_TEMPLATE_PRESETS, instantiateTemplateBlocks, resolveTemplatePresetId } from "../template-library";
import {
  createDefaultBlock,
  createDefaultPageSettings,
  EditorData,
  ensureOnlookBlockMeta,
  EditorBlock,
} from "../types";

export function buildInitialData(page: LandingPageItem): EditorData {
  const presetId = resolveTemplatePresetId(page);
  const presetBlocks = instantiateTemplateBlocks(presetId);

  return {
    pageId: page.id,
    pageName: page.name,
    sections: presetBlocks.length > 0
      ? presetBlocks
      : [
          ensureOnlookBlockMeta(createDefaultBlock("hero")),
          ensureOnlookBlockMeta(createDefaultBlock("countdown")),
          ensureOnlookBlockMeta(createDefaultBlock("columns")),
        ],
    pageSettings: createDefaultPageSettings(page.name),
    schemaVersion: 2,
  };
}

export function isUntouchedStarterData(data: EditorData): boolean {
  const [first, second, third] = data.sections || [];
  const defaultStarter = (data.sections || []).length === 3
    && first?.type === "hero"
    && second?.type === "countdown"
    && third?.type === "columns"
    && (first.label === "Hero Section" || first.componentName === "HeroBlock");
  const oldImageBackdropPreset = first?.type === "hero"
    && typeof first.props?.bgImage === "string"
    && first.props.bgImage.includes("template_");

  return (defaultStarter || oldImageBackdropPreset)
    && !data.pageSettings.customDomain
    && !data.pageSettings.pixelId;
}

export function isLegacyTemplateData(data: EditorData, page: LandingPageItem): boolean {
  const presetId = resolveTemplatePresetId(page);
  const pagePresetIds = new Set(
    LANDING_TEMPLATE_PRESETS
      .filter((preset) => preset.category === "page")
      .map((preset) => preset.id),
  );

  if (page.templateId && pagePresetIds.has(page.templateId) && isUntouchedStarterData(data)) return true;

  if (presetId === "herb-tea") {
    const teaBlocks = (data.sections || []).filter((block: EditorBlock) => block.type === "tea_landing");
    if (teaBlocks.length !== 1 || (data.sections || []).length !== 1) return true;
  }
  if (presetId !== "herb-tea") return false;

  return (data.sections || []).some((block: EditorBlock) => {
    const props = block.props as Record<string, unknown>;
    return block.label?.toLowerCase().includes("herb")
      || block.label?.toLowerCase().includes("zen green")
      || String(props.src ?? props.bgImage ?? "").includes("template_tea")
      || String(props.title ?? props.headline ?? "").toLowerCase().includes("green tea");
  });
}
