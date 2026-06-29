"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VisualEditor } from "@/components/landing-pages/editor/VisualEditor";
import { LandingPageItem } from "@/components/landing-pages/dung-chung/types";
import { supabase } from "@/lib/supabase";
import { getLocalBackupKey, isValidPageId, createLandingPage, deleteLandingPage } from "./core/editor-supabase-storage";

interface Props {
  pageId: string;
}

/**
 * Thin client wrapper that:
 * 1. Loads page metadata (name, status) by pageId from Supabase (or generates a local stub)
 * 2. Loads page summaries for all user pages (without editor_data payload)
 * 3. Renders <VisualEditor page={...} pages={...} /> which owns all editor/autosave/persist logic
 * 4. "Close" → navigate back to /landing-pages
 */
export function LandingEditorPageClient({ pageId }: Props) {
  const router = useRouter();
  const [page, setPage] = useState<LandingPageItem | null>(null);
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to signin check disabled for development bypass


  useEffect(() => {
    async function loadPageMeta() {
      try {
        if (!isValidPageId(pageId)) {
          router.replace("/landing-pages");
          return;
        }

        let currentLoadedPage: LandingPageItem | null = null;
        let dbPages: LandingPageItem[] = [];

        // Try Supabase first
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from("landing_pages")
            .select("id, name, status, updated_at, editor_data")
            .eq("id", pageId)
            .maybeSingle();

          if (!dbError && data) {
            currentLoadedPage = {
              id: data.id,
              name: data.name || "Untitled Page",
              templateId: data.editor_data?.templateId || undefined,
              status: data.status === "published" ? "PUBLISHED" : "UNPUBLISHED",
              updatedAt: data.updated_at
                ? new Date(data.updated_at).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) +
                  ", " +
                  new Date(data.updated_at).toLocaleDateString("vi-VN")
                : "",
              views: 0,
              conversions: 0,
              revenue: 0,
            };
          }

          // Fetch summaries for all landing pages - select only summaries, no full editor_data
          const { data: listData, error: listError } = await supabase
            .from("landing_pages")
            .select("id, name, status, updated_at")
            .order("updated_at", { ascending: false });

          if (!listError && listData) {
            dbPages = listData.map((d: any) => ({
              id: d.id,
              name: d.name || "Untitled Page",
              status: d.status === "published" ? "PUBLISHED" : "UNPUBLISHED",
              updatedAt: d.updated_at
                ? new Date(d.updated_at).toLocaleString("vi-VN")
                : "",
              views: 0,
              conversions: 0,
              revenue: 0,
            }));
          }

          if (dbError) {
            console.warn("Supabase page meta load failed, trying local backup only:", dbError);
          }
        }

        if (currentLoadedPage) {
          setPage(currentLoadedPage);
          setPages(dbPages);
          setLoading(false);
          return;
        }

        // Fallback: check localStorage for this pageId
        const localKey = getLocalBackupKey(pageId);
        const raw = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
        if (raw) {
          const backup = JSON.parse(raw);
          setPage({
            id: pageId,
            name: backup?.editorData?.pageName || "Untitled Page",
            templateId: backup?.editorData?.templateId || undefined,
            status: "UNPUBLISHED",
            updatedAt: backup?.savedAt
              ? new Date(backup.savedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) +
                ", " +
                new Date(backup.savedAt).toLocaleDateString("vi-VN")
              : "",
            views: 0,
            conversions: 0,
            revenue: 0,
          });

          // Fetch local page summaries
          const keys = Object.keys(localStorage).filter(k => k.startsWith("landing-editor-autosave:"));
          const localPages: LandingPageItem[] = keys.map(k => {
            try {
              const itemRaw = localStorage.getItem(k);
              if (itemRaw) {
                const itemBackup = JSON.parse(itemRaw);
                return {
                  id: itemBackup.pageId,
                  name: itemBackup.editorData?.pageName || "Untitled Page",
                  status: "UNPUBLISHED",
                  updatedAt: itemBackup.savedAt ? new Date(itemBackup.savedAt).toLocaleString("vi-VN") : "",
                  views: 0,
                  conversions: 0,
                  revenue: 0,
                };
              }
            } catch {}
            return null;
          }).filter(Boolean) as LandingPageItem[];
          setPages(localPages);
          setLoading(false);
          return;
        }

        setError(`Không tìm thấy landing page với ID: ${pageId}`);
      } catch (err) {
        console.error("Failed to load page meta:", err);
        setError("Không thể tải thông tin trang. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    void loadPageMeta();
  }, [pageId, router]);

  const handleClose = useCallback(() => {
    router.push("/landing-pages");
  }, [router]);

  const handlePublish = useCallback((updatedPage: LandingPageItem) => {
    // Update page name in local page meta if it changed
    setPage((prev) => (prev ? { ...prev, ...updatedPage } : updatedPage));
  }, []);

  const handleSwitchPage = useCallback(
    (newPage: LandingPageItem) => {
      // Navigate to the new page's editor route instead of in-memory switch
      router.push(`/landing-pages/editor/${newPage.id}`);
    },
    [router]
  );

  const handleCreatePage = useCallback(
    async (name: string) => {
      try {
        setLoading(true);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page-" + Date.now();
        const created = await createLandingPage({ name, slug });
        if (created) {
          router.push(`/landing-pages/editor/${created.id}`);
        }
      } catch (err) {
        console.error("Failed to create landing page:", err);
        alert("Không thể tạo trang mới.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleDeletePage = useCallback(
    async (id: string) => {
      try {
        await deleteLandingPage(id);
        setPages((prev) => prev.filter((p) => p.id !== id));
        if (id === pageId) {
          router.push("/landing-pages");
        }
      } catch (err) {
        console.error("Failed to delete landing page:", err);
        alert("Không thể xóa trang.");
      }
    },
    [pageId, router]
  );

  // ── Loading State ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-sm font-semibold text-gray-300">Đang tải editor…</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-900">
        <div className="max-w-sm rounded-xl bg-gray-800 p-8 text-center shadow-2xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-lg font-bold text-white">Không tìm thấy trang</h2>
          <p className="mb-6 text-sm text-gray-400">{error || `Không tìm thấy landing page với ID: ${pageId}`}</p>
          <button
            onClick={() => router.push("/landing-pages")}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <VisualEditor
      key={page.id}
      page={page}
      pages={pages}
      onClose={handleClose}
      onPublish={handlePublish}
      onSwitchPage={handleSwitchPage}
      onCreatePage={handleCreatePage}
      onDeletePage={handleDeletePage}
    />
  );
}
