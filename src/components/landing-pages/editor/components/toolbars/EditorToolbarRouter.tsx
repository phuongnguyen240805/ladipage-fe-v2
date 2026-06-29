"use client";

import React from "react";
import { EditorSelection, findBlockInSections, getSelectionDomId } from "../../editor-selection";
import type { InspectorMode } from "../../inspector-state";
import { EditorBlock, ElementFrame } from "../../types";
import { TextToolbar } from "./TextToolbar";
import { ImageToolbar, ImageToolbarActions } from "./ImageToolbar";
import { BlockToolbar, BlockToolbarActions } from "./BlockToolbar";
import { SectionToolbar, SectionToolbarActions } from "./SectionToolbar";
import {
  getToolbarKind,
  inspectorModeForToolbarKind,
  logToolbarKind,
  ToolbarKind,
} from "./toolbar-router";

export interface EditorToolbarRouterProps {
  selection: EditorSelection;
  sections: EditorBlock[];
  onUpdateBlock: (id: string, props: Record<string, unknown>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  onToggleHidden?: (id: string, hidden: boolean) => void;
  onSetLocked?: (id: string, locked: boolean) => void;
  onOpenInspector: (mode: InspectorMode) => void;
  onMoveSectionUp?: (index: number) => void;
  onMoveSectionDown?: (index: number) => void;
  onAlignBlock?: (
    blockId: string,
    action: "left" | "centerH" | "right" | "top" | "centerV" | "bottom",
  ) => void;
}

export function EditorToolbarRouter({
  selection,
  sections,
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
}: EditorToolbarRouterProps): React.ReactElement | null {
  if (selection.type === "page") return null;

  const domId = getSelectionDomId(selection);
  const block = domId ? findBlockInSections(sections, domId) : null;
  if (!block) return null;

  const toolbarKind = getToolbarKind(selection, block);
  logToolbarKind(selection, block, toolbarKind);

  const isHtmlSubElement =
    block.type === "html_code" &&
    Boolean(block.props?.selectedHtmlElement?.id) &&
    (toolbarKind === "text" || toolbarKind === "image" || toolbarKind === "button" || toolbarKind === "group");

  const dispatchSubElementPatch = (patch: Record<string, unknown>) => {
    if (!block.props.selectedHtmlElement?.id) return;
    window.dispatchEvent(
      new CustomEvent("EASY_MANAGER_HTML_PATCH_REQUEST", {
        detail: {
          blockId: block.id,
          elementId: block.props.selectedHtmlElement.id,
          patch,
        },
      }),
    );
  };

  const handleUpdateBlockWrapper = (id: string, patch: Record<string, unknown>) => {
    if (isHtmlSubElement) {
      const stylePatch: Record<string, string | number> = {};
      let hasStyle = false;

      if (patch.fontWeight !== undefined) {
        stylePatch.fontWeight = patch.fontWeight === "bold" ? "700" : "normal";
        hasStyle = true;
      }
      if (patch.fontStyle !== undefined) {
        stylePatch.fontStyle = String(patch.fontStyle || "normal");
        hasStyle = true;
      }
      if (patch.textDecoration !== undefined) {
        stylePatch.textDecoration = String(patch.textDecoration || "none");
        hasStyle = true;
      }
      if (patch.textTransform !== undefined) {
        stylePatch.textTransform = String(patch.textTransform || "none");
        hasStyle = true;
      }
      if (patch.color !== undefined) {
        stylePatch.color = String(patch.color || "");
        hasStyle = true;
      }
      if (patch.backgroundColor !== undefined) {
        stylePatch.backgroundColor = String(patch.backgroundColor || "");
        hasStyle = true;
      }
      if (patch.fontSize !== undefined) {
        stylePatch.fontSize = typeof patch.fontSize === "number" ? `${patch.fontSize}px` : String(patch.fontSize);
        hasStyle = true;
      }
      if (patch.borderRadius !== undefined) {
        stylePatch.borderRadius = typeof patch.borderRadius === "number" ? `${patch.borderRadius}px` : String(patch.borderRadius);
        hasStyle = true;
      }

      if (hasStyle) {
        dispatchSubElementPatch({
          action: "setStyle",
          style: stylePatch,
        });
      }

      if (patch.link !== undefined || patch.href !== undefined) {
        const url = String(patch.link || patch.href || "");
        dispatchSubElementPatch({
          action: "setAttribute",
          attributes: { href: url },
        });
      }

      if (patch.src !== undefined) {
        dispatchSubElementPatch({
          action: "replaceImage",
          src: String(patch.src || ""),
          alt: String(patch.alt || ""),
        });
      }
    } else {
      onUpdateBlock(id, patch);
    }
  };

  const openInspectorForKind = (kind: ToolbarKind = toolbarKind) => {
    onOpenInspector(inspectorModeForToolbarKind(kind));
  };

  const commonBlockActions = (
    targetBlock: EditorBlock,
  ): Pick<
    BlockToolbarActions,
    | "onDelete"
    | "onDuplicate"
    | "onBringForward"
    | "onSendBackward"
    | "onOpenSettings"
    | "onToggleHidden"
    | "onSetLocked"
    | "isHidden"
    | "isLocked"
  > => {
    if (isHtmlSubElement) {
      return {
        onDelete: () => dispatchSubElementPatch({ action: "delete" }),
        onDuplicate: () => dispatchSubElementPatch({ action: "duplicate" }),
        onBringForward: () => dispatchSubElementPatch({ action: "bringForward" }),
        onSendBackward: () => dispatchSubElementPatch({ action: "sendBackward" }),
        onOpenSettings: () => openInspectorForKind(),
        onToggleHidden: undefined,
        onSetLocked: undefined,
        isHidden: false,
        isLocked: false,
      };
    }

    return {
      onDelete: () => onDeleteBlock(targetBlock.id),
      onDuplicate: () => onDuplicateBlock(targetBlock.id),
      onBringForward: () => onMoveNodeZIndex(targetBlock.id, "forward"),
      onSendBackward: () => onMoveNodeZIndex(targetBlock.id, "backward"),
      onOpenSettings: () => openInspectorForKind(),
      onToggleHidden: onToggleHidden
        ? () => onToggleHidden(targetBlock.id, !targetBlock.hidden)
        : undefined,
      onSetLocked: onSetLocked
        ? (locked) => onSetLocked(targetBlock.id, locked)
        : undefined,
      isHidden: Boolean(targetBlock.hidden),
      isLocked: Boolean(targetBlock.locked),
    };
  };

  switch (toolbarKind) {
    case "section": {
      const sectionIndex = sections.findIndex((s) => s.id === block.id);
      const sectionActions: SectionToolbarActions = {
        onOpenSettings: () => openInspectorForKind("section"),
        onMoveUp: sectionIndex > 0 && onMoveSectionUp ? () => onMoveSectionUp(sectionIndex) : undefined,
        onMoveDown:
          sectionIndex >= 0 && sectionIndex < sections.length - 1 && onMoveSectionDown
            ? () => onMoveSectionDown(sectionIndex)
            : undefined,
        onToggleHidden: onToggleHidden
          ? () => onToggleHidden(block.id, !block.hidden)
          : undefined,
        onDuplicate: () => onDuplicateBlock(block.id),
        onDelete: () => onDeleteBlock(block.id),
        isHidden: Boolean(block.hidden),
      };
      return <SectionToolbar actions={sectionActions} />;
    }

    case "text":
      return (
        <TextToolbar
          block={block}
          onUpdateBlock={handleUpdateBlockWrapper}
          onOpenSettings={() => openInspectorForKind("text")}
        />
      );

    case "image": {
      const imageActions: ImageToolbarActions = {
        ...commonBlockActions(block),
        onUpdateBlock: handleUpdateBlockWrapper,
        onOpenSettings: () => openInspectorForKind("image"),
        onStartResize: undefined,
      };
      return <ImageToolbar block={block} actions={imageActions} />;
    }

    case "button":
    case "group":
    case "html":
    case "block": {
      const isGroup = toolbarKind === "group";
      const isHtml = toolbarKind === "html";
      const blockActions: BlockToolbarActions = {
        ...commonBlockActions(block),
        isGroup,
        onUngroup: undefined,
        onAlign: isHtmlSubElement ? undefined : onAlignBlock ? (action) => onAlignBlock(block.id, action) : undefined,
        onStartResize: undefined,
        onOpenSettings: () =>
          openInspectorForKind(
            isHtml
              ? "html"
              : isGroup
              ? "group"
              : toolbarKind === "button"
              ? "button"
              : "block",
          ),
      };
      return (
        <BlockToolbar
          block={block}
          actions={blockActions}
          variant={
            toolbarKind === "button"
              ? "button"
              : isGroup
              ? "group"
              : isHtml
              ? "html"
              : "block"
          }
        />
      );
    }

    default:
      return null;
  }
}