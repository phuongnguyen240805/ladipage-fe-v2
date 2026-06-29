import {
  createDefaultPageSettings,
  EditorBlock,
  EditorData,
  ensureOnlookBlockMeta,
  BlockType,
  ElementFrame,
} from "../types";
import { LandingEditorSnapshot } from "./editor-export-html";

export const CURRENT_EDITOR_SCHEMA_VERSION = 2;

export function getEditorDataFingerprint(data: Partial<EditorData> | null | undefined): string {
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const sectionShape = sections
    .map((section) => `${section.id}:${section.type}:${section.children?.length ?? 0}`)
    .join("|");

  return [
    `schema:${data?.schemaVersion ?? "unknown"}`,
    `sections:${sections.length}`,
    `shape:${sectionShape || "empty"}`,
  ].join(";");
}

export type VersionedLandingEditorSnapshot = {
  schemaVersion?: number;
  data: any;
  actions?: any[];
  html?: string;
  updatedAt?: string;
};

export function migrateEditorSnapshot(
  snapshot: VersionedLandingEditorSnapshot,
  pageId: string
): LandingEditorSnapshot {
  const migratedData = migrateEditorData(snapshot.data, pageId);
  return {
    ...snapshot,
    data: migratedData,
    actions: snapshot.actions || [],
    html: snapshot.html || "",
    updatedAt: snapshot.updatedAt || new Date().toISOString(),
  };
}

export function migrateEditorData(data: any, pageId: string): EditorData {
  if (!data) {
    return {
      pageId,
      pageName: "Untitled Page",
      sections: [],
      pageSettings: createDefaultPageSettings("Untitled Page"),
      schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    };
  }

  const pageName = data.pageName || "Untitled Page";
  const pageSettings = {
    ...createDefaultPageSettings(pageName),
    ...data.pageSettings,
  };

  // Idempotent check: if already schemaVersion 2 and sections is present, return normalized
  if (data.schemaVersion === 2 && Array.isArray(data.sections)) {
    const validatedSections = data.sections.map((section: any) => {
      const secMeta = ensureOnlookBlockMeta(section);
      secMeta.kind = "section";
      secMeta.parentId = null;
      if (!secMeta.children) secMeta.children = [];
      secMeta.children = secMeta.children.map((child: any, idx: number) => {
        const childMeta = ensureOnlookBlockMeta(child);
        childMeta.parentId = secMeta.id;
        if (!childMeta.frame) {
          childMeta.frame = getDefaultFrame(childMeta.type, idx);
        }
        return childMeta;
      });

      // Recalculate section minHeight/height dynamically
      if (secMeta.children.length > 0) {
        let maxBottom = 0;
        secMeta.children.forEach((c: any) => {
          if (c.frame) {
            maxBottom = Math.max(maxBottom, c.frame.y + c.frame.height);
          }
        });
        const currentMin = num(secMeta.props?.minHeight || secMeta.frame?.height, 120);
        const calculated = maxBottom + 80;
        if (secMeta.props) {
          secMeta.props.minHeight = Math.max(currentMin, calculated);
        }
        if (secMeta.frame) {
          secMeta.frame.height = Math.max(currentMin, calculated);
        }
      }
      return secMeta;
    });

    return {
      pageId: data.pageId || pageId,
      pageName,
      sections: validatedSections,
      pageSettings,
      schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
      assets: data.assets,
    };
  }

  // Legacy migration: convert flat blocks list into section-child structure
  const legacyBlocks = Array.isArray(data.blocks) ? data.blocks : [];
  const sections: EditorBlock[] = [];
  let defaultSection: EditorBlock | null = null;
  let elementIndex = 0;

  legacyBlocks.forEach((block: any) => {
    const b = ensureOnlookBlockMeta(block);
    const isSection =
      b.kind === "section" ||
      [
        "hero",
        "product_section",
        "form_section",
        "footer",
        "custom_section",
        "tea_landing",
        "smartwatch_landing",
        "menu",
      ].includes(b.type);

    if (isSection) {
      const sec: EditorBlock = {
        ...b,
        kind: "section",
        parentId: null,
        children: Array.isArray(b.children) ? b.children : [],
      };
      sections.push(sec);
    } else {
      // Root-level element, wrap inside a default section
      if (!defaultSection) {
        defaultSection = ensureOnlookBlockMeta({
          id: generateId(),
          type: "custom_section",
          kind: "section",
          parentId: null,
          label: "Section mặc định",
          props: {
            bgColor: "#ffffff",
            paddingX: 0,
            paddingY: 0,
            minHeight: 120,
          },
          frame: {
            x: 0,
            y: 0,
            width: 1280,
            height: 120,
            zIndex: 1,
            rotate: 0,
          },
          children: [],
        });
        sections.push(defaultSection);
      }

      const elem: EditorBlock = {
        ...b,
        parentId: defaultSection.id,
        frame: b.frame || getDefaultFrame(b.type, elementIndex++),
      };
      defaultSection.children!.push(elem);
    }
  });

  // Post-process sections
  sections.forEach((sec) => {
    if (!sec.children) sec.children = [];
    sec.children = sec.children.map((child: any, idx: number) => {
      const c = ensureOnlookBlockMeta(child);
      c.parentId = sec.id;
      if (!c.frame) {
        c.frame = getDefaultFrame(c.type, idx);
      }
      return c;
    });

    if (sec.children.length > 0) {
      let maxBottom = 0;
      sec.children.forEach((c) => {
        if (c.frame) {
          maxBottom = Math.max(maxBottom, c.frame.y + c.frame.height);
        }
      });
      const currentMin = num(sec.props?.minHeight || sec.frame?.height, 120);
      const calculated = maxBottom + 80;
      if (sec.props) {
        sec.props.minHeight = Math.max(currentMin, calculated);
      }
      if (sec.frame) {
        sec.frame.height = Math.max(currentMin, calculated);
      }
    }
  });

  return {
    pageId: data.pageId || pageId,
    pageName,
    sections,
    pageSettings,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    assets: data.assets,
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "node-" + Math.random().toString(36).substring(2, 11);
}

function getDefaultFrame(type: BlockType, index: number): ElementFrame {
  let width = 200;
  let height = 100;

  if (type === "button") {
    width = 160;
    height = 44;
  } else if (type === "image") {
    width = 300;
    height = 200;
  } else if (type === "text") {
    width = 400;
    height = 80;
  } else if (type === "divider") {
    width = 600;
    height = 20;
  }

  return {
    x: 40,
    y: 100 + index * (height + 20),
    width,
    height,
    zIndex: index + 1,
    rotate: 0,
  };
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

// ─── SECTION TYPES (top-level sections that live directly in sections[]) ──────
const SECTION_BLOCK_TYPES = new Set([
  "hero",
  "product_section",
  "form_section",
  "footer",
  "custom_section",
  "tea_landing",
  "smartwatch_landing",
  "menu",
]);

/**
 * Converts a flat array of template blocks (LandingTemplatePreset.blocks with fresh IDs)
 * into the proper v2 EditorBlock[] sections structure.
 *
 * Rules:
 *  - Section-kind types (hero, menu, footer, etc.) → become standalone sections
 *  - Layout containers (feature_card, collection_list, testimonial, box, gallery, tabs, accordion,
 *    product_card, carousel, form_capture, countdown, video, gallery) → become standalone sections
 *    because they are full-width components in the template context
 *  - Pure element types (text, button, image, icon, divider, html_code) → become children
 *    inside the most recently added section (or a new custom_section if no section exists yet)
 */
export function migrateTemplateFlatBlocks(flatBlocks: EditorBlock[]): EditorBlock[] {
  // These types are treated as standalone full-width sections in templates
  const standaloneTypes = new Set([
    ...SECTION_BLOCK_TYPES,
    // Template "blocks" that render as full-width section-level components:
    "feature_card", "collection_list", "testimonial", "box", "gallery",
    "tabs", "accordion", "product_card", "carousel", "form_capture",
    "countdown", "video", "product_section", "survey", "table", "html_code",
  ]);

  // Pure element types that become absolute-positioned children
  const elementTypes = new Set(["text", "button", "image", "icon", "divider"]);

  const sections: EditorBlock[] = [];
  let lastSection: EditorBlock | null = null;
  let elementIndex = 0;

  for (const block of flatBlocks) {
    if (elementTypes.has(block.type)) {
      // Needs to be a child inside a section
      if (!lastSection) {
        lastSection = ensureOnlookBlockMeta({
          id: generateId(),
          type: "custom_section",
          kind: "section",
          parentId: null,
          label: "Section",
          props: { bgColor: "#ffffff", minHeight: 120 },
          frame: { x: 0, y: 0, width: 1280, height: 120, zIndex: sections.length + 1, rotate: 0 },
          children: [],
        });
        sections.push(lastSection);
      }

      const elem: EditorBlock = {
        ...block,
        kind: "element",
        parentId: lastSection.id,
        frame: block.frame || getDefaultFrame(block.type, elementIndex++),
      };
      lastSection.children = [...(lastSection.children ?? []), elem];
    } else if (standaloneTypes.has(block.type)) {
      // Full-width section-level block
      const minH = num(block.props?.minHeight, isSectionType(block.type) ? 500 : 400);
      const sec: EditorBlock = {
        ...block,
        kind: "section",
        parentId: null,
        frame: block.frame || {
          x: 0,
          y: 0,
          width: 1280,
          height: minH,
          zIndex: sections.length + 1,
          rotate: 0,
        },
        children: Array.isArray(block.children) ? block.children : [],
      };
      sections.push(sec);
      lastSection = sec; // new sections absorb subsequent element-type blocks
      elementIndex = 0;
    } else {
      // Unknown type — treat as standalone section
      const sec: EditorBlock = {
        ...block,
        kind: "section",
        parentId: null,
        frame: block.frame || { x: 0, y: 0, width: 1280, height: 400, zIndex: sections.length + 1, rotate: 0 },
        children: Array.isArray(block.children) ? block.children : [],
      };
      sections.push(sec);
      lastSection = sec;
      elementIndex = 0;
    }
  }

  return recalculateSectionHeights(sections);
}

function isSectionType(type: string): boolean {
  return SECTION_BLOCK_TYPES.has(type);
}

/**
 * Recalculate section frame.height and props.minHeight based on children.
 * - Sections with children: height = max(child.y + child.height) + 80
 * - Sections without children but are section types (hero, footer): keep props.minHeight or 500
 * - Empty custom_section wrappers: collapse to 120px to avoid giant whitespace
 */
export function recalculateSectionHeights(sections: EditorBlock[]): EditorBlock[] {
  return sections.map((sec) => {
    const children = sec.children ?? [];
    const currentMin = num(sec.props?.minHeight || sec.frame?.height, 120);

    if (children.length > 0) {
      let maxBottom = 0;
      children.forEach((c) => {
        if (c.frame) {
          maxBottom = Math.max(maxBottom, c.frame.y + c.frame.height);
        }
      });
      const calculated = Math.max(currentMin, maxBottom + 80);

      return {
        ...sec,
        frame: {
          ...(sec.frame || { x: 0, y: 0, width: 1280, zIndex: 1, rotate: 0 }),
          height: calculated,
        },
        props: sec.props ? { ...sec.props, minHeight: calculated } : sec.props,
        children,
      };
    }

    // No children
    if (isSectionType(sec.type)) {
      // Hero/footer/etc. with their own content — keep their natural height
      const natural = currentMin;
      return {
        ...sec,
        frame: {
          ...(sec.frame || { x: 0, y: 0, width: 1280, zIndex: 1, rotate: 0 }),
          height: natural,
        },
      };
    }

    // Empty container section (custom_section with no elements) — collapse to compact
    return {
      ...sec,
      frame: {
        ...(sec.frame || { x: 0, y: 0, width: 1280, zIndex: 1, rotate: 0 }),
        height: Math.max(num(sec.frame?.height, 120), 120),
      },
    };
  });
}
