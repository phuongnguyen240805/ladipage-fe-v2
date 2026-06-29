import { BlockType, EditorBlock, EditorData, EditorPageSettings, ElementFrame } from "../types";

export type ContainerPath = {
  blockId: string;
  columnIndex?: number;
};

export type EditorAction =
  | { type: "INSERT_BLOCK"; block: EditorBlock; index?: number }
  | { type: "INSERT_BLOCK_IN_CONTAINER"; container: ContainerPath; block: EditorBlock; index?: number }
  | { type: "DELETE_BLOCK"; blockId: string }
  | { type: "DUPLICATE_BLOCK"; blockId: string; newBlockId?: string }
  | { type: "MOVE_BLOCK"; fromIndex: number; toIndex: number }
  | { type: "MOVE_BLOCK_WITHIN_PARENT"; parentId?: string; columnIndex?: number; fromIndex: number; toIndex: number }
  | { type: "MOVE_BLOCK_IN_CONTAINER"; from: ContainerPath & { index: number }; to: ContainerPath & { index: number } }
  | { type: "MOVE_BLOCK_TO_PATH"; blockId: string; containerId?: string; columnIndex?: number; index: number }
  | { type: "UPDATE_BLOCK_PROPS"; blockId: string; props: Record<string, unknown> }
  | { type: "UPDATE_PAGE_SETTINGS"; key: keyof EditorPageSettings | string; value: string | number | boolean }
  | { type: "CLEAR_CANVAS" }
  | { type: "APPLY_TEMPLATE"; blocks: EditorBlock[]; mode: "append" | "replace" }
  | { type: "IMPORT_SNAPSHOT"; data: EditorData }
  | { type: "RESTORE_REVISION"; data: EditorData }
  | { type: "SET_BLOCK_LOCKED"; blockId: string; locked: boolean }
  | { type: "SET_BLOCK_HIDDEN"; blockId: string; hidden: boolean }
  | { type: "SET_RESPONSIVE_OVERRIDE"; blockId: string; deviceMode: "desktop" | "tablet" | "mobile"; props: Record<string, unknown> }
  | { type: "UPDATE_NODE_FRAME"; blockId: string; frame: Partial<ElementFrame> }
  | { type: "UPDATE_RESPONSIVE_FRAME"; blockId: string; deviceMode: "desktop" | "tablet" | "mobile"; frame: Partial<ElementFrame> }
  | { type: "ADD_SECTION"; block: EditorBlock; index?: number }
  | { type: "ADD_ELEMENT_TO_SECTION"; sectionId: string; block: EditorBlock; x: number; y: number }
  | { type: "MOVE_NODE_Z_INDEX"; blockId: string; direction: "forward" | "backward" }
  | { type: "UPDATE_BLOCK_LABEL"; blockId: string; label: string };

export type LandingEditorAction =
  | {
      type: "insert-element";
      blockId: string;
      blockType: BlockType;
      index: number;
      timestamp: number;
    }
  | {
      type: "remove-element";
      blockId: string;
      blockType: BlockType;
      timestamp: number;
    }
  | {
      type: "move-element";
      blockId: string;
      fromIndex: number;
      toIndex: number;
      timestamp: number;
    }
  | {
      type: "update-props";
      blockId: string;
      blockType: BlockType;
      keys: string[];
      timestamp: number;
    }
  | {
      type: "update-page-settings";
      key: string;
      timestamp: number;
    };
