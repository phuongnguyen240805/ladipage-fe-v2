import {
  canNodeHaveChildren,
  createDefaultPageSettings,
  createEmptySectionNode,
  EditorBlock,
  EditorData,
  ensureOnlookBlockMeta,
  isElementNodeType,
  ElementFrame,
} from "../types";
import { EditorAction } from "./editor-actions";
import { migrateTemplateFlatBlocks, recalculateSectionHeights } from "./editor-migration";


export function editorReducer(state: EditorData, action: EditorAction): EditorData {
  switch (action.type) {
    case "INSERT_BLOCK": {
      const sections = [...state.sections];
      const index = clampIndex(action.index ?? sections.length, sections.length);
      sections.splice(index, 0, ...blocksForRootInsert(action.block));
      return normalizeEditorState({ ...state, sections });
    }
    case "INSERT_BLOCK_IN_CONTAINER": {
      const block = ensureOnlookBlockMeta(action.block);
      return normalizeEditorState({
        ...state,
        sections: insertInsideRecursive(
          state.sections,
          action.container.blockId,
          block,
          action.index,
          action.container.columnIndex,
        ),
      });
    }
    case "DELETE_BLOCK":
      return normalizeEditorState({ ...state, sections: deleteBlockRecursive(state.sections, action.blockId) });
    case "DUPLICATE_BLOCK":
      return normalizeEditorState({ ...state, sections: duplicateBlockRecursive(state.sections, action.blockId, action.newBlockId) });
    case "MOVE_BLOCK": {
      if (action.fromIndex === action.toIndex) return state;
      return normalizeEditorState({ ...state, sections: moveInList(state.sections, action.fromIndex, action.toIndex) });
    }
    case "MOVE_BLOCK_WITHIN_PARENT":
      return normalizeEditorState({
        ...state,
        sections: action.parentId
          ? moveWithinParentRecursive(state.sections, action.parentId, action.fromIndex, action.toIndex, action.columnIndex)
          : moveInList(state.sections, action.fromIndex, action.toIndex),
      });
    case "MOVE_BLOCK_IN_CONTAINER":
      return state;
    case "MOVE_BLOCK_TO_PATH":
      return normalizeEditorState({
        ...state,
        sections: moveBlockRecursive(
          state.sections,
          action.blockId,
          action.containerId,
          action.columnIndex,
          action.index
        ),
      });
    case "UPDATE_BLOCK_PROPS":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({
          ...block,
          props: { ...block.props, ...action.props },
        })),
      });
    case "UPDATE_PAGE_SETTINGS":
      return normalizeEditorState({
        ...state,
        pageSettings: { ...state.pageSettings, [action.key]: action.value },
      });
    case "CLEAR_CANVAS":
      return normalizeEditorState({ ...state, sections: [] });
    case "APPLY_TEMPLATE": {
      // Migrate flat template blocks → proper sections+children structure
      const migratedSections = migrateTemplateFlatBlocks(
        action.blocks.map(ensureOnlookBlockMeta)
      );
      const finalSections = recalculateSectionHeights(
        action.mode === "replace"
          ? migratedSections
          : [...state.sections, ...migratedSections]
      );
      return normalizeEditorState({
        ...state,
        sections: finalSections,
      });
    }

    case "IMPORT_SNAPSHOT":
    case "RESTORE_REVISION":
      return normalizeEditorState(action.data);
    case "SET_BLOCK_LOCKED":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({ ...block, locked: action.locked })),
      });
    case "SET_BLOCK_HIDDEN":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({ ...block, hidden: action.hidden })),
      });
    case "SET_RESPONSIVE_OVERRIDE":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({
          ...block,
          responsive: {
            ...block.responsive,
            [action.deviceMode]: {
              ...(block.responsive?.[action.deviceMode] ?? {}),
              props: {
                ...(block.responsive?.[action.deviceMode]?.props ?? {}),
                ...action.props,
              },
            },
          },
        })),
      });
    case "UPDATE_NODE_FRAME":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({
          ...block,
          frame: {
            ...(block.frame || { x: 0, y: 0, width: 200, height: 100, zIndex: 1, rotate: 0 }),
            ...action.frame,
          },
        })),
      });
    case "UPDATE_RESPONSIVE_FRAME":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({
          ...block,
          responsive: {
            ...block.responsive,
            [action.deviceMode]: {
              ...(block.responsive?.[action.deviceMode] ?? {}),
              frame: {
                ...(block.responsive?.[action.deviceMode]?.frame ?? {}),
                ...action.frame,
              },
            },
          },
        })),
      });
    case "ADD_SECTION": {
      const sections = [...state.sections];
      const index = clampIndex(action.index ?? sections.length, sections.length);
      const newSection = {
        ...action.block,
        kind: "section" as const,
        parentId: null,
      };
      sections.splice(index, 0, ensureOnlookBlockMeta(newSection));
      return normalizeEditorState({ ...state, sections });
    }
    case "ADD_ELEMENT_TO_SECTION": {
      const elementNode = ensureOnlookBlockMeta({
        ...action.block,
        parentId: action.sectionId,
        frame: {
          x: action.x,
          y: action.y,
          width: action.block.frame?.width ?? 160,
          height: action.block.frame?.height ?? 40,
          zIndex: action.block.frame?.zIndex ?? 10,
          rotate: action.block.frame?.rotate ?? 0,
        },
      });
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.sectionId, (section) => {
          const children = [...(section.children ?? [])];
          children.push(elementNode);
          return { ...section, children };
        }),
      });
    }
    case "MOVE_NODE_Z_INDEX": {
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => {
          if (!block.frame) return block;
          const delta = action.direction === "forward" ? 1 : -1;
          const newZ = Math.max(1, (block.frame.zIndex ?? 1) + delta);
          return {
            ...block,
            frame: { ...block.frame, zIndex: newZ },
          };
        }),
      });
    }
    case "UPDATE_BLOCK_LABEL":
      return normalizeEditorState({
        ...state,
        sections: updateBlockRecursive(state.sections, action.blockId, (block) => ({
          ...block,
          label: action.label,
        })),
      });
    default:
      return state;
  }
}

export function normalizeEditorState(data: EditorData): EditorData {
  return {
    ...data,
    pageSettings: {
      ...createDefaultPageSettings(data.pageName),
      ...data.pageSettings,
    },
    sections: (data.sections || []).map(ensureOnlookBlockMeta),
  };
}

export function findBlockRecursive(blocks: EditorBlock[], blockId: string): EditorBlock | null {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    const child = findBlockRecursive(block.children ?? [], blockId);
    if (child) return child;
    for (const column of getColumnChildren(block) ?? []) {
      const columnChild = findBlockRecursive(column, blockId);
      if (columnChild) return columnChild;
    }
  }
  return null;
}

function blocksForRootInsert(block: EditorBlock): EditorBlock[] {
  const node = ensureOnlookBlockMeta(block);
  if (!isElementNodeType(node.type)) return [node];
  return [createEmptySectionNode([node])];
}

function updateBlockRecursive(blocks: EditorBlock[], blockId: string, updater: (block: EditorBlock) => EditorBlock): EditorBlock[] {
  return blocks.map((block) => {
    const next = block.id === blockId ? updater(block) : block;
    return mapNested(next, (children) => updateBlockRecursive(children, blockId, updater));
  });
}

function deleteBlockRecursive(blocks: EditorBlock[], blockId: string): EditorBlock[] {
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => mapNested(block, (children) => deleteBlockRecursive(children, blockId)));
}

function duplicateBlockRecursive(blocks: EditorBlock[], blockId: string, forcedId?: string): EditorBlock[] {
  const next: EditorBlock[] = [];
  for (const block of blocks) {
    next.push(mapNested(block, (children) => duplicateBlockRecursive(children, blockId, forcedId)));
    if (block.id === blockId) {
      next.push(cloneBlockWithFreshIds(block, forcedId));
    }
  }
  return next;
}

function insertInsideRecursive(
  blocks: EditorBlock[],
  containerId: string,
  child: EditorBlock,
  index?: number,
  columnIndex?: number,
): EditorBlock[] {
  return blocks.map((block) => {
    if (block.id === containerId) {
      if (block.type === "columns" && typeof columnIndex === "number") {
        const columns = getColumnChildren(block) ?? [];
        const column = [...(columns[columnIndex] ?? [])];
        column.splice(clampIndex(index ?? column.length, column.length), 0, child);
        return {
          ...block,
          props: {
            ...block.props,
            children: replaceColumn(columns, columnIndex, column),
          },
        };
      }

      if (!canNodeHaveChildren(block)) return block;
      const children = [...(block.children ?? [])];
      children.splice(clampIndex(index ?? children.length, children.length), 0, child);
      return { ...block, children };
    }

    return mapNested(block, (children) => insertInsideRecursive(children, containerId, child, index, columnIndex));
  });
}

function moveWithinParentRecursive(
  blocks: EditorBlock[],
  parentId: string,
  fromIndex: number,
  toIndex: number,
  columnIndex?: number,
): EditorBlock[] {
  return blocks.map((block) => {
    if (block.id === parentId) {
      if (block.type === "columns" && typeof columnIndex === "number") {
        const columns = getColumnChildren(block) ?? [];
        const column = moveInList(columns[columnIndex] ?? [], fromIndex, toIndex);
        return {
          ...block,
          props: {
            ...block.props,
            children: replaceColumn(columns, columnIndex, column),
          },
        };
      }

      return {
        ...block,
        children: moveInList(block.children ?? [], fromIndex, toIndex),
      };
    }

    return mapNested(block, (children) => moveWithinParentRecursive(children, parentId, fromIndex, toIndex, columnIndex));
  });
}

function mapNested(block: EditorBlock, mapChildren: (children: EditorBlock[]) => EditorBlock[]): EditorBlock {
  const columns = getColumnChildren(block);
  return {
    ...block,
    children: block.children ? mapChildren(block.children) : block.children,
    props: columns
      ? {
          ...block.props,
          children: columns.map((column) => mapChildren(column)),
        }
      : block.props,
  };
}

function getColumnChildren(block: EditorBlock): EditorBlock[][] | null {
  if (block.type !== "columns") return null;
  const children = block.props.children;
  return Array.isArray(children) ? children as EditorBlock[][] : [];
}

function replaceColumn(children: EditorBlock[][], columnIndex: number, column: EditorBlock[]): EditorBlock[][] {
  const next = [...children];
  next[columnIndex] = column;
  return next;
}

function moveInList(blocks: EditorBlock[], fromIndex: number, toIndex: number): EditorBlock[] {
  if (fromIndex === toIndex) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return blocks;
  next.splice(clampIndex(toIndex, next.length), 0, moved);
  return next;
}

function cloneBlockWithFreshIds(block: EditorBlock, forcedRootId?: string): EditorBlock {
  const copy = ensureOnlookBlockMeta({
    ...deepClone(block),
    id: forcedRootId ?? createBlockId(),
    oid: undefined,
    instanceId: undefined,
    domId: undefined,
    children: block.children?.map((child) => cloneBlockWithFreshIds(child)),
  });

  const columns = getColumnChildren(copy);
  if (!columns) return copy;

  return ensureOnlookBlockMeta({
    ...copy,
    props: {
      ...copy.props,
      children: columns.map((column) => column.map((child) => cloneBlockWithFreshIds(child))),
    },
  });
}

function clampIndex(index: number, max: number): number {
  return Math.max(0, Math.min(index, max));
}

function createBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function removeBlockRecursive(
  blocks: EditorBlock[],
  blockId: string,
): { nextBlocks: EditorBlock[]; removedBlock: EditorBlock | null } {
  let removedBlock: EditorBlock | null = null;
  const nextBlocks: EditorBlock[] = [];

  for (const block of blocks) {
    if (block.id === blockId) {
      removedBlock = block;
      continue;
    }

    if (block.children) {
      const res = removeBlockRecursive(block.children, blockId);
      if (res.removedBlock) {
        removedBlock = res.removedBlock;
        nextBlocks.push({
          ...block,
          children: res.nextBlocks,
        });
        continue;
      }
    }

    const columns = getColumnChildren(block);
    if (columns) {
      let found = false;
      const nextColumns = columns.map((col) => {
        const res = removeBlockRecursive(col, blockId);
        if (res.removedBlock) {
          removedBlock = res.removedBlock;
          found = true;
          return res.nextBlocks;
        }
        return col;
      });
      if (found) {
        nextBlocks.push({
          ...block,
          props: {
            ...block.props,
            children: nextColumns,
          },
        });
        continue;
      }
    }

    nextBlocks.push(block);
  }

  return { nextBlocks, removedBlock };
}

function moveBlockRecursive(
  blocks: EditorBlock[],
  blockId: string,
  containerId?: string,
  columnIndex?: number,
  index?: number,
): EditorBlock[] {
  const { nextBlocks, removedBlock } = removeBlockRecursive(blocks, blockId);
  if (!removedBlock) return blocks;

  if (containerId) {
    return insertInsideRecursive(nextBlocks, containerId, removedBlock, index, columnIndex);
  } else {
    const rootIndex = clampIndex(index ?? nextBlocks.length, nextBlocks.length);
    const blocksToInsert = blocksForRootInsert(removedBlock);
    const next = [...nextBlocks];
    next.splice(rootIndex, 0, ...blocksToInsert);
    return next;
  }
}
