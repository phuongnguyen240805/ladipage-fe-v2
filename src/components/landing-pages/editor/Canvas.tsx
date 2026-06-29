"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import {
  EditorBlock, BlockType, DND_TYPES, DeviceMode, DEVICE_WIDTHS,
  ONLOOK_ATTRIBUTES, ElementFrame, getEffectiveFrame,
  getNodeKind,
} from "./types";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { SpacerBlock, DividerBlock } from "./blocks/SpacerBlock";
import { FeatureCardBlock, TestimonialBlock } from "./blocks/SocialBlocks";
import { CountdownBlock, VideoBlock, FormCaptureBlock } from "./blocks/AdvancedBlocks";
import { TeaLandingBlock } from "./blocks/TeaLandingBlock";
import { ChatWidgetBlock, FunnelPopupBlock } from "./blocks/WidgetBlocks";
import {
  GalleryBlock, BoxBlock, IconBlock, ProductCardBlock, CollectionListBlock,
  CarouselBlock, TabsBlock, FrameBlock, AccordionBlock, TableBlock,
  SurveyBlock, MenuBlock, HtmlCodeBlock
} from "./blocks/NewLadiBlocks";
import { getBlockDisplayLabel } from "./components/EditorContextToolbar";
import { EditorToolbarOverlay } from "./components/toolbars/EditorToolbarOverlay";
import {
  EditorSelection,
  findBlockInSections,
  resolveSelectionFromClickTarget,
  selectionFromBlock,
  findParentSectionId,
} from "./editor-selection";

function isPreservedHtmlBlock(block: EditorBlock): boolean {
  if (block.type !== "html_code") return false;

  const props = (block.props ?? {}) as {
    preserveHtml?: boolean;
    mode?: string;
  };

  return props.preserveHtml === true || props.mode === "iframe";
}



function getPreservedHtmlSectionHeight(section: EditorBlock): number | null {
  const children = section.children ?? [];
  let maxHeight = 0;

  for (const child of children) {
    if (!isPreservedHtmlBlock(child)) continue;

    const props = (child.props ?? {}) as {
      height?: number | string;
    };

    const childY = child.frame?.y ?? 0;

    const propHeight = Number(props.height);
    const frameHeight = Number(child.frame?.height);

    const htmlHeight = Math.max(
      Number.isFinite(propHeight) ? propHeight : 0,
      Number.isFinite(frameHeight) ? frameHeight : 0,
      1200
    );

    maxHeight = Math.max(maxHeight, childY + htmlHeight);
  }

  return maxHeight > 0 ? Math.ceil(maxHeight) : null;
}

function findBlockRecursive(nodes: EditorBlock[], id: string): EditorBlock | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findBlockRecursive(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ── Block Renderer ────────────────────────────────────────────
const BlockRenderer: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateBlockSilent: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateNodeFrame?: (id: string, frame: Partial<ElementFrame>) => void;
  globalCss?: string;
  parentId?: string;
}> = ({
  block,
  isSelected,
  onSelect,
  onUpdateBlock,
  onUpdateBlockSilent,
  onUpdateNodeFrame,
  globalCss,
  parentId,
}) => {
  const update = (nextProps: Record<string, unknown>) => onUpdateBlock(block.id, nextProps);
  const updateSilent = (nextProps: Record<string, unknown>) => onUpdateBlockSilent(block.id, nextProps);

  switch (block.type) {
    case "hero": return <HeroBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "text": return <TextBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "image": return <ImageBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "button": return <ButtonBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "spacer": return <SpacerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "divider": return <DividerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "feature_card": return <FeatureCardBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "testimonial": return <TestimonialBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "countdown": return <CountdownBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "video": return <VideoBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "form_capture": return <FormCaptureBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "chat_widget": return <ChatWidgetBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "funnel_popup": return <FunnelPopupBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "tea_landing": return <TeaLandingBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "gallery": return <GalleryBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "product_section":
    case "form_section":
    case "footer":
    case "custom_section":
    case "box": return <BoxBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "icon": return <IconBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "product_card": return <ProductCardBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "collection_list": return <CollectionListBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "carousel": return <CarouselBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "tabs": return <TabsBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "frame": return <FrameBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "accordion": return <AccordionBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "table": return <TableBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "survey": return <SurveyBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "menu": return <MenuBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "html_code":
      return (
        <HtmlCodeBlock
          blockId={block.id}
          props={block.props}
          isSelected={isSelected}
          onSelect={onSelect}
          onUpdate={update}
          onUpdateSilent={updateSilent}
          onUpdateNodeFrame={onUpdateNodeFrame}
          blockFrame={block.frame}
          parentId={parentId || undefined}
          globalCss={globalCss}
        />
      );
    default:
      return null;
  }
};

// ── Selection Overlay ─────────────────────────────────────────
const SelectionOverlay: React.FC<{
  block: EditorBlock;
  frame: ElementFrame;
  zoom: number;
  onPointerDownResize: (e: React.PointerEvent, direction: string) => void;
  onPointerDownRotate: (e: React.PointerEvent) => void;
}> = ({ block, frame, zoom, onPointerDownResize, onPointerDownRotate }) => {
  const handleSize = 7 / zoom;
  const offset = 1 / zoom;

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: `-${offset}px`,
    border: "2px dashed #3b82f6",
    pointerEvents: "none",
    borderRadius: "2px",
    zIndex: 1000,
  };

  const handleBaseStyle = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    backgroundColor: "#ffffff",
    border: "2px solid #3b82f6",
    cursor,
    pointerEvents: "auto",
    zIndex: 1001,
  });

  const rotateHandleStyle: React.CSSProperties = {
    position: "absolute",
    bottom: `-${24 / zoom}px`,
    left: "50%",
    transform: "translateX(-50%)",
    width: `${14 / zoom}px`,
    height: `${14 / zoom}px`,
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "2px solid #3b82f6",
    cursor: "alias",
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1002,
  };

  return (
    <div className="selection-outline" style={overlayStyle}>
      <div
        className="selection-label pointer-events-none absolute rounded bg-[#3b82f6] font-extrabold uppercase tracking-wider text-white select-none"
        style={{
          top: `-${18 / zoom}px`,
          right: `-${offset}px`,
          left: "auto",
          fontSize: `${9 / zoom}px`,
          padding: `${1 / zoom}px ${5 / zoom}px`,
          transformOrigin: "top right",
        }}
      >
        {getBlockDisplayLabel(block)}
      </div>

      <div
        data-handle="top"
        style={{ ...handleBaseStyle("ns-resize"), top: `-${handleSize / 2}px`, left: "50%", transform: "translateX(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "top")}
      />
      <div
        data-handle="bottom"
        style={{ ...handleBaseStyle("ns-resize"), bottom: `-${handleSize / 2}px`, left: "50%", transform: "translateX(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom")}
      />
      <div
        data-handle="left"
        style={{ ...handleBaseStyle("ew-resize"), left: `-${handleSize / 2}px`, top: "50%", transform: "translateY(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "left")}
      />
      <div
        data-handle="right"
        style={{ ...handleBaseStyle("ew-resize"), right: `-${handleSize / 2}px`, top: "50%", transform: "translateY(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "right")}
      />
      <div
        data-handle="top-left"
        style={{ ...handleBaseStyle("nwse-resize"), top: `-${handleSize / 2}px`, left: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "top-left")}
      />
      <div
        data-handle="top-right"
        style={{ ...handleBaseStyle("nesw-resize"), top: `-${handleSize / 2}px`, right: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "top-right")}
      />
      <div
        data-handle="bottom-left"
        style={{ ...handleBaseStyle("nesw-resize"), bottom: `-${handleSize / 2}px`, left: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom-left")}
      />
      <div
        data-handle="bottom-right"
        style={{ ...handleBaseStyle("nwse-resize"), bottom: `-${handleSize / 2}px`, right: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom-right")}
      />

      <div
        data-handle="rotate"
        style={rotateHandleStyle}
        onPointerDown={onPointerDownRotate}
        title="Xoay phần tử"
      >
        <svg
          style={{ width: `${8 / zoom}px`, height: `${8 / zoom}px`, color: "#8b5cf6" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </div>
    </div>
  );
};

// ── Element Absolute Container Wrapper ───────────────────────
const AbsoluteElementWrapper: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  deviceMode: DeviceMode;
  zoom: number;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, block: EditorBlock) => void;
  onPointerDownResize: (e: React.PointerEvent, block: EditorBlock, direction: string) => void;
  onPointerDownRotate: (e: React.PointerEvent, block: EditorBlock) => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateBlockSilent: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateNodeFrame?: (id: string, frame: Partial<ElementFrame>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onToggleHidden?: () => void;
  onOpenInspector?: () => void;
  draftFrame: Partial<ElementFrame> | null;
  globalCss?: string;
  parentLabel?: string;
}> = ({
  block,
  isSelected,
  deviceMode,
  zoom,
  onSelect,
  onPointerDownDrag,
  onPointerDownResize,
  onPointerDownRotate,
  onUpdateBlock,
  onUpdateBlockSilent,
  onUpdateNodeFrame,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveNodeZIndex,
  onBringToFront,
  onSendToBack,
  onToggleHidden,
  onOpenInspector,
  draftFrame,
  globalCss,
  parentLabel,
}) => {
  const frame = getEffectiveFrame(block, deviceMode);
  const preservedHtmlBlock = isPreservedHtmlBlock(block);

  const finalX = preservedHtmlBlock
    ? 0
    : draftFrame?.x !== undefined
    ? draftFrame.x
    : frame.x;

  const finalY = preservedHtmlBlock
    ? 0
    : draftFrame?.y !== undefined
    ? draftFrame.y
    : frame.y;

  const finalW = draftFrame?.width !== undefined ? draftFrame.width : frame.width;
  const finalH = draftFrame?.height !== undefined ? draftFrame.height : frame.height;
  const finalZ = draftFrame?.zIndex !== undefined ? draftFrame.zIndex : frame.zIndex;
  const finalR = draftFrame?.rotate !== undefined ? draftFrame.rotate : (frame.rotate || 0);

  const style: React.CSSProperties = {
    position: "absolute",
    left: preservedHtmlBlock ? 0 : `${finalX}px`,
    top: preservedHtmlBlock ? 0 : `${finalY}px`,
    width: preservedHtmlBlock ? "100%" : `${finalW}px`,
    height: `${finalH}px`,
    zIndex: finalZ,
    transform: preservedHtmlBlock ? undefined : (finalR ? `rotate(${finalR}deg)` : undefined),
    userSelect: "none",
    overflow: preservedHtmlBlock ? "visible" : undefined,
  };

  return (
    <div
      style={style}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;

        if (
          target.closest(
            "[data-handle], [data-editor-toolbar], [data-editor-popover], [data-no-drag], button, input, textarea, select, [contenteditable='true']",
          )
        ) {
          return;
        }

        // Với imported HTML preserve mode, iframe cần nhận pointer/mousemove/scroll.
        // Không kéo block khi click trực tiếp vào iframe.
        if (preservedHtmlBlock && target.tagName.toLowerCase() === "iframe") {
          return;
        }

        onPointerDownDrag(e, block);
      }}
      onClick={onSelect}
      id={block.id}
      data-editor-block-id={block.id}
      data-editor-block-type={block.type}
      {...{
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_ID]: block.oid,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_INSTANCE_ID]: block.instanceId,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_DOM_ID]: block.domId,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_COMPONENT_NAME]: block.componentName,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: preservedHtmlBlock ? "auto" : "none",
          overflow: preservedHtmlBlock ? "visible" : "hidden",
        }}
      >
        <BlockRenderer
          block={block}
          isSelected={isSelected}
          onSelect={() => {}}
          onUpdateBlock={onUpdateBlock}
          onUpdateBlockSilent={onUpdateBlockSilent}
          onUpdateNodeFrame={onUpdateNodeFrame}
          globalCss={globalCss}
          parentId={block.parentId || undefined}
        />
      </div>

      {isSelected && (
        <>
          <SelectionOverlay
            block={block}
            frame={{ x: finalX, y: finalY, width: finalW, height: finalH, zIndex: finalZ, rotate: finalR }}
            zoom={zoom}
            onPointerDownResize={(e, dir) => onPointerDownResize(e, block, dir)}
            onPointerDownRotate={(e) => onPointerDownRotate(e, block)}
          />

        </>
      )}
    </div>
  );
};

// ── Section Drop Zone Wrapper ─────────────────────────────────
const SectionDropZoneWrapper: React.FC<{
  section: EditorBlock;
  zoom: number;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number,
    x?: number,
    y?: number
  ) => void;
  children: React.ReactNode;
}> = ({ section, zoom, onDropItem, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    { type: string; blockType?: BlockType; blockId?: string },
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DND_TYPES.PALETTE_BLOCK, DND_TYPES.CANVAS_BLOCK],
    canDrop: (item) => {
      if (item.type === DND_TYPES.PALETTE_BLOCK) {
        return getNodeKind(item.blockType || "box") !== "section";
      }
      return true;
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const dropX = Math.round((clientOffset.x - rect.left) / zoom);
      const dropY = Math.round((clientOffset.y - rect.top) / zoom);

      if (item.type === DND_TYPES.PALETTE_BLOCK && item.blockType) {
        onDropItem({ type: item.blockType, isPalette: true }, section.id, undefined, undefined, dropX, dropY);
      } else if (item.type === DND_TYPES.CANVAS_BLOCK && item.blockId) {
        if (item.blockId === section.id) return;
        onDropItem({ id: item.blockId }, section.id, undefined, undefined, dropX, dropY);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const connectDrop = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    drop(node);
  }, [drop]);

  return (
    <div
      ref={connectDrop}
      className={`relative w-full transition-colors ${
        isOver && canDrop ? "bg-purple-500/5 ring-1 ring-purple-300" : ""
      }`}
    >
      {children}
    </div>
  );
};

// ── Root Section Drop Zone (compact) ──────────────────────────
const SectionDropZone: React.FC<{
  index: number;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number
  ) => void;
}> = ({ index, onDropItem }) => {
  const [{ isOver, canDrop }, drop] = useDrop<
    { type: string; blockType?: BlockType; blockId?: string },
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DND_TYPES.PALETTE_BLOCK, DND_TYPES.CANVAS_BLOCK],
    canDrop: (item) => {
      if (item.type === DND_TYPES.PALETTE_BLOCK) {
        return getNodeKind(item.blockType || "box") === "section";
      }
      return false;
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      if (item.type === DND_TYPES.PALETTE_BLOCK && item.blockType) {
        onDropItem({ type: item.blockType, isPalette: true }, undefined, undefined, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`transition-all h-2 my-1 rounded-full ${
        isOver && canDrop ? "bg-purple-600 h-5" : canDrop ? "bg-purple-400/20" : "bg-transparent"
      }`}
    />
  );
};

// ── Drag & Resize state types ─────────────────────────────────
interface DragState {
  type: "drag" | "resize" | "rotate";
  blockId: string;
  baseFrame: ElementFrame;
  startPointerX: number;
  startPointerY: number;
  direction?: string;
}

// Section types with natural full-height rendering (not collapsed)
const SECTION_NATURAL_TYPES = new Set([
  "hero", "product_section", "form_section", "footer",
  "custom_section", "tea_landing", "smartwatch_landing", "menu",
]);

// Self-contained rich components that render their own content (no absolute children)
const SELF_CONTAINED_SECTION_TYPES = new Set([
  "tea_landing", "smartwatch_landing",
  "menu",
  "feature_card", "collection_list", "testimonial",
  "countdown", "video", "chat_widget", "funnel_popup",
  "gallery", "tabs", "accordion", "product_card", "carousel",
  "form_capture", "survey", "table", "html_code",
  "columns",
]);


/** Visual preview factor — editor zoom UI stays separate from rendered preview size. */
export const CANVAS_VISUAL_PREVIEW_FACTOR = 0.42;
const WORKSPACE_PADDING_X = 48;
const WORKSPACE_PADDING_Y = 48;
const WORKSPACE_PADDING_BOTTOM = 160;
const SNAP_THRESHOLD = 8;

function getSectionBounds(section: EditorBlock, canvasWidth: number): { width: number; height: number } {
  const baseNaturalHeight =
    section.frame?.height ??
    (typeof section.props?.minHeight === "number"
      ? (section.props.minHeight as number)
      : SECTION_NATURAL_TYPES.has(section.type)
      ? 500
      : 120);

  return {
    width: section.frame?.width ?? canvasWidth,
    height: baseNaturalHeight,
  };
}

function computeDragSnap(
  x: number,
  y: number,
  width: number,
  height: number,
  sectionW: number,
  sectionH: number,
): { x: number; y: number; guides: { vertical?: number; horizontal?: number } } {
  let nextX = x;
  let nextY = y;
  const guides: { vertical?: number; horizontal?: number } = {};

  if (Math.abs(nextX) <= SNAP_THRESHOLD) {
    nextX = 0;
    guides.vertical = 0;
  } else if (Math.abs(nextX + width - sectionW) <= SNAP_THRESHOLD) {
    nextX = sectionW - width;
    guides.vertical = sectionW;
  } else {
    const elCenter = nextX + width / 2;
    const sectionCenter = sectionW / 2;
    if (Math.abs(elCenter - sectionCenter) <= SNAP_THRESHOLD) {
      nextX = sectionCenter - width / 2;
      guides.vertical = sectionCenter;
    }
  }

  if (Math.abs(nextY) <= SNAP_THRESHOLD) {
    nextY = 0;
    guides.horizontal = 0;
  } else if (Math.abs(nextY + height - sectionH) <= SNAP_THRESHOLD) {
    nextY = sectionH - height;
    guides.horizontal = sectionH;
  } else {
    const elMiddle = nextY + height / 2;
    const sectionMiddle = sectionH / 2;
    if (Math.abs(elMiddle - sectionMiddle) <= SNAP_THRESHOLD) {
      nextY = sectionMiddle - height / 2;
      guides.horizontal = sectionMiddle;
    }
  }

  return {
    x: Math.round(nextX),
    y: Math.round(nextY),
    guides,
  };
}

// ── Main Canvas ───────────────────────────────────────────────
function getAlignParentBounds(
  block: EditorBlock,
  sections: EditorBlock[],
  canvasWidth: number,
): { width: number; height: number } | null {
  let parentId = block.parentId;
  if (!parentId) {
    const parentSection = sections.find((s) => s.children?.some((c) => c.id === block.id));
    if (parentSection) parentId = parentSection.id;
  }
  if (!parentId) return null;
  const parent = findBlockRecursive(sections, parentId);
  if (!parent) return null;
  const height =
    parent.frame?.height ??
    (typeof parent.props?.minHeight === "number" ? (parent.props.minHeight as number) : 500);
  return {
    width: parent.frame?.width ?? canvasWidth,
    height,
  };
}

interface CanvasProps {
  sections: EditorBlock[];
  selectedId: string | null;
  editorSelection: EditorSelection;
  deviceMode: DeviceMode;
  zoom: number;
  pageBgColor: string;
  onSelectBlock: (id: string | null) => void;
  onSelectSelection: (selection: EditorSelection) => void;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number,
    x?: number,
    y?: number
  ) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onMoveWithinParent: (parentId: string | undefined, columnIndex: number | undefined, fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateBlockSilent: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateNodeFrameSilent?: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrameSilent?: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onAddSection: (blockType: BlockType, index?: number) => void;
  onOpenInspector?: (mode?: import("./inspector-state").InspectorMode) => void;
  onAddElementToSection: (sectionId: string, blockType: BlockType, x: number, y: number) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  onSetBlockHidden?: (id: string, hidden: boolean) => void;
  onSetBlockLocked?: (id: string, locked: boolean) => void;
  globalCss?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  sections,
  selectedId,
  editorSelection,
  deviceMode,
  zoom,
  pageBgColor,
  onSelectBlock,
  onSelectSelection,
  onDropItem,
  onDeleteBlock,
  onDuplicateBlock,
  onUpdateBlock,
  onUpdateBlockSilent,
  onUpdateNodeFrame,
  onUpdateNodeFrameSilent,
  onUpdateResponsiveFrame,
  onUpdateResponsiveFrameSilent,
  onMoveBlock,
  onMoveNodeZIndex,
  onMoveUp,
  onMoveDown,
  onSetBlockHidden,
  onSetBlockLocked,
  onOpenInspector,
  globalCss,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const canvasWidth = DEVICE_WIDTHS[deviceMode];
  const sectionsHeight = sections.reduce((acc, section) => {
    const isSelfContained =
      SELF_CONTAINED_SECTION_TYPES.has(section.type) ||
      (section.children ?? []).some((c) => isPreservedHtmlBlock(c));

    const baseNaturalHeight =
      section.frame?.height ??
      (typeof section.props?.minHeight === "number"
        ? (section.props.minHeight as number)
        : SECTION_NATURAL_TYPES.has(section.type)
        ? 500
        : 120);

    if (isSelfContained) {
      const preservedHtmlChildBottom = Math.max(
        0,
        ...((section.children ?? []).map((child) => {
          if (!isPreservedHtmlBlock(child)) return 0;

          const childY = Number(child.frame?.y || 0);
          const childFrameHeight = Number(child.frame?.height || 0);
          const childPropsHeight = Number(
            (child.props as { height?: number | string })?.height || 0,
          );

          const childHeight = Math.max(childFrameHeight, childPropsHeight, 900);

          return childY + childHeight;
        })),
      );

      return acc + Math.max(baseNaturalHeight, preservedHtmlChildBottom, 900);
    }

    return acc + baseNaturalHeight;
  }, 0);

  const minPageHeight = Math.max(sectionsHeight, 900);
  const deviceLabel = deviceMode.charAt(0).toUpperCase() + deviceMode.slice(1);
  
  const fitZoom = viewportWidth
    ? Math.min(
        1,
        Math.max(
          0.25,
          (viewportWidth - WORKSPACE_PADDING_X) / (canvasWidth * CANVAS_VISUAL_PREVIEW_FACTOR),
        ),
      )
    : 1;
  const effectiveZoom = zoom;
  const visualScale = Math.max(0.28, effectiveZoom * CANVAS_VISUAL_PREVIEW_FACTOR);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [draftFrame, setDraftFrame] = useState<Partial<ElementFrame> | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ vertical?: number; horizontal?: number } | null>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateViewportWidth = () => setViewportWidth(node.clientWidth);
    updateViewportWidth();

    const resizeObserver = new ResizeObserver(updateViewportWidth);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  // Recursively find element parent ID
  const findParentId = useCallback((id: string): string | null => {
    const node = findBlockRecursive(sections, id);
    return node?.parentId ?? null;
  }, [sections]);

  // Pointer Interaction Handlers
  const handlePointerDownDrag = useCallback((e: React.PointerEvent, block: EditorBlock) => {
    if (block.locked) return;
    e.stopPropagation();
    e.preventDefault();
    const frame = getEffectiveFrame(block, deviceMode);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragState({
      type: "drag",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
    });
    setDraftFrame(null);
    setSnapGuides(null);
  }, [deviceMode]);

  const handlePointerDownResize = useCallback((e: React.PointerEvent, block: EditorBlock, direction: string) => {
    if (block.locked) return;
    e.stopPropagation();
    const frame = getEffectiveFrame(block, deviceMode);
    setDragState({
      type: "resize",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      direction,
    });
    setDraftFrame(null);
  }, [deviceMode]);

  const handlePointerDownRotate = useCallback((e: React.PointerEvent, block: EditorBlock) => {
    if (block.locked) return;
    e.stopPropagation();
    const frame = getEffectiveFrame(block, deviceMode);
    setDragState({
      type: "rotate",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
    });
    setDraftFrame(null);
  }, [deviceMode]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragState) return;
    e.preventDefault();

    const dx = (e.clientX - dragState.startPointerX) / visualScale;
    const dy = (e.clientY - dragState.startPointerY) / visualScale;

    if (dragState.type === "drag") {
      let nextX = dragState.baseFrame.x + dx;
      let nextY = dragState.baseFrame.y + dy;

      const parentId = findParentId(dragState.blockId);
      const parentSection = parentId ? findBlockRecursive(sections, parentId) : null;
      const sectionBounds = parentSection
        ? getSectionBounds(parentSection, canvasWidth)
        : { width: canvasWidth, height: 800 };
      const { width: sectionW, height: sectionH } = sectionBounds;

      nextX = Math.max(0, Math.min(sectionW - dragState.baseFrame.width, nextX));
      nextY = Math.max(0, Math.min(sectionH - dragState.baseFrame.height, nextY));

      const snapped = computeDragSnap(
        nextX,
        nextY,
        dragState.baseFrame.width,
        dragState.baseFrame.height,
        sectionW,
        sectionH,
      );
      nextX = snapped.x;
      nextY = snapped.y;
      setSnapGuides(
        snapped.guides.vertical !== undefined || snapped.guides.horizontal !== undefined
          ? snapped.guides
          : null,
      );

      if (parentSection) {
        const bottomEdge = nextY + dragState.baseFrame.height;
        const currentHeight = sectionBounds.height;
        if (bottomEdge > currentHeight - 40) {
          const newHeight = Math.max(currentHeight, bottomEdge + 80);
          if (deviceMode === "desktop") {
            onUpdateNodeFrameSilent?.(parentSection.id, { height: newHeight });
          } else {
            onUpdateResponsiveFrameSilent?.(parentSection.id, deviceMode, { height: newHeight });
          }
        }
      }

      setDraftFrame({ x: nextX, y: nextY });
    } else if (dragState.type === "resize") {
      const direction = dragState.direction || "";
      let nextX = dragState.baseFrame.x;
      let nextY = dragState.baseFrame.y;
      let nextW = dragState.baseFrame.width;
      let nextH = dragState.baseFrame.height;

      if (direction.includes("right")) {
        nextW = Math.max(20, Math.round(dragState.baseFrame.width + dx));
      }
      if (direction.includes("left")) {
        const potentialW = dragState.baseFrame.width - dx;
        if (potentialW >= 20) {
          nextW = Math.round(potentialW);
          nextX = Math.round(dragState.baseFrame.x + dx);
        }
      }
      if (direction.includes("bottom")) {
        nextH = Math.max(20, Math.round(dragState.baseFrame.height + dy));
      }
      if (direction.includes("top")) {
        const potentialH = dragState.baseFrame.height - dy;
        if (potentialH >= 20) {
          nextH = Math.round(potentialH);
          nextY = Math.round(dragState.baseFrame.y + dy);
        }
      }

      // Snap dimensions
      nextW = Math.round(nextW / 5) * 5;
      nextH = Math.round(nextH / 5) * 5;
      nextX = Math.round(nextX / 5) * 5;
      nextY = Math.round(nextY / 5) * 5;

      setDraftFrame({ x: nextX, y: nextY, width: nextW, height: nextH });
    } else if (dragState.type === "rotate") {
      const el = document.getElementById(dragState.blockId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let angleDeg = Math.round(angleRad * (180 / Math.PI)) - 90;
      if (angleDeg < 0) angleDeg += 360;

      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }

      setDraftFrame({ rotate: angleDeg });
    }
  }, [dragState, visualScale, sections, canvasWidth, deviceMode, onUpdateNodeFrameSilent, onUpdateResponsiveFrameSilent, findParentId]);

  const handlePointerUp = useCallback(() => {
    if (!dragState) return;

    if (draftFrame) {
      if (deviceMode === "desktop") {
        onUpdateNodeFrame(dragState.blockId, draftFrame);
      } else {
        onUpdateResponsiveFrame(dragState.blockId, deviceMode, draftFrame);
      }
    }

    setDragState(null);
    setDraftFrame(null);
    setSnapGuides(null);
  }, [dragState, draftFrame, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame]);

  // Pointer Event listeners
  useEffect(() => {
    if (!dragState) return;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Keyboard Event shortcuts
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const selectedNode = findBlockRecursive(sections, selectedId);
      if (!selectedNode || selectedNode.locked) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onDuplicateBlock(selectedId);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteBlock(selectedId);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onSelectBlock(null);
        return;
      }

      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const frame = getEffectiveFrame(selectedNode, deviceMode);
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;

        const nextFrame = {
          x: frame.x + dx,
          y: frame.y + dy,
        };

        if (deviceMode === "desktop") {
          onUpdateNodeFrame(selectedId, nextFrame);
        } else {
          onUpdateResponsiveFrame(selectedId, deviceMode, nextFrame);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, sections, deviceMode, onDuplicateBlock, onDeleteBlock, onSelectBlock, onUpdateNodeFrame, onUpdateResponsiveFrame]);

  const handleCanvasBgClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-editor-toolbar], [data-editor-popover]")) return;

    const hitSelection = resolveSelectionFromClickTarget(target, sections);
    if (hitSelection) {
      e.stopPropagation();
      onSelectSelection(hitSelection);
      return;
    }

    if (e.target === e.currentTarget) {
      onSelectSelection({ type: "page" });
    }
  };

  const handleAlignBlock = useCallback(
    (blockId: string, action: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => {
      const block = findBlockInSections(sections, blockId);
      if (!block) return;
      const bounds = getAlignParentBounds(block, sections, canvasWidth);
      if (!bounds) return;
      const frame = getEffectiveFrame(block, deviceMode);
      let patch: Partial<ElementFrame> = {};
      switch (action) {
        case "left":
          patch = { x: 0 };
          break;
        case "centerH":
          patch = { x: Math.round((bounds.width - frame.width) / 2) };
          break;
        case "right":
          patch = { x: Math.max(0, bounds.width - frame.width) };
          break;
        case "top":
          patch = { y: 0 };
          break;
        case "centerV":
          patch = { y: Math.round((bounds.height - frame.height) / 2) };
          break;
        case "bottom":
          patch = { y: Math.max(0, bounds.height - frame.height) };
          break;
      }
      if (deviceMode === "desktop") {
        onUpdateNodeFrame(blockId, patch);
      } else {
        onUpdateResponsiveFrame(blockId, deviceMode, patch);
      }
    },
    [sections, canvasWidth, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame],
  );

  const previewFrameWidth = canvasWidth * visualScale;
  const previewFrameHeight = minPageHeight * visualScale;
  const workspaceMinHeight = previewFrameHeight + WORKSPACE_PADDING_Y + WORKSPACE_PADDING_BOTTOM;

  const getSiblingZRange = useCallback((blockId: string) => {
    const block = findBlockRecursive(sections, blockId);
    if (!block) return { min: 1, max: 99 };
    let parentId = block.parentId;
    if (!parentId) {
      const parentSection = sections.find((s) => s.children?.some((c) => c.id === blockId));
      if (parentSection) parentId = parentSection.id;
    }
    if (!parentId) return { min: 1, max: 99 };
    const parent = findBlockRecursive(sections, parentId);
    const siblings = parent?.children ?? [];
    const zValues = siblings.map((s) => s.frame?.zIndex ?? 1);
    return {
      min: Math.min(...zValues, 1),
      max: Math.max(...zValues, 1),
    };
  }, [sections]);

  return (
    <div
      ref={viewportRef}
      className="relative h-full w-full overflow-auto select-none"
      style={{ backgroundColor: "#f7f7f8" }}
      onClick={handleCanvasBgClick}
    >
      {/* Center layer — explicit height drives workspace scroll */}
      <div
        className="flex w-full justify-center"
        style={{
          minHeight: `max(calc(100vh - 64px), ${workspaceMinHeight}px)`,
          padding: `${WORKSPACE_PADDING_Y}px ${WORKSPACE_PADDING_X / 2}px ${WORKSPACE_PADDING_BOTTOM}px`,
          minWidth: "100%",
          boxSizing: "border-box",
        }}
        onClick={handleCanvasBgClick}
      >
        <div
          className="relative flex-shrink-0"
          style={{
            width: `${previewFrameWidth}px`,
            minHeight: `${previewFrameHeight}px`,
          }}
        >
          <div
            className="absolute left-0 top-0 border border-gray-200 bg-white shadow-xl transition-all"
            style={{
              width: `${canvasWidth}px`,
              minHeight: `${minPageHeight}px`,
              transform: `translateZ(0) scale(${visualScale})`,
              transformOrigin: "top left",
              backgroundColor: pageBgColor,
              overflow: "visible",
            }}
            onClick={handleCanvasBgClick}
          >
        {/* Render Snap Lines */}
        {snapGuides?.vertical !== undefined && (
          <div
            className="canvas-guide snap-guide absolute border-l border-dashed border-violet-500 z-50 pointer-events-none"
            style={{
              left: `${snapGuides.vertical}px`,
              top: 0,
              bottom: 0,
            }}
          />
        )}
        {snapGuides?.horizontal !== undefined && (
          <div
            className="canvas-guide snap-guide absolute border-t border-dashed border-sky-500 z-50 pointer-events-none"
            style={{
              top: `${snapGuides.horizontal}px`,
              left: 0,
              right: 0,
            }}
          />
        )}

        {sections.map((section, index) => {
          const hasPreservedHtmlChild = (section.children ?? []).some((child) => isPreservedHtmlBlock(child));

          const preservedHtmlChildBottom = Math.max(
            0,
            ...((section.children ?? []).map((child) => {
              if (!isPreservedHtmlBlock(child)) return 0;

              const childY = Number(child.frame?.y || 0);
              const childFrameHeight = Number(child.frame?.height || 0);
              const childPropsHeight = Number(
                (child.props as { height?: number | string })?.height || 0,
              );

              const childHeight = Math.max(childFrameHeight, childPropsHeight, 900);

              return childY + childHeight;
            })),
          );

          const isSelfContained =
            SELF_CONTAINED_SECTION_TYPES.has(section.type) ||
            hasPreservedHtmlChild;

          const baseNaturalHeight =
            section.frame?.height ??
            (typeof section.props?.minHeight === "number"
              ? (section.props.minHeight as number)
              : SECTION_NATURAL_TYPES.has(section.type)
              ? 500
              : 120);

          const naturalHeight = hasPreservedHtmlChild
            ? Math.max(baseNaturalHeight, preservedHtmlChildBottom, 900)
            : baseNaturalHeight;

          const sectionStyle: React.CSSProperties = isSelfContained
            ? {
                // Preserve HTML cần visible để iframe/full page không bị cắt.
                position: "relative",
                width: "100%",
                minHeight: `${naturalHeight}px`,
                height: hasPreservedHtmlChild ? `${naturalHeight}px` : undefined,
                zIndex: section.frame?.zIndex ?? 1,
                overflow: "visible",
                border: editorSelection.type === "section" && editorSelection.sectionId === section.id ? "2px dashed #3b82f6" : "1px dashed #e2e8f0",
              }
            : {
                position: "relative",
                width: "100%",
                height: `${naturalHeight}px`,
                zIndex: section.frame?.zIndex ?? 1,
                overflow: "hidden",
                border: editorSelection.type === "section" && editorSelection.sectionId === section.id ? "2px dashed #3b82f6" : "1px dashed #e2e8f0",
              };

          return (
            <React.Fragment key={section.id}>
              {/* Root Section Drop Zone */}
              <SectionDropZone index={index} onDropItem={onDropItem} />

              <SectionDropZoneWrapper section={section} zoom={visualScale} onDropItem={onDropItem}>
                <div
                  style={sectionStyle}
                  data-editor-section-id={section.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("[data-editor-block-id]")) return;
                    if (e.target === e.currentTarget || target.closest("[data-editor-section-id]") === e.currentTarget) {
                      e.stopPropagation();
                      onSelectSelection({ type: "section", sectionId: section.id });
                    }
                  }}
                >
                  {/* Render Section Background/Title props using Box renderer */}
                  {!hasPreservedHtmlChild && (
                    <div style={{ width: "100%", height: isSelfContained ? "auto" : "100%", pointerEvents: "none" }}>
                      <BlockRenderer
                        block={section}
                        isSelected={false}
                        onSelect={() => {}}
                        onUpdateBlock={onUpdateBlock}
                        onUpdateBlockSilent={onUpdateBlockSilent}
                        globalCss={globalCss}
                      />
                    </div>
                  )}

                  {/* Absolute Element Layers inside this Section */}
                  {(section.children ?? []).map((element) => (
                    <AbsoluteElementWrapper
                      key={element.id}
                      block={element}
                      isSelected={selectedId === element.id}
                      deviceMode={deviceMode}
                      zoom={visualScale}
                      onSelect={(e) => {
                        e.stopPropagation();
                        const sectionId = findParentSectionId(sections, element.id);
                        onSelectSelection(selectionFromBlock(element, sectionId));
                      }}

                      onPointerDownDrag={handlePointerDownDrag}
                      onPointerDownResize={handlePointerDownResize}
                      onPointerDownRotate={handlePointerDownRotate}
                      onUpdateBlock={onUpdateBlock}
                      onUpdateBlockSilent={onUpdateBlockSilent}
                      onUpdateNodeFrame={onUpdateNodeFrame}
                      onDeleteBlock={onDeleteBlock}
                      onDuplicateBlock={onDuplicateBlock}
                      onMoveNodeZIndex={onMoveNodeZIndex}
                      onBringToFront={() => {
                        const { max } = getSiblingZRange(element.id);
                        onUpdateNodeFrame(element.id, { zIndex: max + 1 });
                      }}
                      onSendToBack={() => {
                        const { min } = getSiblingZRange(element.id);
                        onUpdateNodeFrame(element.id, { zIndex: Math.max(1, min - 1) });
                      }}
                      onToggleHidden={
                        onSetBlockHidden
                          ? () => onSetBlockHidden(element.id, !element.hidden)
                          : undefined
                      }
                      onOpenInspector={onOpenInspector}
                      draftFrame={dragState?.blockId === element.id ? draftFrame : null}
                      globalCss={globalCss}
                      parentLabel={section.label || getBlockDisplayLabel(section)}
                    />
                  ))}
                </div>
              </SectionDropZoneWrapper>
            </React.Fragment>
          );
        })}

        {/* Ending Drop Zone */}
        <SectionDropZone index={sections.length} onDropItem={onDropItem} />
          </div>
        </div>
      </div>

      <EditorToolbarOverlay
        selection={editorSelection}
        sections={sections}
        deviceMode={deviceMode}
        scrollContainerRef={viewportRef}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onDuplicateBlock={onDuplicateBlock}
        onMoveNodeZIndex={onMoveNodeZIndex}
        onUpdateNodeFrame={onUpdateNodeFrame}
        onToggleHidden={onSetBlockHidden}
        onSetLocked={onSetBlockLocked}
        onOpenInspector={(mode) => onOpenInspector?.(mode)}
        onMoveSectionUp={onMoveUp}
        onMoveSectionDown={onMoveDown}
        onAlignBlock={handleAlignBlock}
        getSiblingZRange={getSiblingZRange}
        zoom={visualScale}
      />

      {/* Device Indicator Widget floating on bottom left */}
      <div className="fixed bottom-4 left-20 z-50 flex select-none items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-800 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        {deviceLabel} ({canvasWidth}px) | Scale: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
