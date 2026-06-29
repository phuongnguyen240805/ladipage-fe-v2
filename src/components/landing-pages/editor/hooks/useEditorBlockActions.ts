"use client";

import { useCallback } from "react";
import { LandingEditorAction } from "../core/editor-export-html";
import { editorReducer, findBlockRecursive } from "../core/editor-reducer";
import { instantiateTemplateBlocks } from "../template-library";
import {
  BlockType,
  EditorData,
  canNodeHaveChildren,
  createDefaultBlock,
  ensureOnlookBlockMeta,
  getNodeKind,
  ElementFrame,
} from "../types";

interface UseEditorBlockActionsOptions {
  data: EditorData;
  handleSelectBlock: (id: string | null) => void;
  push: (data: EditorData) => void;
  silentUpdate: (data: EditorData) => void;
  recordAction: (action: LandingEditorAction) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showToast: (message: string, type?: "success" | "info") => void;
}

export function useEditorBlockActions({
  data,
  handleSelectBlock,
  push,
  silentUpdate,
  recordAction,
  selectedId,
  setSelectedId,
  showToast,
}: UseEditorBlockActionsOptions) {
  const handleDropFromPalette = useCallback((blockType: BlockType, insertIndex?: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    const nextIndex = insertIndex ?? data.sections.length;
    push(editorReducer(data, { type: "INSERT_BLOCK", block: newBlock, index: nextIndex }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: nextIndex, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleDropInside = useCallback((containerId: string, blockType: BlockType, columnIndex?: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    push(editorReducer(data, {
      type: "INSERT_BLOCK_IN_CONTAINER",
      container: { blockId: containerId, columnIndex },
      block: newBlock,
    }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: 0, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleDropItem = useCallback((
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number,
    x?: number,
    y?: number
  ) => {
    if (item.isPalette && item.type) {
      const blockType = item.type;
      const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));

      if (getNodeKind(blockType) === "section") {
        push(editorReducer(data, {
          type: "ADD_SECTION",
          block: newBlock,
          index,
        }));
        handleSelectBlock(newBlock.id);
        showToast(`Đã thêm section ${newBlock.label || newBlock.type}`);
      } else {
        const targetSectionId = containerId || (data.sections[0]?.id);
        if (targetSectionId) {
          push(editorReducer(data, {
            type: "ADD_ELEMENT_TO_SECTION",
            sectionId: targetSectionId,
            block: newBlock,
            x: x ?? 50,
            y: y ?? 50,
          }));
          handleSelectBlock(newBlock.id);
          showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
        } else {
          const emptySection = ensureOnlookBlockMeta(createDefaultBlock("box"));
          emptySection.kind = "section";
          emptySection.label = "Section";
          emptySection.props = {
            ...emptySection.props,
            bgColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 0,
            shadow: "none",
            title: "",
            description: "",
          };
          emptySection.frame = { x: 0, y: 0, width: 1200, height: 600, zIndex: 1 };
          
          newBlock.parentId = emptySection.id;
          newBlock.frame = {
            x: x ?? 50,
            y: y ?? 50,
            width: newBlock.frame?.width ?? 160,
            height: newBlock.frame?.height ?? 40,
            zIndex: 10,
            rotate: 0,
          };
          emptySection.children = [newBlock];
          
          push(editorReducer(data, {
            type: "ADD_SECTION",
            block: emptySection,
          }));
          handleSelectBlock(newBlock.id);
          showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
        }
      }
    } else if (item.id) {
      if (containerId) {
        const current = findBlockRecursive(data.sections, item.id);
        if (current) {
          let nextData = editorReducer(data, {
            type: "MOVE_BLOCK_TO_PATH",
            blockId: item.id,
            containerId,
            columnIndex,
            index: index ?? 0,
          });
          if (x !== undefined && y !== undefined) {
            nextData = editorReducer(nextData, {
              type: "UPDATE_NODE_FRAME",
              blockId: item.id,
              frame: { x, y }
            });
          }
          push(nextData);
          recordAction({ type: "move-element", blockId: item.id, fromIndex: -1, toIndex: index ?? 0, timestamp: Date.now() });
        }
      }
    }
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleMoveWithinParent = useCallback((
    parentId: string | undefined,
    columnIndex: number | undefined,
    fromIndex: number,
    toIndex: number
  ) => {
    push(editorReducer(data, {
      type: "MOVE_BLOCK_WITHIN_PARENT",
      parentId,
      columnIndex,
      fromIndex,
      toIndex,
    }));
  }, [data, push]);

  const handleAddBlock = useCallback((blockType: BlockType, customProps?: Record<string, unknown>) => {
    const defaultBlock = createDefaultBlock(blockType);
    const newBlock = ensureOnlookBlockMeta({
      ...defaultBlock,
      props: {
        ...defaultBlock.props,
        ...customProps,
      },
    });

    if (getNodeKind(blockType) === "section") {
      push(editorReducer(data, { type: "ADD_SECTION", block: newBlock }));
      handleSelectBlock(newBlock.id);
      showToast(`Đã thêm section ${newBlock.label || newBlock.type}`);
    } else {
      let targetSectionId = "";
      if (selectedId) {
        const selectedBlock = findBlockRecursive(data.sections, selectedId);
        if (selectedBlock?.kind === "section") {
          targetSectionId = selectedBlock.id;
        } else if (selectedBlock?.parentId) {
          targetSectionId = selectedBlock.parentId;
        }
      }
      if (!targetSectionId && data.sections.length > 0) {
        targetSectionId = data.sections[data.sections.length - 1].id;
      }

      if (targetSectionId) {
        push(editorReducer(data, {
          type: "ADD_ELEMENT_TO_SECTION",
          sectionId: targetSectionId,
          block: newBlock,
          x: 100,
          y: 100,
        }));
        handleSelectBlock(newBlock.id);
        showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
      } else {
        const emptySection = ensureOnlookBlockMeta(createDefaultBlock("box"));
        emptySection.kind = "section";
        emptySection.label = "Section";
        emptySection.props = {
          ...emptySection.props,
          bgColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          paddingX: 0,
          paddingY: 0,
          shadow: "none",
          title: "",
          description: "",
        };
        emptySection.frame = { x: 0, y: 0, width: 1200, height: 600, zIndex: 1 };
        
        newBlock.parentId = emptySection.id;
        newBlock.frame = {
          x: 100,
          y: 100,
          width: newBlock.frame?.width ?? 160,
          height: newBlock.frame?.height ?? 40,
          zIndex: 10,
          rotate: 0,
        };
        emptySection.children = [newBlock];

        push(editorReducer(data, {
          type: "ADD_SECTION",
          block: emptySection,
        }));
        handleSelectBlock(newBlock.id);
        showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
      }
    }
  }, [data, handleSelectBlock, push, selectedId, showToast]);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const moved = data.sections[fromIndex];
    if (!moved) return;
    push(editorReducer(data, { type: "MOVE_BLOCK", fromIndex, toIndex }));
    recordAction({ type: "move-element", blockId: moved.id, fromIndex, toIndex, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    handleMoveBlock(index, index - 1);
  }, [handleMoveBlock]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === data.sections.length - 1) return;
    handleMoveBlock(index, index + 1);
  }, [data.sections.length, handleMoveBlock]);

  const handleDeleteBlock = useCallback((id: string) => {
    const removed = findBlockRecursive(data.sections, id);
    push(editorReducer(data, { type: "DELETE_BLOCK", blockId: id }));
    if (removed) {
      recordAction({ type: "remove-element", blockId: removed.id, blockType: removed.type, timestamp: Date.now() });
    }
    if (selectedId === id) handleSelectBlock(null);
    showToast("Đã xóa khối", "info");
  }, [data, handleSelectBlock, push, recordAction, selectedId, showToast]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const index = data.sections.findIndex((block) => block.id === id);
    const original = findBlockRecursive(data.sections, id);
    if (!original) return;
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    push(editorReducer(data, { type: "DUPLICATE_BLOCK", blockId: id, newBlockId }));
    recordAction({ type: "insert-element", blockId: newBlockId, blockType: original.type, index: Math.max(0, index + 1), timestamp: Date.now() });
    handleSelectBlock(newBlockId);
    showToast(`Đã nhân đôi ${original.label}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleUpdateBlock = useCallback((id: string, newProps: Record<string, unknown>) => {
    const current = findBlockRecursive(data.sections, id);
    push(editorReducer(data, { type: "UPDATE_BLOCK_PROPS", blockId: id, props: newProps }));
    if (current) {
      const oldProps = current.props as Record<string, unknown>;
      const keys = Object.keys(newProps).filter((key) => oldProps[key] !== newProps[key]);
      recordAction({ type: "update-props", blockId: id, blockType: current.type, keys, timestamp: Date.now() });
    }
  }, [data, push, recordAction]);

  const handleUpdateBlockSilent = useCallback((id: string, newProps: Record<string, unknown>) => {
    silentUpdate(editorReducer(data, { type: "UPDATE_BLOCK_PROPS", blockId: id, props: newProps }));
  }, [data, silentUpdate]);

  const handleUpdatePageSettings = useCallback((key: string, value: string | number | boolean) => {
    push(editorReducer(data, { type: "UPDATE_PAGE_SETTINGS", key, value }));
    recordAction({ type: "update-page-settings", key, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleClearCanvas = useCallback(() => {
    if (!confirm("Bạn có muốn xóa tất cả các block trên trang này?")) return;
    push(editorReducer(data, { type: "CLEAR_CANVAS" }));
    setSelectedId(null);
    recordAction({ type: "update-page-settings", key: "clear-canvas", timestamp: Date.now() });
    showToast("Đã dọn sạch canvas", "info");
  }, [data, push, recordAction, setSelectedId, showToast]);

  const handleApplyTemplate = useCallback((templateId: string, mode: "append" | "replace" = "append") => {
    const templateBlocks = instantiateTemplateBlocks(templateId);
    if (templateBlocks.length === 0) return;
    if (mode === "replace" && data.sections.length > 0 && !confirm("Thay toàn bộ canvas bằng mẫu này?")) return;

    // Debug log: template structure before migration
    console.group(`[Template Apply] id=${templateId} mode=${mode}`);
    console.log("Flat blocks count:", templateBlocks.length);
    console.log("Block types:", templateBlocks.map((b) => b.type).join(", "));

    const nextState = editorReducer(data, { type: "APPLY_TEMPLATE", blocks: templateBlocks, mode });

    // Debug log: migrated sections
    console.log("Sections after migration:", nextState.sections.length);
    nextState.sections.forEach((sec, i) => {
      console.log(
        `  [${i}] ${sec.type} | height=${sec.frame?.height ?? "?"} | children=${sec.children?.length ?? 0} | minHeight=${sec.props?.minHeight ?? "?"}`
      );
      (sec.children ?? []).slice(0, 3).forEach((c) => {
        console.log(`      ↳ ${c.type} frame=(${c.frame?.x},${c.frame?.y},${c.frame?.width}×${c.frame?.height})`);
      });
    });
    console.groupEnd();

    push(nextState);
    // Record one action per section (not per flat block)
    nextState.sections.slice(mode === "replace" ? 0 : data.sections.length).forEach((sec, offset) => {
      recordAction({
        type: "insert-element",
        blockId: sec.id,
        blockType: sec.type,
        index: mode === "replace" ? offset : data.sections.length + offset,
        timestamp: Date.now(),
      });
    });
    // Select first section in the new template
    const firstNew = mode === "replace" ? nextState.sections[0] : nextState.sections[data.sections.length];
    if (firstNew) handleSelectBlock(firstNew.id);
    showToast(mode === "replace" ? "Đã áp dụng mẫu trang mới" : "Đã chèn mẫu thiết kế", "success");
  }, [data, handleSelectBlock, push, recordAction, showToast]);


  const handleUseAsset = useCallback((url: string, name: string) => {
    if (selectedId) {
      const current = findBlockRecursive(data.sections, selectedId);
      if (current?.type === "image") {
        handleUpdateBlock(current.id, { ...current.props, src: url, alt: name });
        showToast(`Đã gán ảnh ${name}`, "success");
        return;
      }
      if (current?.type === "hero") {
        handleUpdateBlock(current.id, { ...current.props, bgImage: url });
        showToast(`Đã gán ảnh nền ${name}`, "success");
        return;
      }
      if (current?.type === "testimonial") {
        handleUpdateBlock(current.id, { ...current.props, authorAvatar: url });
        showToast(`Đã gán avatar ${name}`, "success");
        return;
      }
    }

    navigator.clipboard?.writeText(url);
    showToast(`Đã copy link ảnh: ${name}`, "info");
  }, [data.sections, handleUpdateBlock, selectedId, showToast]);

  const handleUpdateNodeFrame = useCallback((id: string, frame: Partial<ElementFrame>) => {
    push(editorReducer(data, { type: "UPDATE_NODE_FRAME", blockId: id, frame }));
  }, [data, push]);

  const handleUpdateNodeFrameSilent = useCallback((id: string, frame: Partial<ElementFrame>) => {
    silentUpdate(editorReducer(data, { type: "UPDATE_NODE_FRAME", blockId: id, frame }));
  }, [data, silentUpdate]);

  const handleUpdateResponsiveFrame = useCallback((id: string, deviceMode: "desktop" | "tablet" | "mobile", frame: Partial<ElementFrame>) => {
    push(editorReducer(data, { type: "UPDATE_RESPONSIVE_FRAME", blockId: id, deviceMode, frame }));
  }, [data, push]);

  const handleUpdateResponsiveFrameSilent = useCallback((id: string, deviceMode: "desktop" | "tablet" | "mobile", frame: Partial<ElementFrame>) => {
    silentUpdate(editorReducer(data, { type: "UPDATE_RESPONSIVE_FRAME", blockId: id, deviceMode, frame }));
  }, [data, silentUpdate]);

  const handleAddSection = useCallback((blockType: BlockType, index?: number) => {
    const newSection = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    push(editorReducer(data, { type: "ADD_SECTION", block: newSection, index }));
    handleSelectBlock(newSection.id);
    showToast(`Đã thêm section ${newSection.label || newSection.type}`);
  }, [data, handleSelectBlock, push, showToast]);

  const handleAddElementToSection = useCallback((sectionId: string, blockType: BlockType, x: number, y: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    push(editorReducer(data, { type: "ADD_ELEMENT_TO_SECTION", sectionId, block: newBlock, x, y }));
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
  }, [data, handleSelectBlock, push, showToast]);

  const handleMoveNodeZIndex = useCallback((id: string, direction: "forward" | "backward") => {
    push(editorReducer(data, { type: "MOVE_NODE_Z_INDEX", blockId: id, direction }));
  }, [data, push]);

  const handleSetBlockLocked = useCallback((id: string, locked: boolean) => {
    push(editorReducer(data, { type: "SET_BLOCK_LOCKED", blockId: id, locked }));
  }, [data, push]);

  const handleSetBlockHidden = useCallback((id: string, hidden: boolean) => {
    push(editorReducer(data, { type: "SET_BLOCK_HIDDEN", blockId: id, hidden }));
  }, [data, push]);

  const handleUpdateBlockLabel = useCallback((id: string, label: string) => {
    push(editorReducer(data, { type: "UPDATE_BLOCK_LABEL", blockId: id, label }));
  }, [data, push]);

  return {
    handleAddBlock,
    handleApplyTemplate,
    handleClearCanvas,
    handleDeleteBlock,
    handleDropInside,
    handleDropFromPalette,
    handleDropItem,
    handleMoveWithinParent,
    handleDuplicateBlock,
    handleMoveBlock,
    handleMoveDown,
    handleMoveUp,
    handleUpdateBlock,
    handleUpdateBlockSilent,
    handleUpdatePageSettings,
    handleUseAsset,
    handleUpdateNodeFrame,
    handleUpdateNodeFrameSilent,
    handleUpdateResponsiveFrame,
    handleUpdateResponsiveFrameSilent,
    handleAddSection,
    handleAddElementToSection,
    handleMoveNodeZIndex,
    handleSetBlockLocked,
    handleSetBlockHidden,
    handleUpdateBlockLabel,
  };
}
