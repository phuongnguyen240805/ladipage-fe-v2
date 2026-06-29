"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EditorSelection, getSelectionDomId } from "../../editor-selection";
import type { InspectorMode } from "../../inspector-state";
import { EditorBlock, DeviceMode, ElementFrame } from "../../types";
import { EditorToolbarRouter } from "./EditorToolbarRouter";
import { findBlockInSections } from "../../editor-selection";
import { getToolbarKind } from "./toolbar-router";

const HORIZONTAL_TOOLBAR_HEIGHT = 46;
const VERTICAL_TOOLBAR_WIDTH = 40;
const TOPBAR_SAFE = 72;

interface ToolbarPosition {
  top: number;
  left: number;
  placement: "above" | "below" | "section-left";
}

export interface EditorToolbarOverlayProps {
  selection: EditorSelection;
  sections: EditorBlock[];
  deviceMode: DeviceMode;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  onUpdateBlock: (id: string, props: Record<string, unknown>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onToggleHidden?: (id: string, hidden: boolean) => void;
  onSetLocked?: (id: string, locked: boolean) => void;
  onOpenInspector: (mode: InspectorMode) => void;
  onMoveSectionUp?: (index: number) => void;
  onMoveSectionDown?: (index: number) => void;
  onAlignBlock?: (
    blockId: string,
    action: "left" | "centerH" | "right" | "top" | "centerV" | "bottom",
  ) => void;
  getSiblingZRange: (blockId: string) => { min: number; max: number };
  toolbarWidth?: number;
  zoom?: number;
}

function getTargetElement(selection: EditorSelection, toolbarKind: string): HTMLElement | null {
  const domId = getSelectionDomId(selection);
  if (!domId) return null;

  if (toolbarKind === "section" || selection.type === "section") {
    return document.querySelector(`[data-editor-section-id="${domId}"]`) as HTMLElement | null;
  }

  return document.querySelector(`[data-editor-block-id="${domId}"]`) as HTMLElement | null;
}

function computeToolbarPosition(
  rect: { top: number; left: number; width: number; height: number; bottom?: number },
  toolbarWidth: number,
  isSection: boolean,
): ToolbarPosition {
  if (isSection) {
    return {
      top: rect.top + rect.height / 2,
      left: rect.left - VERTICAL_TOOLBAR_WIDTH - 10,
      placement: "section-left",
    };
  }

  let top = rect.top - HORIZONTAL_TOOLBAR_HEIGHT - 8;
  let placement: "above" | "below" = "above";

  const rectBottom = rect.bottom !== undefined ? rect.bottom : rect.top + rect.height;

  if (top < TOPBAR_SAFE) {
    top = rectBottom + 8;
    placement = "below";
  }

  let left = rect.left + rect.width / 2 - toolbarWidth / 2;
  const margin = 8;
  left = Math.max(margin, Math.min(left, window.innerWidth - toolbarWidth - margin));

  return { top, left, placement };
}

export const EditorToolbarOverlay: React.FC<EditorToolbarOverlayProps> = ({
  selection,
  sections,
  deviceMode,
  scrollContainerRef,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveNodeZIndex,
  onToggleHidden,
  onSetLocked,
  onOpenInspector,
  onMoveSectionUp,
  onMoveSectionDown,
  onAlignBlock,
  toolbarWidth = 520,
  zoom = 1,
}) => {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const toolbarMeasureRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(toolbarWidth);

  const domIdForKind = selection.type === "page" ? null : getSelectionDomId(selection);
  const blockForKind = domIdForKind ? findBlockInSections(sections, domIdForKind) : null;

  const toolbarKind = selection.type === "page" ? null : getToolbarKind(selection, blockForKind);

  const recomputePosition = useCallback(() => {
    if (!toolbarKind) {
      setPosition(null);
      return;
    }

    let rect: { top: number; left: number; width: number; height: number; bottom?: number } | null = null;

    if (blockForKind?.type === "html_code" && blockForKind.props.selectedHtmlElement) {
      const subEl = blockForKind.props.selectedHtmlElement as {
        id: string;
        tag: string;
        x: number;
        y: number;
        width: number;
        height: number;
      };

      const iframeEl = document.querySelector(`[data-editor-block-id="${blockForKind.id}"] iframe`) as HTMLIFrameElement | null;
      const subDomEl = iframeEl?.contentDocument?.querySelector(`[data-em-id="${subEl.id}"]`) as HTMLElement | null;

      if (iframeEl && subDomEl) {
        const iframeRect = iframeEl.getBoundingClientRect();
        const subRect = subDomEl.getBoundingClientRect();

        rect = {
          left: iframeRect.left + subRect.left * zoom,
          top: iframeRect.top + subRect.top * zoom,
          width: subRect.width * zoom,
          height: subRect.height * zoom,
          bottom: iframeRect.top + subRect.bottom * zoom,
        };
      }
    }

    if (!rect) {
      const el = getTargetElement(selection, toolbarKind);
      if (!el) {
        setPosition(null);
        return;
      }
      rect = el.getBoundingClientRect();
    }

    const isSection = toolbarKind === "section";
    setPosition(computeToolbarPosition(rect, measuredWidth, isSection));
  }, [selection, measuredWidth, toolbarKind, blockForKind, zoom]);

  useLayoutEffect(() => {
    recomputePosition();
  }, [recomputePosition, sections, deviceMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => recomputePosition();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollContainerRef, recomputePosition]);

  useLayoutEffect(() => {
    if (toolbarMeasureRef.current) {
      const w = toolbarMeasureRef.current.offsetWidth;
      if (w > 0 && Math.abs(w - measuredWidth) > 4) {
        setMeasuredWidth(w);
      }
    }
  });

  if (selection.type === "page" || !position || !toolbarKind) return null;

  const positionStyle: React.CSSProperties =
    position.placement === "section-left"
      ? {
          position: "fixed",
          top: position.top,
          left: Math.max(8, position.left),
          transform: "translateY(-50%)",
          zIndex: 99999,
        }
      : {
          position: "fixed",
          top: position.top,
          left: position.left,
          zIndex: 99999,
        };

  return (
    <div className="toolbar-position-wrapper pointer-events-none" style={positionStyle}>
      <div ref={toolbarMeasureRef} className="inline-flex pointer-events-auto">
        <EditorToolbarRouter
          selection={selection}
          sections={sections}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onDuplicateBlock={onDuplicateBlock}
          onMoveNodeZIndex={onMoveNodeZIndex}
          onToggleHidden={onToggleHidden}
          onSetLocked={onSetLocked}
          onOpenInspector={onOpenInspector}
          onMoveSectionUp={onMoveSectionUp}
          onMoveSectionDown={onMoveSectionDown}
          onAlignBlock={onAlignBlock}
        />
      </div>
    </div>
  );
};