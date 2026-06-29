"use client";

import { useEffect } from "react";
import { LandingEditorSnapshot } from "./editor-export-html";
import { CURRENT_EDITOR_SCHEMA_VERSION, migrateEditorSnapshot, VersionedLandingEditorSnapshot } from "./editor-migration";

export interface EditorStorageAdapter {
  load(pageId: string): Promise<LandingEditorSnapshot | null>;
  save(pageId: string, snapshot: LandingEditorSnapshot): Promise<void>;
}

export interface EditorRevision {
  id: string;
  name: string;
  snapshot: LandingEditorSnapshot;
  createdAt: string;
}

export function editorStorageKey(pageId: string): string {
  return `landing-page-editor:${pageId}`;
}

export function editorRevisionsKey(pageId: string): string {
  return `landing-page-editor-revisions:${pageId}`;
}

export function createLocalStorageAdapter(): EditorStorageAdapter {
  return {
    async load(pageId) {
      const raw = localStorage.getItem(editorStorageKey(pageId));
      if (!raw) return null;
      return migrateEditorSnapshot(JSON.parse(raw) as VersionedLandingEditorSnapshot, pageId);
    },
    async save(pageId, snapshot) {
      localStorage.setItem(
        editorStorageKey(pageId),
        JSON.stringify({ ...snapshot, schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION }),
      );
    },
  };
}

export async function loadEditorRevisions(pageId: string): Promise<EditorRevision[]> {
  const raw = localStorage.getItem(editorRevisionsKey(pageId));
  if (!raw) return [];
  const revisions = JSON.parse(raw) as EditorRevision[];
  return revisions.map((revision) => ({
    ...revision,
    snapshot: migrateEditorSnapshot(revision.snapshot as VersionedLandingEditorSnapshot, pageId),
  }));
}

export function saveEditorRevisions(pageId: string, revisions: EditorRevision[]): EditorRevision[] {
  const trimmed = revisions.slice(0, 30);
  localStorage.setItem(editorRevisionsKey(pageId), JSON.stringify(trimmed));
  return trimmed;
}

export function useDebouncedEditorAutosave({
  adapter,
  enabled,
  pageId,
  snapshot,
  delay = 700,
  onDirty,
  onSaved,
}: {
  adapter: EditorStorageAdapter;
  enabled: boolean;
  pageId: string;
  snapshot: LandingEditorSnapshot;
  delay?: number;
  onDirty?: () => void;
  onSaved?: (snapshot: LandingEditorSnapshot) => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    onDirty?.();
    const timer = window.setTimeout(() => {
      void adapter.save(pageId, snapshot).then(() => onSaved?.(snapshot));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [adapter, delay, enabled, onDirty, onSaved, pageId, snapshot]);
}
