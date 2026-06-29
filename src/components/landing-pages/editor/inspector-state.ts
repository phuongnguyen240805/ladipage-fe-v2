import { EditorBlock } from "./types";
import {
  InspectorMode,
  InspectorState,
  resolveInspectorModeFromBlock,
  resolveInspectorModeFromSelection,
  EditorSelection,
} from "./editor-selection";

export type { InspectorMode, InspectorState, EditorSelection };

export const INSPECTOR_OPEN_STORAGE_KEY = "landing-builder:inspector-open";

export function readInspectorOpenPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(INSPECTOR_OPEN_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function persistInspectorOpenPreference(isOpen: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSPECTOR_OPEN_STORAGE_KEY, String(isOpen));
}

export function resolveInspectorMode(block: EditorBlock | null): InspectorMode {
  return resolveInspectorModeFromBlock(block);
}

export function resolveInspectorModeForSelection(selection: EditorSelection): InspectorMode {
  return resolveInspectorModeFromSelection(selection);
}