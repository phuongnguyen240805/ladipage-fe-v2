"use client";

import { Dispatch, SetStateAction, useEffect } from "react";

interface UseEditorShortcutsOptions {
  handleDeleteBlock: (id: string) => void;
  handleDuplicateBlock: (id: string) => void;
  redo: () => void;
  selectedId: string | null;
  setIsCommandOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  undo: () => void;
}

export function useEditorShortcuts({
  handleDeleteBlock,
  handleDuplicateBlock,
  redo,
  selectedId,
  setIsCommandOpen,
  setSelectedId,
  undo,
}: UseEditorShortcutsOptions) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrlMeta = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlMeta && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (ctrlMeta && (event.key === "y" || (event.shiftKey && event.key === "z"))) {
        event.preventDefault();
        redo();
      }
      if (event.key === "Escape") setSelectedId(null);
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        const tag = (event.target as HTMLElement)?.tagName;
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
          event.preventDefault();
          handleDeleteBlock(selectedId);
        }
      }
      if (ctrlMeta && event.key === "d" && selectedId) {
        event.preventDefault();
        handleDuplicateBlock(selectedId);
      }
      if (ctrlMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDeleteBlock, handleDuplicateBlock, redo, selectedId, setIsCommandOpen, setSelectedId, undo]);
}
