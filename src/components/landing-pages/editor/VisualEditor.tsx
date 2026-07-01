"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  EditorData, BlockType, DeviceMode, EditorViewMode, DEVICE_WIDTHS, createDefaultPageSettings, EditorBlock, ensureOnlookBlockMeta,
} from "./types";
import {
  LandingEditorAction,
  LandingEditorSnapshot,
  createEditorSnapshot,
  normalizeEditorData,
  renderLandingPageHtml,
} from "./editor-actions";
import { EditorTopBar } from "./EditorTopBar";
import { Canvas } from "./Canvas";
import { InspectorPanel } from "./InspectorPanel";
import { EditorShellLayout } from "./components/EditorShellLayout";
import { EditorLeftRail, LeftRailClickAction } from "./components/EditorLeftRail";
import { EditorLeftDrawer, DrawerCategoryId } from "./components/EditorLeftDrawer";
import { LandingPageItem } from "../dung-chung/types";
import { FUNNELX_FLAGS } from "@onlook/funnel";
import { useEditorBlockActions } from "./hooks/useEditorBlockActions";
import {
  loadLandingPage,
  saveLandingPage,
  getLocalBackupKey,
  publishLandingPage,
  unpublishLandingPage,
  getPageSecurityInfo,
  createLandingPageVersion,
  listLandingPageVersions,
  restoreLandingPageVersion,
} from "./core/editor-supabase-storage";
import { getEditorDataFingerprint, migrateEditorData } from "./core/editor-migration";
import { findBlockRecursive } from "./core/editor-reducer";
import {
  EditorSelection,
  getSelectedBlockId,
  selectionFromBlockId,
} from "./editor-selection";
import {
  InspectorState,
  persistInspectorOpenPreference,
  readInspectorOpenPreference,
  resolveInspectorModeForSelection,
} from "./inspector-state";
import { findMatchingCommand } from "./core/ai-command-registry";
import { parseHtmlToImportedPageSchema } from "../../../features/landing-pages/import/html-to-landing-schema";
import { importZipLandingPage } from "../../../features/landing-pages/import/zip-importer";
import {
  getBuilderSessionTokenFromSearch,
  saveBuilderDraft,
} from "@/features/landing-builder/store/manual-save";
import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";
import { useLandingAccess } from "@/features/landing-pages/hooks/useLandingAccess";
import { billingApi } from "@/lib/endpoints/billing.api";
import { LandingUpgradeModal } from "../shared/LandingUpgradeModal";

import { AIChatPanel } from "./panels/AIChatPanel";

const MAX_HISTORY = 60;

function useHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const push = useCallback((next: T) => {
    setPast((p) => [...p.slice(-MAX_HISTORY), present]);
    setPresent(next);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [present, ...f]);
    setPresent(prev);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, present]);
    setPresent(next);
  }, [future, present]);

  const replace = useCallback((next: T) => {
    setPast([]);
    setPresent(next);
    setFuture([]);
  }, []);

  const silentUpdate = useCallback((next: T) => {
    setPresent(next);
  }, []);

  return {
    state: present,
    push,
    replace,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    silentUpdate,
  };
}

const Toast: React.FC<{ message: string; type: "success" | "info" }> = ({ message, type }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all animate-bounce-in ${
      type === "success" ? "bg-green-600" : "bg-lime-500"
    }`}
  >
    {type === "success" ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    )}
    {message}
  </div>
);

function formatActionLabel(action: LandingEditorAction): string {
  switch (action.type) {
    case "insert-element":
      return `Đã chèn ${action.blockType} tại ${(action.index ?? 0) + 1}`;
    case "remove-element":
    case "delete-element":
      return `Đã xóa khối ${action.blockType}`;
    case "move-element":
    case "reorder-elements":
      return `Di chuyển khối ${(action.fromIndex ?? 0) + 1} -> ${(action.toIndex ?? 0) + 1}`;
    case "update-props":
    case "update-element-props":
      return `Cập nhật ${action.blockType}: ${action.keys?.join(", ") || action.key || "thuộc tính"}`;
    case "update-element-frame":
      return `Cập nhật vị trí/kích thước: ${action.blockType}`;
    case "update-page-settings":
      return `Cài đặt trang: ${action.key}`;
    default:
      return "Thao tác chỉnh sửa";
  }
}

interface EditorRevision {
  id: string;
  name: string;
  snapshot: LandingEditorSnapshot;
  createdAt: string;
}

interface VisualEditorProps {
  page: LandingPageItem;
  pages?: LandingPageItem[];
  onClose: () => void;
  onPublish?: (page: LandingPageItem) => void;
  onSwitchPage?: (page: LandingPageItem) => void;
  onCreatePage?: (name: string) => any;
  onDeletePage?: (id: string) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  page,
  pages,
  onClose,
  onPublish,
  onSwitchPage,
  onCreatePage,
  onDeletePage,
}) => {
  const { state: data, push, replace, undo, redo, canUndo, canRedo, silentUpdate } = useHistory<EditorData>(
    {
      pageId: page.id,
      pageName: page.name,
      sections: [],
      pageSettings: createDefaultPageSettings(page.name),
      schemaVersion: 2,
    }
  );

  const [editorSelection, setEditorSelection] = useState<EditorSelection>({ type: "page" });
  const [inspectorState, setInspectorState] = useState<InspectorState>(() => ({
    open: readInspectorOpenPreference(),
    mode: "page",
  }));
  const selectedId = getSelectedBlockId(editorSelection);
  const setSelectedId = useCallback((id: string | null) => {
    setEditorSelection(selectionFromBlockId(id, data.sections));
  }, [data.sections]);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(1);
  const [pageName, setPageName] = useState(page.name);
  const [isSaved, setIsSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<EditorViewMode>("design");
  const [actionLog, setActionLog] = useState<LandingEditorAction[]>([]);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importHtmlInputRef = useRef<HTMLInputElement | null>(null);
  const isHydratedRef = useRef(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [builderSessionToken, setBuilderSessionToken] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<EditorRevision[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  // Security state — đồng bộ với Supabase sau mỗi lần publish/unpublish
  const [pageStatus, setPageStatus] = useState<string>(page.status?.toLowerCase() || "draft");
  const [pageVisibility, setPageVisibility] = useState<string>("private");
  const [pageSlug, setPageSlug] = useState<string | null>(null);

  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [leftDrawerCategory, setLeftDrawerCategory] = useState<DrawerCategoryId>("elements");
  const [elementPaletteCategory, setElementPaletteCategory] = useState("text");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; description?: string }>({
    open: false,
    feature: "",
  });
  const landingAccess = useLandingAccess();

  useEffect(() => {
    const tokenFromUrl = getBuilderSessionTokenFromSearch(window.location.search);
    if (tokenFromUrl) {
      setBuilderSessionToken(tokenFromUrl);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const headers = await getPlatformAuthHeaders();
        const response = await fetch("/api/builder/session", {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({ pageId: page.id }),
        });
        if (!response.ok || cancelled) return;
        const result = (await response.json()) as { token?: string };
        if (result.token && !cancelled) {
          setBuilderSessionToken(result.token);
        }
      } catch (err) {
        console.warn("Builder session bootstrap failed, using landing API save:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page.id]);

  const openLeftDrawer = useCallback((category: DrawerCategoryId, presetCategory?: string) => {
    setLeftDrawerCategory(category);
    if (presetCategory) {
      setElementPaletteCategory(presetCategory);
    }
    setIsLeftDrawerOpen(true);
  }, []);

  const toggleLeftDrawer = useCallback((category: DrawerCategoryId, presetCategory?: string) => {
    if (isLeftDrawerOpen && leftDrawerCategory === category) {
      setIsLeftDrawerOpen(false);
    } else {
      openLeftDrawer(category, presetCategory);
    }
  }, [isLeftDrawerOpen, leftDrawerCategory, openLeftDrawer]);

  const handleLeftRailAction = useCallback((action: LeftRailClickAction) => {
    if (action === "add") {
      openLeftDrawer("elements", "text");
      return;
    }
    if (action === "video") {
      openLeftDrawer("elements", "video");
      return;
    }
    if (action === "select") {
      setSelectedId(null);
      return;
    }
    toggleLeftDrawer(action);
  }, [openLeftDrawer, toggleLeftDrawer]);
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSelectSelection = useCallback((selection: EditorSelection) => {
    setEditorSelection(selection);
    setInspectorState((prev) =>
      prev.open
        ? { ...prev, mode: resolveInspectorModeForSelection(selection) }
        : prev,
    );
  }, []);

  const handleSelectBlock = useCallback((id: string | null) => {
    const selection = selectionFromBlockId(id, data.sections);
    handleSelectSelection(selection);
  }, [data.sections, handleSelectSelection]);

  const handleOpenInspector = useCallback((mode?: InspectorState["mode"]) => {
    setInspectorState({
      open: true,
      mode: mode ?? resolveInspectorModeForSelection(editorSelection),
    });
    persistInspectorOpenPreference(true);
  }, [editorSelection]);

  const handleCloseInspector = useCallback(() => {
    setInspectorState((prev) => ({ ...prev, open: false }));
    persistInspectorOpenPreference(false);
  }, []);

  const saveDraft = useCallback(async (nextData: EditorData = data, nextActions: LandingEditorAction[] = actionLog) => {
    setSaveStatus("saving");
    try {
      const snapshot = createEditorSnapshot({ ...nextData, pageName }, nextActions);
      console.info("[LandingEditor Snapshot:save]", {
        pageId: page.id,
        localStorageKey: getLocalBackupKey(page.id),
        fingerprint: getEditorDataFingerprint(snapshot.data),
      });
      let savedAt = snapshot.updatedAt;
      if (builderSessionToken) {
        try {
          const result = await saveBuilderDraft({
            pageId: page.id,
            editorData: snapshot.data,
            name: snapshot.data.pageName || pageName,
            slug: snapshot.data.pageSettings?.slug,
            sessionToken: builderSessionToken,
          });
          savedAt = result.savedAt || new Date().toISOString();
        } catch (builderErr) {
          console.warn("Builder draft save failed, falling back to landing API:", builderErr);
          await saveLandingPage(page.id, snapshot.data);
          savedAt = new Date().toISOString();
        }
      } else {
        await saveLandingPage(page.id, snapshot.data);
      }
      setLastSavedAt(savedAt);
      setIsSaved(true);
      setSaveStatus("saved");
      return snapshot;
    } catch (err) {
      console.error("Draft save failed:", err);
      setSaveStatus("error");
      setIsSaved(false);
      throw err;
    }
  }, [actionLog, builderSessionToken, data, pageName, page.id]);

  const applySnapshot = useCallback((snapshot: LandingEditorSnapshot) => {
    const normalized = normalizeEditorData(snapshot.data);
    replace(normalized);
    setPageName(normalized.pageName);
    setActionLog(snapshot.actions ?? []);
    setLastSavedAt(snapshot.updatedAt ?? null);
    setSelectedId(null);
    setIsSaved(true);
    setSaveStatus("saved");
  }, [replace]);

  const markDirty = useCallback(() => {
    if (!isHydratedRef.current) return;
    setIsSaved(false);
    setSaveStatus((current) => (current === "saving" ? current : "saved"));
  }, []);

  const pushLocal = useCallback((nextData: EditorData) => {
    markDirty();
    push(nextData);
  }, [markDirty, push]);

  const silentUpdateLocal = useCallback((nextData: EditorData) => {
    markDirty();
    silentUpdate(nextData);
  }, [markDirty, silentUpdate]);

  const handleSetPageName = useCallback((name: string) => {
    markDirty();
    setPageName(name);
  }, [markDirty]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    markDirty();
    undo();
  }, [canUndo, markDirty, undo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    markDirty();
    redo();
  }, [canRedo, markDirty, redo]);

  const handleCloseSafe = useCallback(() => {
    if (!isSaved) {
      const confirmClose = window.confirm("Trang hiện có thay đổi chưa lưu. Bạn có muốn quay lại và bỏ các thay đổi này không?");
      if (!confirmClose) return;
    }
    onClose();
  }, [isSaved, onClose]);

  // Load page on mount
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsEditorLoading(true);
      setLoadError(null);
      console.info("[LandingEditor Route]", {
        routePageId: page.id,
        localStorageKey: getLocalBackupKey(page.id),
      });
      try {
        const pageData = await loadLandingPage(page.id);
        if (cancelled) return;
        if (pageData) {
          // If a newer local backup exists, prompt the user
          if ((pageData as any).hasNewerLocalBackup) {
            const recover = confirm(
              "Tìm thấy bản nháp lưu cục bộ (Local Storage) mới hơn bản ghi trên database. Bạn có muốn khôi phục thiết kế từ bản nháp này không?"
            );
            if (recover && (pageData as any).localBackupData) {
              applySnapshot(createEditorSnapshot((pageData as any).localBackupData, []));
              console.info("[LandingEditor Snapshot:recover-local]", {
                pageId: page.id,
                fingerprint: getEditorDataFingerprint((pageData as any).localBackupData),
              });
              return;
            }
          }
          console.info("[LandingEditor Snapshot:apply-load]", {
            pageId: page.id,
            fingerprint: getEditorDataFingerprint(pageData),
          });
          applySnapshot(createEditorSnapshot(pageData, []));
        } else {
          setLoadError("Không tải được dữ liệu trang này. Kiểm tra pageId hoặc kết nối Supabase.");
        }
      } catch (err) {
        console.error("Failed to load landing page data:", err);
        if (!cancelled) {
          setLoadError("Không tải được dữ liệu trang này. Không dùng template mặc định để che lỗi.");
        }
      } finally {
        if (!cancelled) {
          isHydratedRef.current = true;
          setIsEditorLoading(false);
          void loadRevisions();
          // Load trạng thái bảo mật từ Supabase để hiển thị đúng badge
          getPageSecurityInfo(page.id).then((info) => {
            if (info && !cancelled) {
              setPageStatus(info.status);
              setPageVisibility(info.visibility);
              setPageSlug(info.slug);
            }
          }).catch(() => {/* ignore */});
        }
      }
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [page.id, applySnapshot]);


  // Load versions from Supabase/LocalStorage
  const loadRevisions = useCallback(async () => {
    try {
      const dbVersions = await listLandingPageVersions(page.id);
      setRevisions(
        dbVersions.map((v: any) => ({
          id: v.id,
          name: v.version_name || "Bản lưu",
          snapshot: {
            data: v.editor_data,
            actions: [],
            html: "",
            updatedAt: v.created_at,
          },
          createdAt: new Date(v.created_at).toLocaleTimeString("vi-VN") + ", " + new Date(v.created_at).toLocaleDateString("vi-VN"),
        }))
      );
    } catch (err) {
      console.error("Error loading revisions:", err);
    }
  }, [page.id]);



  // Manual-save mode: warn only when the local builder state has unsaved edits.
  useEffect(() => {
    if (isSaved) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaved]);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleUpgradeLanding = useCallback(async () => {
    try {
      const response = await billingApi.subscribe({ plan: "pro" });
      const checkoutUrl = (response as { session?: { url?: string } }).session?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      showToast("Đã gửi yêu cầu nâng cấp gói.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tạo phiên nâng cấp.", "info");
    }
  }, [showToast]);

  const openUpgradeModal = useCallback((feature: string, description?: string) => {
    setUpgradeModal({ open: true, feature, description });
  }, []);

  const handlePremiumBlocked = useCallback(() => {
    openUpgradeModal(
      "Block Builder nâng cao",
      "Block này yêu cầu gói Pro và quyền Builder nâng cao."
    );
  }, [openUpgradeModal]);

  const recordAction = useCallback((action: LandingEditorAction) => {
    setActionLog((prev) => [...prev.slice(-119), action]);
  }, []);

  // ── Block mutations ──────────────────────────────────────────

  const {
    handleAddBlock,
    handleApplyTemplate,
    handleClearCanvas,
    handleDeleteBlock,
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
  } = useEditorBlockActions({
    data,
    handleSelectBlock,
    push: pushLocal,
    silentUpdate: silentUpdateLocal,
    recordAction,
    selectedId,
    setSelectedId,
    showToast,
  });

  const handleSendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg = { sender: "user" as const, text, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "Tôi đã tiếp nhận yêu cầu và đang tối ưu hóa thiết kế cho bạn.";
      let actionTaken = false;

      const matchedCommand = findMatchingCommand(text);

      if (matchedCommand) {
        actionTaken = true;
        aiResponse = matchedCommand.explanation;

        if (matchedCommand.action === "insert_block" && matchedCommand.blockType) {
          handleAddBlock(matchedCommand.blockType);
        } else if (matchedCommand.action === "update_page_settings" && matchedCommand.updateKey) {
          handleUpdatePageSettings(matchedCommand.updateKey, matchedCommand.updateValue);
        }
      }

      if (!actionTaken) {
        const currentSelectedBlock = selectedId ? findBlockRecursive(data.sections, selectedId) : null;

        if (currentSelectedBlock) {
          const blockId = currentSelectedBlock.id;
          const currentProps = { ...currentSelectedBlock.props };
          const normalizedText = text.toLowerCase().trim();

          if (normalizedText.includes("màu cam") || normalizedText.includes("orange")) {
            if ("color" in currentProps) {
              currentProps.color = "#f97316";
              aiResponse = `Đã cập nhật màu sắc sang màu cam ấm (#f97316) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            } else if ("ctaColor" in currentProps) {
              currentProps.ctaColor = "#f97316";
              aiResponse = `Đã cập nhật màu nút CTA sang màu cam ấm (#f97316) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            }
          }
          else if (normalizedText.includes("màu đỏ") || normalizedText.includes("red")) {
            if ("color" in currentProps) {
              currentProps.color = "#ef4444";
              aiResponse = `Đã đổi màu sắc sang màu đỏ (#ef4444) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            } else if ("ctaColor" in currentProps) {
              currentProps.ctaColor = "#ef4444";
              aiResponse = `Đã đổi màu nút CTA sang màu đỏ (#ef4444) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            }
          }
          else if (normalizedText.includes("màu đen") || normalizedText.includes("black")) {
            if ("color" in currentProps) {
              currentProps.color = "#000000";
              aiResponse = `Đã đổi màu sang màu đen (#000000) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            } else if ("bgColor" in currentProps) {
              currentProps.bgColor = "#0f172a";
              aiResponse = `Đã cập nhật nền tối màu sang đen tối (#0f172a) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
              actionTaken = true;
            }
          }

          const titleMatch = text.match(/(?:tiêu đề|tên nút|chữ thành|đổi chữ|sửa chữ)\s+['"“](.+?)['"”]/i) 
            || text.match(/(?:tiêu đề|tên nút|chữ thành|đổi chữ|sửa chữ)\s+(.+)$/i);
          if (titleMatch) {
            const newText = titleMatch[1].trim();
            if ("headline" in currentProps) {
              currentProps.headline = newText;
              aiResponse = `Đã sửa tiêu đề chính thành: "${newText}"!`;
              actionTaken = true;
            } else if ("content" in currentProps) {
              currentProps.content = newText;
              aiResponse = `Đã cập nhật nội dung văn bản thành: "${newText}"!`;
              actionTaken = true;
            } else if ("label" in currentProps) {
              currentProps.label = newText;
              aiResponse = `Đã đổi nhãn nút thành: "${newText}"!`;
              actionTaken = true;
            } else if ("title" in currentProps) {
              currentProps.title = newText;
              aiResponse = `Đã đổi tiêu đề thành: "${newText}"!`;
              actionTaken = true;
            }
          }

          if (normalizedText.includes("căn giữa") || normalizedText.includes("center")) {
            if ("textAlign" in currentProps) {
              currentProps.textAlign = "center";
              aiResponse = `Đã căn giữa văn bản cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
              actionTaken = true;
            } else if ("align" in currentProps) {
              currentProps.align = "center";
              aiResponse = `Đã căn giữa nút cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
              actionTaken = true;
            }
          }

          if (actionTaken) {
            handleUpdateBlock(blockId, currentProps);
          }
        }
      }

      if (!actionTaken) {
        aiResponse = "Tôi đã hiểu ý tưởng thiết kế của bạn. Hãy chọn một khối cụ thể (như Hero, Text, Nút CTA) để tôi có thể chỉnh sửa chính xác các chi tiết hoặc màu sắc của khối đó!";
      }

      const aiMsg = { sender: "ai" as const, text: aiResponse, timestamp: new Date().toLocaleTimeString() };
      setChatHistory(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 1000);
  }, [selectedId, data.sections, handleUpdateBlock, handleUpdatePageSettings, handleAddBlock]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrlMeta = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlMeta && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if (ctrlMeta && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); handleRedo(); }
      if (e.key === "Escape") {
        if (isLeftDrawerOpen) {
          setIsLeftDrawerOpen(false);
        } else if (isAiPanelOpen) {
          setIsAiPanelOpen(false);
        } else {
          setSelectedId(null);
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
          e.preventDefault();
          handleDeleteBlock(selectedId);
        }
      }
      if (ctrlMeta && e.key === "d" && selectedId) {
        e.preventDefault();
        handleDuplicateBlock(selectedId);
      }
      if (ctrlMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo, selectedId, handleDeleteBlock, handleDuplicateBlock, isLeftDrawerOpen, isAiPanelOpen]);

  const handlePublish = async () => {
    if (!landingAccess.canPublishPage) {
      openUpgradeModal(
        "Xuất bản landing page",
        "Bạn cần quyền landing:pages:publish để xuất bản trang."
      );
      return;
    }

    try {
      await saveDraft();
      const html = renderLandingPageHtml({ ...data, pageName });
      await publishLandingPage(page.id, html);
      // Đồng bộ state bảo mật
      setPageStatus("published");
      setPageVisibility("public");
      showToast("Đã xuất bản trang thành công! 🎉", "success");
      if (onPublish) onPublish({ ...page, name: pageName, status: "PUBLISHED" });
    } catch (err) {
      console.error("Publish failed:", err);
      showToast("Xuất bản trang thất bại", "info");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishLandingPage(page.id);
      setPageStatus("draft");
      setPageVisibility("private");
      showToast("Đã hủy xuất bản. Trang hiện ở chế độ riêng tư.", "info");
    } catch (err) {
      console.error("Unpublish failed:", err);
      showToast("Hủy xuất bản thất bại", "info");
    }
  };

  const downloadFile = useCallback((fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleManualSave = useCallback(async () => {
    try {
      await saveDraft();
      showToast("Đã lưu bản thiết kế thiết kế", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Lưu thiết kế thất bại", "info");
    }
  }, [saveDraft, showToast]);

  const handleExportJson = useCallback(() => {
    const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
    downloadFile(`${pageName || "landing-page"}.json`, JSON.stringify(snapshot, null, 2), "application/json");
    showToast("Đã xuất file JSON", "success");
  }, [actionLog, data, downloadFile, pageName]);

  const handleExportHtml = useCallback(() => {
    const html = renderLandingPageHtml({ ...data, pageName });
    downloadFile(`${pageName || "landing-page"}.html`, html, "text/html");
    showToast("Đã xuất file HTML", "success");
  }, [data, downloadFile, pageName]);

  const handleImportJson = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot = JSON.parse(String(reader.result)) as any;
        if ((!snapshot?.data?.blocks && !snapshot?.data?.sections) || !snapshot?.data?.pageSettings) {
          throw new Error("Invalid landing page snapshot");
        }
        const migratedData = migrateEditorData(snapshot.data, page.id);
        const migratedSnapshot = {
          ...snapshot,
          data: {
            ...migratedData,
            pageName: migratedData.pageName || pageName,
          }
        };
        applySnapshot(migratedSnapshot);
        markDirty();
        showToast("Đã import bản thiết kế thành công", "success");
      } catch (err) {
        console.error("Import JSON failed:", err);
        showToast("File JSON không hợp lệ", "info");
      }
    };
    reader.readAsText(file);
  }, [applySnapshot, markDirty, page.id, pageName]);

  const handleImportHtml = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "zip") {
      try {
        const imported = await importZipLandingPage(file, page.id, (progress, statusText) => {
          showToast(`[ZIP Import ${progress}%] ${statusText}`, "info");
        });

        if (imported.sections && imported.sections.length > 0) {
          const confirmReplace = window.confirm(
            "Đã bóc tách thành công ZIP thiết kế!\n\n" +
            "Bạn có muốn GHI ĐÈ toàn bộ trang hiện tại không?\n" +
            "- Chọn 'OK' để GHI ĐÈ.\n" +
            "- Chọn 'Cancel' để THÊM VÀO CUỐI trang hiện tại (Append)."
          );

          let nextSections = data.sections;
          let nextGlobalCss = data.pageSettings.globalCss || "";

          if (confirmReplace) {
            const doubleConfirm = window.confirm("Hành động này sẽ XÓA HẾT các khối hiện tại trên canvas. Bạn có chắc chắn muốn tiếp tục?");
            if (!doubleConfirm) return;
            nextSections = imported.sections;
            nextGlobalCss = imported.globalCss;
          } else {
            nextSections = [...data.sections, ...imported.sections];
            nextGlobalCss = (nextGlobalCss + "\n" + imported.globalCss).trim();
          }

          pushLocal({
            ...data,
            sections: nextSections,
            pageSettings: {
              ...data.pageSettings,
              globalCss: nextGlobalCss,
            },
          });

          setSelectedId(null);
          showToast("Đã nhập ZIP thiết kế thành công!", "success");
        } else {
          showToast("ZIP rỗng hoặc lỗi phân tích cấu trúc.", "info");
        }
      } catch (err: any) {
        console.error("ZIP import error:", err);
        showToast(err.message || "Lỗi xử lý ZIP", "info");
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const htmlCode = String(reader.result);
          if (!htmlCode.trim()) {
            throw new Error("File HTML trống");
          }

          // Hỏi người dùng cách thức chuyển đổi
          const confirmNative = window.confirm(
            "Bạn có muốn CHUYỂN ĐỔI file HTML thành các khối thiết kế chỉnh sửa được (Editable Native Blocks - Khuyên dùng) không?\n\n" +
            "- Chọn 'OK' để chuyển đổi tự động thành Sections/Headings/Paragraphs/Buttons/Images...\n" +
            "- Chọn 'Cancel' để nhập dưới dạng một khối mã nguồn HTML thô (Raw HTML)."
          );

          let parsedSections: EditorBlock[] = [];
          let parsedGlobalCss = "";

          if (confirmNative) {
            const imported = parseHtmlToImportedPageSchema(htmlCode);
            parsedSections = imported.sections;
            parsedGlobalCss = imported.globalCss;
            if (parsedSections.length === 0) {
              throw new Error("Không tìm thấy cấu trúc section/element phù hợp trong file HTML.");
            }
          } else {
            const rawBlock = ensureOnlookBlockMeta({
              id: `html_${Date.now()}`,
              type: "html_code",
              label: "Mã HTML Nhập khẩu",
              props: {
                code: htmlCode,
                height: 800
              }
            });
            parsedSections = [rawBlock];
          }

          // Hỏi người dùng ghi đè hay chèn tiếp
          const confirmReplace = window.confirm(
            "Bạn có muốn GHI ĐÈ (Replace) toàn bộ trang hiện tại bằng nội dung HTML mới không?\n\n" +
            "- Chọn 'OK' để GHI ĐÈ toàn bộ các khối hiện tại.\n" +
            "- Chọn 'Cancel' để THÊM VÀO CUỐI trang hiện tại (Append)."
          );

          let nextSections = data.sections;
          let nextGlobalCss = data.pageSettings.globalCss || "";

          if (confirmReplace) {
            const doubleConfirm = window.confirm("Hành động này sẽ XÓA HẾT các khối hiện tại trên canvas. Bạn có chắc chắn muốn tiếp tục?");
            if (!doubleConfirm) return;
            nextSections = parsedSections;
            nextGlobalCss = parsedGlobalCss;
          } else {
            nextSections = [...data.sections, ...parsedSections];
            nextGlobalCss = (nextGlobalCss + "\n" + parsedGlobalCss).trim();
          }

          pushLocal({
            ...data,
            sections: nextSections,
            pageSettings: {
              ...data.pageSettings,
              globalCss: nextGlobalCss,
            },
          });

          setSelectedId(null);
          showToast("Đã import HTML thành công!", "success");
        } catch (err: any) {
          console.error("Import HTML failed:", err);
          showToast(err.message || "File HTML không hợp lệ", "info");
        }
      };
      reader.readAsText(file);
    }
  }, [page.id, data, pushLocal, setSelectedId, showToast]);

  const handleSwitchPageSafe = useCallback((targetPage: LandingPageItem) => {
    if (!isSaved) {
      const confirmSwitch = window.confirm("Trang hiện tại chưa được lưu. Bạn có muốn tiếp tục chuyển trang mà không lưu?");
      if (!confirmSwitch) return;
    }
    if (onSwitchPage) {
      onSwitchPage(targetPage);
    }
  }, [isSaved, onSwitchPage]);

  const handleCreateRevision = useCallback(async (name?: string) => {
    const versionName = name?.trim() || `Phiên bản ngày ${new Date().toLocaleString("vi-VN")}`;
    try {
      const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
      await createLandingPageVersion(page.id, snapshot.data, versionName);
      void loadRevisions();
      showToast("Đã tạo điểm lưu thành công", "success");
    } catch (err) {
      console.error("Failed to create revision:", err);
      showToast("Không thể tạo điểm lưu", "info");
    }
  }, [actionLog, data, pageName, page.id, loadRevisions]);

  const handleRestoreRevision = useCallback(async (revision: EditorRevision) => {
    try {
      setSaveStatus("saving");
      const restoredData = await restoreLandingPageVersion(page.id, revision.id, data);
      const snapshot = createEditorSnapshot(restoredData, []);
      applySnapshot(snapshot);
      markDirty();
      void loadRevisions();
      showToast("Đã khôi phục thiết kế", "success");
    } catch (err) {
      console.error("Failed to restore revision:", err);
      showToast("Khôi phục thiết kế thất bại", "info");
      setSaveStatus("error");
    }
  }, [data, page.id, applySnapshot, markDirty, loadRevisions, showToast]);

  // Removed duplicate block actions (now handled by useEditorBlockActions hook)

  const selectedBlock = selectedId ? findBlockRecursive(data.sections, selectedId) ?? null : null;
  const sandboxPreviewUrl = data.pageSettings.sandboxUrl
    || (data.pageSettings.sandboxProvider === "codesandbox" && data.pageSettings.sandboxId
      ? `https://${data.pageSettings.sandboxId}-${data.pageSettings.sandboxPort}.csb.app`
      : `${data.pageSettings.customDomain || "local-preview"}${data.pageSettings.previewPath || "/"}`);
  const previewHtml = renderLandingPageHtml({ ...data, pageName });
  const codeView = JSON.stringify(createEditorSnapshot({ ...data, pageName }, actionLog), null, 2);

  if (isEditorLoading) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-sm font-bold">Đang tải dữ liệu editor...</p>
          <p className="mt-1 text-xs text-gray-400">{page.id}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-950 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-7 text-center shadow-2xl">
          <h2 className="text-xl font-black">Không mở được editor</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">{loadError}</p>
          <p className="mt-2 break-all text-xs text-gray-500">pageId: {page.id}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-gray-950 hover:bg-gray-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <EditorShellLayout
        topBar={
          <>
            <EditorTopBar
              pageName={pageName}
              setPageName={handleSetPageName}
              deviceMode={deviceMode}
              setDeviceMode={setDeviceMode}
              zoom={zoom}
              setZoom={setZoom}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClose={handleCloseSafe}
              onSave={handleManualSave}
              onCreateRevision={() => handleCreateRevision()}
              onOpenCommand={() => setIsCommandOpen(true)}
              onImportJson={() => importInputRef.current?.click()}
              onImportHtml={() => importHtmlInputRef.current?.click()}
              onExportJson={handleExportJson}
              onExportHtml={handleExportHtml}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              isSaved={isSaved}
              isSaving={saveStatus === "saving"}
              lastSavedAt={lastSavedAt}
              activeViewMode={activeViewMode}
              setActiveViewMode={setActiveViewMode}
              blockCount={data.sections.length}
              pageStatus={pageStatus}
              pageVisibility={pageVisibility}
              pageSlug={pageSlug}
              onOpenElements={() => openLeftDrawer("elements", "text")}
              onOpenLayers={() => toggleLeftDrawer("layers")}
              onOpenAssets={() => toggleLeftDrawer("assets")}
              onOpenAI={() => setIsAiPanelOpen((open) => !open)}
              isAiOpen={isAiPanelOpen}
            />
            <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportJson} />
            <input ref={importHtmlInputRef} type="file" accept=".html,.zip" className="hidden" onChange={handleImportHtml} />
          </>
        }
        leftRail={
          <EditorLeftRail
            activeAction={
              leftDrawerCategory === "products" ||
              leftDrawerCategory === "media" ||
              leftDrawerCategory === "documents"
                ? null
                : leftDrawerCategory
            }
            isDrawerOpen={isLeftDrawerOpen}
            onAction={handleLeftRailAction}
          />
        }
        leftDrawer={
          <EditorLeftDrawer
            isOpen={isLeftDrawerOpen}
            category={leftDrawerCategory}
            onClose={() => setIsLeftDrawerOpen(false)}
            onCategoryChange={(cat) => setLeftDrawerCategory(cat)}
            elementPresetCategory={elementPaletteCategory}
            onElementPresetCategoryChange={setElementPaletteCategory}
            sections={data.sections}
            selectedId={selectedId}
            pageSettings={data.pageSettings}
            page={page}
            pages={pages}
            actionLog={actionLog}
            revisions={revisions}
            sandboxPreviewUrl={sandboxPreviewUrl}
            onSelectBlock={handleSelectBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddBlock={handleAddBlock}
            onPremiumBlocked={handlePremiumBlocked}
            onDuplicateBlock={handleDuplicateBlock}
            onSetBlockLocked={handleSetBlockLocked}
            onSetBlockHidden={handleSetBlockHidden}
            onMoveNodeZIndex={handleMoveNodeZIndex}
            onApplyTemplate={handleApplyTemplate}
            onUseAsset={handleUseAsset}
            onUpdatePageSettings={handleUpdatePageSettings}
            onSwitchPage={handleSwitchPageSafe}
            onCreatePage={onCreatePage}
            onDeletePage={onDeletePage}
            onCreateRevision={() => handleCreateRevision()}
            onRestoreRevision={handleRestoreRevision}
            formatActionLabel={formatActionLabel}
            showToast={showToast}
          />
        }
        canvas={
          activeViewMode === "code" ? (
            <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: "#f7f7f8" }}>
              <pre className="min-h-full whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-4 font-mono text-xs leading-relaxed text-gray-800 shadow-sm">
                {codeView}
              </pre>
            </div>
          ) : activeViewMode === "preview" ? (
            <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: "#f7f7f8" }}>
              <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
                <div className="min-w-0 truncate font-mono text-gray-500">{sandboxPreviewUrl}</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${data.pageSettings.sandboxStatus === "ready" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="font-bold text-gray-600">{data.pageSettings.sandboxProvider.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-start justify-center">
                <iframe
                  title="Landing page preview"
                  srcDoc={previewHtml}
                  sandbox="allow-modals allow-forms allow-same-origin allow-scripts allow-popups allow-downloads"
                  allow="geolocation; microphone; camera; midi; encrypted-media"
                  className="rounded-2xl border border-gray-200 bg-white shadow-xl"
                  style={{
                    width: DEVICE_WIDTHS[deviceMode],
                    minHeight: 720,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                  }}
                />
              </div>
            </div>
          ) : (
            <Canvas
              sections={data.sections}
              selectedId={selectedId}
              editorSelection={editorSelection}
              deviceMode={deviceMode}
              zoom={zoom}
              pageBgColor={data.pageSettings.bgColor}
              onSelectBlock={handleSelectBlock}
              onSelectSelection={handleSelectSelection}
              onDropItem={handleDropItem}
              onMoveBlock={handleMoveBlock}
              onMoveWithinParent={handleMoveWithinParent}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onUpdateBlock={handleUpdateBlock}
              onUpdateBlockSilent={handleUpdateBlockSilent}
              onUpdateNodeFrame={handleUpdateNodeFrame}
              onUpdateNodeFrameSilent={handleUpdateNodeFrameSilent}
              onUpdateResponsiveFrame={handleUpdateResponsiveFrame}
              onUpdateResponsiveFrameSilent={handleUpdateResponsiveFrameSilent}
              onAddSection={handleAddSection}
              onOpenInspector={handleOpenInspector}
              onAddElementToSection={handleAddElementToSection}
              onMoveNodeZIndex={handleMoveNodeZIndex}
              onSetBlockHidden={handleSetBlockHidden}
              onSetBlockLocked={handleSetBlockLocked}
            />
          )
        }
        inspector={
          inspectorState.open ? (
            <InspectorPanel
              selectedBlock={selectedBlock}
              inspectorMode={inspectorState.mode}
              sections={data.sections}
              pageSettings={data.pageSettings}
              onUpdateBlock={handleUpdateBlock}
              onUpdateBlockSilent={handleUpdateBlockSilent}
              onUpdatePageSettings={handleUpdatePageSettings}
              onMoveWithinParent={handleMoveWithinParent}
              deviceMode={deviceMode}
              onUpdateNodeFrame={handleUpdateNodeFrame}
              onUpdateNodeFrameSilent={handleUpdateNodeFrameSilent}
              onUpdateResponsiveFrame={handleUpdateResponsiveFrame}
              onUpdateResponsiveFrameSilent={handleUpdateResponsiveFrameSilent}
              onDuplicateBlock={handleDuplicateBlock}
              onDeleteBlock={handleDeleteBlock}
              onMoveNodeZIndex={handleMoveNodeZIndex}
              onMoveSectionUp={handleMoveUp}
              onMoveSectionDown={handleMoveDown}
              onMoveSection={handleMoveBlock}
              onSetBlockHidden={handleSetBlockHidden}
              onUpdateBlockLabel={handleUpdateBlockLabel}
              handleSendChatMessage={handleSendChatMessage}
              isAiTyping={isAiTyping}
              variant="floating"
              onClose={handleCloseInspector}
            />
          ) : (
            <button
              type="button"
              onClick={() => handleOpenInspector()}
              className="pointer-events-auto fixed right-6 top-20 z-[45] flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-lg hover:text-[#5b21b6]"
              title="Mở Inspector"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>
          )
        }
        aiPanel={
          isAiPanelOpen ? (
            <div className="pointer-events-auto absolute bottom-6 right-[400px] z-40 flex h-[min(520px,calc(100vh-120px))] w-[340px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-black text-gray-900">AI Copilot</p>
                <button type="button" onClick={() => setIsAiPanelOpen(false)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIChatPanel
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                  selectedBlock={selectedBlock}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isAiTyping={isAiTyping}
                  handleSendChatMessage={handleSendChatMessage}
                />
              </div>
            </div>
          ) : null
        }
        overlays={
          <>
            {isCommandOpen && (
              <div className="absolute inset-0 z-[9998] flex items-start justify-center bg-black/30 pt-24" onClick={() => setIsCommandOpen(false)}>
                <div className="w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Command Palette</div>
                    <div className="mt-1 text-sm font-bold text-gray-850">{pageName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-white p-3">
                    {[
                      { label: "Add Hero Section", action: () => handleAddBlock("hero") },
                      { label: "Add Form Capture", action: () => handleAddBlock("form_capture") },
                      { label: "Save Design", action: handleManualSave },
                      { label: "Create Revision Point", action: () => handleCreateRevision() },
                      { label: "Preview Mode", action: () => setActiveViewMode("preview") },
                      { label: "Code View Mode", action: () => setActiveViewMode("code") },
                      { label: "Open Sandbox Config", action: () => openLeftDrawer("sandbox") },
                      { label: "Connect Sandbox", action: () => handleUpdatePageSettings("sandboxStatus", "ready") },
                      { label: "Export JSON Design", action: handleExportJson },
                      { label: "Export HTML Bundle", action: handleExportHtml },
                      { label: "Clear Canvas Blocks", action: handleClearCanvas },
                    ].map((command) => (
                      <button
                        key={command.label}
                        type="button"
                        onClick={() => { command.action(); setIsCommandOpen(false); }}
                        className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-purple-500/50 hover:bg-purple-50 hover:text-purple-700"
                      >
                        {command.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-[10px] font-semibold text-gray-400">
                    Bấm Ctrl+K để mở nhanh
                  </div>
                </div>
              </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} />}
            <LandingUpgradeModal
              isOpen={upgradeModal.open}
              featureName={upgradeModal.feature}
              description={upgradeModal.description}
              onClose={() => setUpgradeModal({ open: false, feature: "" })}
              onUpgrade={handleUpgradeLanding}
            />
            <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 select-none rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[10px] font-semibold text-gray-500 shadow lg:block">
              Delete — xóa block · Ctrl+D — nhân đôi · Ctrl+Z — hoàn tác · Esc — đóng panel / bỏ chọn
            </div>
          </>
        }
      />
    </DndProvider>
  );
};
