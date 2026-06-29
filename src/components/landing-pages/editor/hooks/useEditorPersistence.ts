"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { LandingPageItem } from "../../dung-chung/types";
import {
  LandingEditorAction,
  LandingEditorSnapshot,
  createEditorSnapshot,
  normalizeEditorData,
} from "../core/editor-export-html";
import { buildInitialData, isLegacyTemplateData, isUntouchedStarterData } from "../core/editor-initial-data";
import {
  createLocalStorageAdapter,
  loadEditorRevisions,
  saveEditorRevisions,
  useDebouncedEditorAutosave,
  type EditorRevision,
} from "../core/editor-storage";
import { EditorData } from "../types";

interface UseEditorPersistenceOptions {
  page: LandingPageItem;
  data: EditorData;
  pageName: string;
  actionLog: LandingEditorAction[];
  replace: (data: EditorData) => void;
  setPageName: Dispatch<SetStateAction<string>>;
  setActionLog: Dispatch<SetStateAction<LandingEditorAction[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  showToast: (message: string, type?: "success" | "info") => void;
}

export function useEditorPersistence({
  page,
  data,
  pageName,
  actionLog,
  replace,
  setPageName,
  setActionLog,
  setSelectedId,
  showToast,
}: UseEditorPersistenceOptions) {
  const storageAdapter = useMemo(() => createLocalStorageAdapter(), []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<EditorRevision[]>([]);

  const autosaveSnapshot = useMemo(
    () => createEditorSnapshot({ ...data, pageName }, actionLog),
    [actionLog, data, pageName],
  );

  const saveSnapshot = useCallback((nextData: EditorData = data, nextActions: LandingEditorAction[] = actionLog) => {
    const snapshot = createEditorSnapshot({ ...nextData, pageName }, nextActions);
    void storageAdapter.save(page.id, snapshot);
    setLastSavedAt(snapshot.updatedAt);
    setIsSaved(true);
    return snapshot;
  }, [actionLog, data, page.id, pageName, storageAdapter]);

  const applySnapshot = useCallback((snapshot: LandingEditorSnapshot) => {
    const normalized = normalizeEditorData(snapshot.data);
    replace(normalized);
    setPageName(normalized.pageName);
    setActionLog(snapshot.actions ?? []);
    setLastSavedAt(snapshot.updatedAt ?? null);
    setSelectedId(null);
    setIsSaved(true);
  }, [replace, setActionLog, setPageName, setSelectedId]);

  useEffect(() => {
    let alive = true;
    storageAdapter.load(page.id)
      .then((snapshot) => {
        if (!alive || !snapshot) return;
        if (snapshot?.data?.pageId === page.id) {
          if (isUntouchedStarterData(snapshot.data) || isLegacyTemplateData(snapshot.data, page)) {
            applySnapshot(createEditorSnapshot(buildInitialData(page), []));
          } else {
            applySnapshot(snapshot);
          }
        }
      })
      .catch(() => {
        void storageAdapter.save(page.id, createEditorSnapshot(buildInitialData(page), []));
      })
      .finally(() => {
        if (alive) setIsHydrated(true);
      });

    return () => {
      alive = false;
    };
  }, [applySnapshot, page, storageAdapter]);

  useEffect(() => {
    let alive = true;
    loadEditorRevisions(page.id)
      .then((loaded) => {
        if (alive) setRevisions(loaded);
      })
      .catch(() => {
        if (alive) setRevisions([]);
      });
    return () => {
      alive = false;
    };
  }, [page.id]);

  useDebouncedEditorAutosave({
    adapter: storageAdapter,
    enabled: isHydrated,
    pageId: page.id,
    snapshot: autosaveSnapshot,
    onDirty: () => setIsSaved(false),
    onSaved: (snapshot) => {
      setLastSavedAt(snapshot.updatedAt);
      setIsSaved(true);
    },
  });

  const handleImportJson = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot = JSON.parse(String(reader.result)) as LandingEditorSnapshot;
        const snapshotData = snapshot?.data as any;
        if ((!snapshotData?.blocks && !snapshotData?.sections) || !snapshotData?.pageSettings) {
          throw new Error("Invalid landing page snapshot");
        }
        applySnapshot({
          ...snapshot,
          data: {
            ...snapshot.data,
            pageId: page.id,
            pageName: snapshot.data.pageName || pageName,
          },
        });
        showToast("ÄÃ£ import báº£n thiáº¿t káº¿ thÃ nh cÃ´ng", "success");
      } catch {
        showToast("File JSON khÃ´ng há»£p lá»‡", "info");
      }
    };
    reader.readAsText(file);
  }, [applySnapshot, page.id, pageName, showToast]);

  const persistRevisions = useCallback((nextRevisions: EditorRevision[]) => {
    const trimmed = nextRevisions.slice(0, 30);
    setRevisions(trimmed);
    void saveEditorRevisions(page.id, trimmed);
  }, [page.id]);

  const handleCreateRevision = useCallback((name?: string) => {
    const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
    const revision: EditorRevision = {
      id: `rev_${Date.now()}`,
      name: name?.trim() || `PhiÃªn báº£n ngÃ y ${new Date().toLocaleString("vi-VN")}`,
      snapshot,
      createdAt: snapshot.updatedAt,
    };
    persistRevisions([revision, ...revisions]);
    showToast("ÄÃ£ táº¡o Ä‘iá»ƒm lÆ°u thÃ nh cÃ´ng", "success");
  }, [actionLog, data, pageName, persistRevisions, revisions, showToast]);

  const handleRestoreRevision = useCallback((revision: EditorRevision) => {
    applySnapshot(revision.snapshot);
    saveSnapshot(revision.snapshot.data, revision.snapshot.actions);
    showToast("ÄÃ£ khÃ´i phá»¥c thiáº¿t káº¿", "success");
  }, [applySnapshot, saveSnapshot, showToast]);

  return {
    applySnapshot,
    handleCreateRevision,
    handleImportJson,
    handleRestoreRevision,
    isSaved,
    lastSavedAt,
    revisions,
    saveSnapshot,
  };
}
