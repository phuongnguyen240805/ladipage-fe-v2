"use client";

import React, { Suspense, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { LandingPageItem, LandingPageTagRef, TemplateItem, FormConfigItem, TagItem, DomainItem } from "@/components/landing-pages/dung-chung/types";
import { SubSidebar } from "@/components/landing-pages/sidebar/SubSidebar";
import { PagesList } from "@/components/landing-pages/pages/PagesList";
import { FormConfig } from "@/components/landing-pages/form-config/FormConfig";
import { TagManagement } from "@/components/landing-pages/tags/TagManagement";
import { DomainsConfig } from "@/components/landing-pages/domains/DomainsConfig";
import { DataLeads } from "@/components/landing-pages/leads/DataLeads";
import { CreatePageModal } from "@/components/landing-pages/pages/CreatePageModal";
import { createLandingPage, deleteLandingPage, deleteLandingPages, isValidPageId, listLandingPages } from "@/components/landing-pages/editor/core/editor-supabase-storage";
import { landingApiFetch } from "@/lib/landing-api-client";
import { LANDING_TEMPLATE_PRESETS, resolveTemplatePresetId, instantiateTemplateBlocks } from "@/components/landing-pages/editor/template-library";
import { migrateTemplateFlatBlocks, migrateEditorData, recalculateSectionHeights } from "@/components/landing-pages/editor/core/editor-migration";
import { createDefaultPageSettings, ensureOnlookBlockMeta, EditorBlock, EditorData } from "@/components/landing-pages/editor/types";
import { parseHtmlToImportedPageSchema, parseHtmlToPreservedHtmlSchema } from "@/features/landing-pages/import/html-to-landing-schema";
import { importZipLandingPage } from "@/features/landing-pages/import/zip-importer";
import { openLandingBuilder } from "@/features/landing-builder/sdk/open-builder";
import { resolveLandingPublicViewUrl } from "@/features/landing-domain-edge/services/free-subdomain.service";

import { CURRENT_EDITOR_SCHEMA_VERSION } from "@/components/landing-pages/editor/core/editor-migration";
import { useUpgradePlan } from "@/features/billing/upgrade-plan/useUpgradePlan";
import { useLandingAccess } from "@/features/landing-pages/hooks/useLandingAccess";
import { LandingUpgradeModal } from "@/components/landing-pages/shared/LandingUpgradeModal";
import { billingApi } from "@/lib/endpoints/billing.api";
import { supabase } from "@/lib/supabase";
import {
  incrementTemplateDownloads,
  incrementTemplateViews,
  listTemplates,
  TemplatePreviewModal,
  TemplatesLibrary,
} from "@/features/landing-templates/admin";
import { buildLandingAiCreateJobPayload } from "@/features/landing-ai/build-create-job-payload";
import { useLandingAiJobPolling } from "@/features/landing-ai/hooks/useLandingAiJobPolling";
import { landingAiApi } from "@/lib/endpoints/landing-ai.api";
import { LandingProductBindModal } from "@/features/commerce/components/LandingProductBindModal";
import { useLandingCommerceVersion } from "@/features/commerce/hooks/useLandingCommerceProfile";
import { landingCommerceBindingsStore } from "@/features/commerce/mock/landing-commerce-bindings-store";
import { ladiToast } from "@/lib/ladi-feedback";
import { usePlatformAuth } from "@/features/auth/hooks/usePlatformAuth";



type GeneratorParams = {
  businessName?: string;
  category?: string;
  cta?: string;
  file?: File;
  goal?: string;
  importMode?: "preserve" | "convert";
  industry?: string;
  keyword?: string;
  location?: string;
  offer?: string;
  source?: string;
  style?: string;
  url?: string;
  cloneMode?: string;
  campaignId?: string;
};

type LandingEditorDraft = EditorData & {
  assets?: unknown[];
  globalCss?: string;
  templateId?: string | null;
};

interface LandingPageRow {
  id: string;
  name?: string | null;
  slug?: string | null;
  editor_data?: { templateId?: string | null } | null;
  status?: string | null;
  updated_at?: string | null;
  /** From GET /api/landing-pages — free subdomain or platform absolute URL */
  public_url?: string | null;
  published_url?: string | null;
  tags?: LandingPageTagRef[];
}

interface LandingTemplateRow {
  id: string;
  template_key?: string | null;
  name?: string | null;
  thumbnail_url?: string | null;
  preview_image_url?: string | null;
  category?: string | null;
  price_type?: string | null;
  is_featured?: boolean | null;
  views_count?: number | null;
  downloads_count?: number | null;
  editor_data?: TemplateItem["editor_data"];
}

function templateStatRefs(template: Pick<TemplateItem, "id" | "template_key" | "templateId">) {
  return {
    id: template.id,
    template_key: template.template_key || template.templateId,
  };
}

function resolveTagsFromIds(tagIds: string[], allTags: TagItem[]): LandingPageTagRef[] {
  return tagIds
    .map((id) => {
      const tag = allTags.find((item) => item.id === id);
      return tag ? { id: tag.id, name: tag.name } : null;
    })
    .filter((tag): tag is LandingPageTagRef => tag !== null);
}

function formatLandingPageRow(item: LandingPageRow): LandingPageItem {
  const slug = item.slug || undefined;
  // Prefer API-computed public_url; fall back to resolve helper (Plan A / platform)
  const publishedUrl =
    item.public_url ||
    item.published_url ||
    (slug ? resolveLandingPublicViewUrl(slug) : null);
  return {
    id: item.id,
    name: item.name || "Untitled Page",
    slug,
    publishedUrl,
    templateId: item.editor_data?.templateId || undefined,
    tags: item.tags ?? [],
    status: item.status === "published" ? "PUBLISHED" : "UNPUBLISHED",
    updatedAt: item.updated_at
      ? new Date(item.updated_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        ", " +
        new Date(item.updated_at).toLocaleDateString("vi-VN")
      : "",
    views: 0,
    conversions: 0,
    revenue: 0,
  };
}

function collectLocalLandingBackups() {
  const localPages: Array<{
    key: string;
    pageId: string;
    editorData: Partial<EditorData>;
    savedAt?: string;
  }> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("landing-editor-autosave:")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const backup = JSON.parse(raw);
      const pageId = String(backup?.pageId || backup?.editorData?.pageId || key.replace("landing-editor-autosave:", ""));
      localPages.push({
        key,
        pageId,
        editorData: backup?.editorData || {},
        savedAt: backup?.savedAt,
      });
    }
  } catch (err) {
    console.warn("Failed to read local storage pages:", err);
  }

  return localPages;
}

function readLocalLandingPageItems(): LandingPageItem[] {
  const rows = collectLocalLandingBackups()
    .map((backup) => ({
      id: backup.pageId,
      name: backup.editorData?.pageName || "Untitled Page",
      status: "UNPUBLISHED" as const,
      updatedAt: backup.savedAt
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
      __savedAt: backup.savedAt ? new Date(backup.savedAt).getTime() : 0,
    }))
    .sort((a, b) => b.__savedAt - a.__savedAt);

  return rows.map(({ __savedAt: _savedAt, ...item }) => item);
}

async function syncLocalBackupsToSupabase(remoteIds: Set<string>): Promise<LandingPageItem[]> {
  if (!supabase) return [];

  const migrated: LandingPageItem[] = [];
  const localBackups = collectLocalLandingBackups();

  for (const backup of localBackups) {
    const nextId = isValidPageId(backup.pageId)
      ? backup.pageId
      : typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "";

    if (!isValidPageId(nextId) || remoteIds.has(nextId)) continue;

    const pageName = backup.editorData?.pageName || "Untitled Page";
    const editorData = {
      ...backup.editorData,
      pageId: nextId,
      pageName,
    };

    try {
      const created = await createLandingPage({
        id: nextId,
        name: pageName,
        slug: pageName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`,
        editor_data: editorData,
      });

      if (created?.id && isValidPageId(created.id)) {
        migrated.push(formatLandingPageRow(created));
        remoteIds.add(created.id);
        localStorage.removeItem(backup.key);
        console.info("[LandingPages Sync] Migrated local page to Supabase", {
          oldPageId: backup.pageId,
          newPageId: created.id,
        });
      }
    } catch (err) {
      console.warn("[LandingPages Sync] Failed to migrate local page:", err);
    }
  }

  return migrated;
}



const initialTags: TagItem[] = [];




interface LandingPagesManagementProps {
  initialSubTab?: string;
}

function LandingPagesManagement({ initialSubTab = "pages" }: LandingPagesManagementProps) {
  const queryClient = useQueryClient();
  const { platform, isAuthenticated, isLoading: isAuthLoading } = usePlatformAuth();

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [purposeFilter, setPurposeFilter] = useState("ALL");
  const [bindTarget, setBindTarget] = useState<{
    pageId: string;
    pageName: string;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const commerceVersion = useLandingCommerceVersion();

  // Scope query cache by tenant/org so cached data is never reused across accounts.
  const cacheScope = String(
    platform.tenant.organizationId ??
      platform.tenant.activeTenantId ??
      platform.tenant.tenantId ??
      "anonymous",
  );
  const localBackupsSyncedRef = useRef(false);
  const pagesQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "pages"] as const,
    [cacheScope],
  );
  const tagsQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "tags"] as const,
    [cacheScope],
  );

  // Landing Pages is a high-frequency navigation target. Keep the last successful
  // payload in the root QueryClient and serve it immediately when the user returns,
  // while React Query revalidates only after the data becomes stale.
  const pagesQuery = useQuery<LandingPageItem[]>({
    queryKey: pagesQueryKey,
    enabled: !isAuthLoading && isAuthenticated,
    queryFn: async () => {
      const data = await listLandingPages();
      const dbPages: LandingPageItem[] = data.map(formatLandingPageRow);
      let migratedPages: LandingPageItem[] = [];
      if (!localBackupsSyncedRef.current) {
        migratedPages = await syncLocalBackupsToSupabase(
          new Set(dbPages.map((page) => page.id)),
        );
        localBackupsSyncedRef.current = true;
      }
      return [...migratedPages, ...dbPages];
    },
    staleTime: 30_000,
    gcTime: 60 * 60_000,
    retry: 1,
    // Cached rows render immediately; stale data revalidates in the background.
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const tagsQuery = useQuery<TagItem[]>({
    queryKey: tagsQueryKey,
    enabled: !isAuthLoading && isAuthenticated,
    queryFn: async () => {
      const result = await landingApiFetch<{ tags: TagItem[] }>(
        "/api/landing-pages/tags",
      );
      return result.tags ?? [];
    },
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [localPages, setLocalPages] = useState<LandingPageItem[]>(() =>
    typeof window === "undefined" ? [] : readLocalLandingPageItems(),
  );
  useEffect(() => {
    if (isAuthLoading || isAuthenticated) return;
    setLocalPages(readLocalLandingPageItems());
  }, [isAuthenticated, isAuthLoading]);
  useEffect(() => {
    if (!pagesQuery.isError) return;
    console.error(
      "[LandingPages] Remote API refresh failed; keeping cached/local rows:",
      pagesQuery.error,
    );
  }, [pagesQuery.error, pagesQuery.isError]);

  // On background refetch errors React Query keeps the last successful remote
  // payload. Local backups are only a first-load/offline fallback.
  const pages = isAuthenticated ? (pagesQuery.data ?? localPages) : localPages;
  const tags = isAuthenticated ? (tagsQuery.data ?? []) : initialTags;

  const setPages = useCallback<React.Dispatch<React.SetStateAction<LandingPageItem[]>>>(
    (updater) => {
      if (!isAuthenticated) {
        setLocalPages(updater);
        return;
      }
      queryClient.setQueryData<LandingPageItem[]>(pagesQueryKey, (current = []) =>
        typeof updater === "function"
          ? (updater as (prev: LandingPageItem[]) => LandingPageItem[])(current)
          : updater,
      );
    },
    [isAuthenticated, pagesQueryKey, queryClient],
  );

  const setTags = useCallback<React.Dispatch<React.SetStateAction<TagItem[]>>>(
    (updater) => {
      queryClient.setQueryData<TagItem[]>(tagsQueryKey, (current = []) =>
        typeof updater === "function"
          ? (updater as (prev: TagItem[]) => TagItem[])(current)
          : updater,
      );
    },
    [queryClient, tagsQueryKey],
  );

  // Creating page state
  const [isCreating, setIsCreating] = useState(false);


  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateItem | null>(null);
  const [activeJob, setActiveJob] = useState<{
    id: string;
    pageId: string;
    type: "ai" | "clone" | "ppc";
    progress: number;
    statusText: string;
    pageName: string;
    tagIds: string[];
  } | null>(null);

  const landingAiJobId =
    activeJob && (activeJob.type === "ai" || activeJob.type === "clone" || activeJob.type === "ppc")
      ? activeJob.id
      : null;

  const { job: landingAiJob, events: landingAiEvents } = useLandingAiJobPolling(landingAiJobId);
  const handledAiJobIdRef = useRef<string | null>(null);

  const activeJobId = activeJob?.id ?? null;

  useEffect(() => {
    if (!activeJobId || !landingAiJob || landingAiJob.jobId !== activeJobId) return;

    const latestMessage =
      landingAiEvents.length > 0
        ? landingAiEvents[landingAiEvents.length - 1].message
        : undefined;

    setActiveJob((prev) => {
      if (!prev || prev.id !== activeJobId) return prev;
      const nextProgress = landingAiJob.progress ?? prev.progress;
      const nextStatusText = latestMessage || prev.statusText;
      if (prev.progress === nextProgress && prev.statusText === nextStatusText) {
        return prev;
      }
      return {
        ...prev,
        progress: nextProgress,
        statusText: nextStatusText,
      };
    });
  }, [activeJobId, landingAiJob, landingAiEvents]);

  useEffect(() => {
    if (!landingAiJob || !activeJob) return;

    if (landingAiJob.status === "success") {
      if (handledAiJobIdRef.current === landingAiJob.jobId) return;
      handledAiJobIdRef.current = landingAiJob.jobId;

      const pageId = landingAiJob.pageId || activeJob.pageId;
      const pageTags = resolveTagsFromIds(activeJob.tagIds, tags);
      const tagIds = [...activeJob.tagIds];
      const pageName = activeJob.pageName;

      void (async () => {
        try {
          await openLandingBuilder({ pageId, mode: "new-tab", waitForPage: true });
          const newPg: LandingPageItem = {
            id: pageId,
            name: pageName,
            tags: pageTags,
            status: "UNPUBLISHED",
            updatedAt:
              new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
              ", " +
              new Date().toLocaleDateString("vi-VN"),
            views: 0,
            conversions: 0,
            revenue: 0,
          };
          setPages((prev) => [newPg, ...prev]);
          if (tagIds.length > 0) {
            setTags((prev) =>
              prev.map((tag) =>
                tagIds.includes(tag.id) ? { ...tag, count: tag.count + 1 } : tag,
              ),
            );
          }
        } catch (err) {
          console.error("Failed to open AI landing builder:", err);
          ladiToast.error(err instanceof Error ? err.message : "Không thể mở builder sau khi tạo AI.");
        } finally {
          setActiveJob(null);
        }
      })();
      return;
    }

    if (landingAiJob.status === "failed") {
      if (handledAiJobIdRef.current === landingAiJob.jobId) return;
      handledAiJobIdRef.current = landingAiJob.jobId;
      ladiToast.error(landingAiJob.error || "Không thể tạo landing page bằng AI.");
      setActiveJob(null);
      return;
    }

    if (landingAiJob.status === "cancelled") {
      setActiveJob(null);
    }
  }, [landingAiJob, activeJob, tags]);

  const handleCancelLandingAiJob = useCallback(async () => {
    if (!activeJob) return;
    try {
      await landingAiApi.cancelJob(activeJob.id);
      setActiveJob(null);
    } catch (err) {
      console.error("Failed to cancel landing AI job:", err);
      ladiToast.error(err instanceof Error ? err.message : "Không thể hủy job.");
    }
  }, [activeJob]);

  // Templates + secondary resources are loaded lazily by tab and kept in the
  // shared QueryClient. Returning to Landing Pages no longer refetches data that
  // the user did not open, and previously visited tabs render instantly.
  const [activeTemplateTab, setActiveTemplateTab] = useState("sample");
  const [activeCategory, setActiveCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<TemplateItem | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>({});
  const viewedTemplateIdsRef = useRef<Set<string>>(new Set());
  const landingAccess = useLandingAccess();
  const { openUpgradePlan } = useUpgradePlan();
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    feature: string;
    description?: string;
  }>({ open: false, feature: "" });

  type LeadRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    landingPage: string;
    createdAt: string;
    status: string;
  };
  type ErrorLeadRow = LeadRow & { errorMessage: string };
  type LeadsPayload = { leads: LeadRow[]; errorLeads: ErrorLeadRow[] };

  const templatesQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "templates"] as const,
    [cacheScope],
  );
  const domainsQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "domains"] as const,
    [cacheScope],
  );
  const formsQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "form-configs"] as const,
    [cacheScope],
  );
  const leadsQueryKey = useMemo(
    () => ["landing-pages", cacheScope, "leads"] as const,
    [cacheScope],
  );

  const templatesQuery = useQuery<TemplateItem[]>({
    queryKey: templatesQueryKey,
    enabled: activeSubTab === "templates",
    queryFn: async () => {
      const data = await listTemplates();
      return (data as LandingTemplateRow[]).map((t) => ({
        id: t.id,
        templateId: t.template_key || undefined,
        template_key: t.template_key || undefined,
        name: t.name || "Untitled Template",
        image: t.thumbnail_url || t.preview_image_url || "/images/grid-image/image-01.png",
        category:
          t.category === "ecommerce" || t.category === "Bán hàng"
            ? "ecommerce"
            : t.category === "service" || t.category === "Dịch vụ"
              ? "service"
              : "others",
        isPro: t.price_type === "pro",
        is_featured: t.is_featured === true,
        views: t.views_count || 0,
        downloads: t.downloads_count || 0,
        scrollDist: "calc(-100% + 260px)",
        editor_data: t.editor_data,
      }));
    },
    staleTime: 15 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const domainsQuery = useQuery<DomainItem[]>({
    queryKey: domainsQueryKey,
    enabled: !isAuthLoading && isAuthenticated && activeSubTab === "domains",
    queryFn: async () => {
      const result = await landingApiFetch<{ domains: DomainItem[] }>(
        "/api/landing-pages/domains",
      );
      return result.domains ?? [];
    },
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const formsQuery = useQuery<FormConfigItem[]>({
    queryKey: formsQueryKey,
    enabled: !isAuthLoading && isAuthenticated && activeSubTab === "forms",
    queryFn: async () => {
      const result = await landingApiFetch<{ configs: FormConfigItem[] }>(
        "/api/landing-pages/form-configs",
      );
      return result.configs ?? [];
    },
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const leadsQuery = useQuery<LeadsPayload>({
    queryKey: leadsQueryKey,
    enabled: !isAuthLoading && isAuthenticated && activeSubTab === "leads",
    queryFn: () =>
      landingApiFetch<LeadsPayload>("/api/landing-pages/leads"),
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const templates = templatesQuery.data ?? [];
  const domains = domainsQuery.data ?? [];
  const formConfigs = formsQuery.data ?? [];
  const leads = leadsQuery.data?.leads ?? [];
  const errorLeads = leadsQuery.data?.errorLeads ?? [];
  const isTemplatesLoading = templatesQuery.isPending && activeSubTab === "templates";
  const templatesError = templatesQuery.error
    ? templatesQuery.error instanceof Error
      ? templatesQuery.error.message
      : "Không thể tải kho giao diện"
    : null;

  const setTemplates = useCallback<React.Dispatch<React.SetStateAction<TemplateItem[]>>>(
    (updater) => {
      queryClient.setQueryData<TemplateItem[]>(templatesQueryKey, (current = []) =>
        typeof updater === "function"
          ? (updater as (prev: TemplateItem[]) => TemplateItem[])(current)
          : updater,
      );
    },
    [queryClient, templatesQueryKey],
  );

  const setDomains = useCallback<React.Dispatch<React.SetStateAction<DomainItem[]>>>(
    (updater) => {
      queryClient.setQueryData<DomainItem[]>(domainsQueryKey, (current = []) =>
        typeof updater === "function"
          ? (updater as (prev: DomainItem[]) => DomainItem[])(current)
          : updater,
      );
    },
    [domainsQueryKey, queryClient],
  );

  const setFormConfigs = useCallback<React.Dispatch<React.SetStateAction<FormConfigItem[]>>>(
    (updater) => {
      queryClient.setQueryData<FormConfigItem[]>(formsQueryKey, (current = []) =>
        typeof updater === "function"
          ? (updater as (prev: FormConfigItem[]) => FormConfigItem[])(current)
          : updater,
      );
    },
    [formsQueryKey, queryClient],
  );

  const openUpgradeModal = useCallback((feature: string, description?: string) => {
    setUpgradeModal({ open: true, feature, description });
  }, []);

  const handleUpgradeLanding = useCallback(async () => {
    try {
      const response = await billingApi.subscribe({ plan: "pro" });
      const checkoutUrl = (response as { session?: { url?: string } }).session?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      ladiToast.success(
        response.session?.id
          ? `Đã tạo phiên nâng cấp ${response.session.id}.`
          : "Đã gửi yêu cầu nâng cấp gói."
      );
    } catch (error) {
      ladiToast.error(error instanceof Error ? error.message : "Không thể tạo phiên nâng cấp.");
    }
  }, []);

  const handlePreviewTemplate = useCallback((template: TemplateItem) => {
    setSelectedTemplateForPreview(template);
    if (!viewedTemplateIdsRef.current.has(template.id)) {
      viewedTemplateIdsRef.current.add(template.id);
      void incrementTemplateViews(templateStatRefs(template)).then((result) => {
        setTemplates((prev) =>
          prev.map((item) => {
            if (item.id !== template.id) return item;
            const views =
              result && "views_count" in result && typeof result.views_count === "number"
                ? result.views_count
                : item.views + 1;
            const persistedId =
              result && "template_id" in result && typeof result.template_id === "string"
                ? result.template_id
                : item.id;
            return { ...item, id: persistedId, views };
          })
        );
      });
    }
  }, [setTemplates]);

  // Handler for select-all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPages.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handler for single checkbox
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Main Generator Handler
  const handleGeneratePage = useCallback(async (payload: {
    type: "blank" | "ai" | "clone" | "import" | "ppc";
    name: string;
    tagIds: string[];
    params: GeneratorParams;
  }) => {
    const { type, name, tagIds, params } = payload;

    setIsCreateModalOpen(false);

    const preOpenedTab = (type === "blank" || type === "import") && typeof window !== "undefined"
      ? window.open("about:blank", "_blank")
      : null;

    if (type === "blank") {
      setIsCreating(true);
      try {
        const pageId = crypto.randomUUID();
        let initialEditorData: LandingEditorDraft = {
          pageId,
          pageName: name,
          sections: [],
          pageSettings: createDefaultPageSettings(name),
          schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
          templateId: pendingTemplate?.templateId ?? null,
        };

        if (pendingTemplate) {
          try {
            if (pendingTemplate.editor_data) {
              const cloned = JSON.parse(JSON.stringify(pendingTemplate.editor_data));
              cloned.pageId = pageId;
              cloned.pageName = name;
              const migrated = migrateEditorData(cloned, pageId);
              migrated.sections = recalculateSectionHeights(migrated.sections);
              initialEditorData = migrated;
            } else {
              const presetId = resolveTemplatePresetId({ name: pendingTemplate.name, id: pendingTemplate.id, templateId: pendingTemplate.templateId });
              const flatBlocks = instantiateTemplateBlocks(presetId).map(ensureOnlookBlockMeta);
              const sections = migrateTemplateFlatBlocks(flatBlocks);
              const migrated = migrateEditorData({
                pageId,
                pageName: name,
                sections,
                pageSettings: createDefaultPageSettings(name),
                schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
              }, pageId);
              migrated.sections = recalculateSectionHeights(migrated.sections);
              initialEditorData = migrated;
            }
          } catch (err) {
            console.warn("Template apply failed, starting blank:", err);
          }
        }

        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`;
        const created = await createLandingPage({
          id: pageId,
          name,
          slug,
          editor_data: initialEditorData,
          tag_ids: tagIds,
        });

        if (pendingTemplate?.id) {
          const downloadResult = await incrementTemplateDownloads(templateStatRefs(pendingTemplate));
          setTemplates((prev) =>
            prev.map((item) => {
              if (item.id !== pendingTemplate.id) return item;
              const downloads =
                downloadResult &&
                "downloads_count" in downloadResult &&
                typeof downloadResult.downloads_count === "number"
                  ? downloadResult.downloads_count
                  : item.downloads + 1;
              const persistedId =
                downloadResult &&
                "template_id" in downloadResult &&
                typeof downloadResult.template_id === "string"
                  ? downloadResult.template_id
                  : item.id;
              return { ...item, id: persistedId, downloads };
            })
          );
        }

        if (created?.id) {
          const pageTags: LandingPageTagRef[] =
            Array.isArray(created.tags) && created.tags.length > 0
              ? created.tags
              : resolveTagsFromIds(tagIds, tags);
          const newPg: LandingPageItem = {
            id: created.id,
            name: created.name,
            slug: created.slug || slug,
            templateId: pendingTemplate?.templateId || undefined,
            tags: pageTags,
            status: "UNPUBLISHED",
            updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
            views: 0,
            conversions: 0,
            revenue: 0,
          };
          setPages((prev) => [newPg, ...prev]);
          if (tagIds.length > 0) {
            setTags((prev) =>
              prev.map((tag) =>
                tagIds.includes(tag.id) ? { ...tag, count: tag.count + 1 } : tag,
              ),
            );
          }
          setPendingTemplate(null);
          void openLandingBuilder({ pageId: created.id, mode: "new-tab", waitForPage: false, targetWindow: preOpenedTab });
        }
      } catch (err) {
        if (preOpenedTab && !preOpenedTab.closed) {
          preOpenedTab.close();
        }
        console.error("Failed to create landing page:", err);
        ladiToast.error(`Không thể tạo landing page trống: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsCreating(false);
      }
      return;
    }

    if (type === "import") {
      setIsCreating(true);
      try {
        const pageId = crypto.randomUUID();
        let parsedSections: EditorBlock[] = [];
        let parsedGlobalCss = "";
        let parsedAssets: unknown[] = [];

        if (!params.file) {
          throw new Error("Vui lòng chọn file ZIP hoặc HTML để nhập khẩu.");
        }

        const ext = params.file.name.split(".").pop()?.toLowerCase();
        const mode = params.importMode || "preserve";

        if (ext === "zip") {
          const imported = await importZipLandingPage(params.file, pageId, undefined, mode);
          parsedSections = imported.sections;
          parsedGlobalCss = imported.globalCss;
          parsedAssets = imported.assets || [];
        } else {
          const htmlCode = await params.file.text();
          const imported = mode === "preserve"
            ? parseHtmlToPreservedHtmlSchema(htmlCode)
            : parseHtmlToImportedPageSchema(htmlCode);
          parsedSections = imported.sections;
          parsedGlobalCss = imported.globalCss;
          parsedAssets = imported.assets || [];
        }

        if (parsedSections.length === 0) {
          throw new Error(
            "Không thể phân tích file nhập khẩu. Kiểm tra lại file ZIP/HTML và thử lại.",
          );
        }

        const initialEditorData: LandingEditorDraft = {
          pageId,
          pageName: name,
          sections: parsedSections,
          assets: parsedAssets,
          pageSettings: {
            ...createDefaultPageSettings(name),
            globalCss: parsedGlobalCss,
          },
          schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
        };

        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`;
        const created = await createLandingPage({
          id: pageId,
          name,
          slug,
          editor_data: initialEditorData,
          tag_ids: tagIds,
        });

        if (created?.id) {
          const pageTags: LandingPageTagRef[] =
            Array.isArray(created.tags) && created.tags.length > 0
              ? created.tags
              : resolveTagsFromIds(tagIds, tags);
          const newPg: LandingPageItem = {
            id: created.id,
            name: created.name,
            slug: created.slug || slug,
            tags: pageTags,
            status: "UNPUBLISHED",
            updatedAt:
              new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
              ", " +
              new Date().toLocaleDateString("vi-VN"),
            views: 0,
            conversions: 0,
            revenue: 0,
          };
          setPages((prev) => [newPg, ...prev]);
          if (tagIds.length > 0) {
            setTags((prev) =>
              prev.map((tag) =>
                tagIds.includes(tag.id) ? { ...tag, count: tag.count + 1 } : tag,
              ),
            );
          }
          void openLandingBuilder({ pageId: created.id, mode: "new-tab", waitForPage: false, targetWindow: preOpenedTab });
        }
      } catch (err) {
        if (preOpenedTab && !preOpenedTab.closed) {
          preOpenedTab.close();
        }
        console.error("Failed to import landing page:", err);
        ladiToast.error(`Không thể import landing page: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsCreating(false);
      }
      return;
    }

    if (type === "ai" || type === "clone" || type === "ppc") {
      if (!landingAccess.canCreateAiPage) {
        openUpgradeModal(
          "Tạo landing page bằng AI",
          `Bạn đã dùng hết ${landingAccess.aiGenerationsLimit} lần tạo AI (${landingAccess.aiGenerationsUsed}/${landingAccess.aiGenerationsLimit}).`
        );
        return;
      }

      handledAiJobIdRef.current = null;
      try {
        const jobPayload = buildLandingAiCreateJobPayload({ type, name, tagIds, params });
        const created = await landingAiApi.createJob(jobPayload);
        void landingAccess.refetchAiQuota();
        setActiveJob({
          id: created.jobId,
          pageId: created.pageId,
          type,
          progress: 0,
          statusText: "Đang khởi tạo job AI...",
          pageName: name,
          tagIds,
        });
      } catch (err) {
        console.error("Failed to create landing AI job:", err);
        ladiToast.error(`Không thể khởi tạo AI job: ${err instanceof Error ? err.message : String(err)}`);
      }
      return;
    }
  }, [
    landingAccess.aiGenerationsLimit,
    landingAccess.aiGenerationsUsed,
    landingAccess.canCreateAiPage,
    landingAccess.refetchAiQuota,
    openUpgradeModal,
    pendingTemplate,
    tags,
  ]);

  // Create page from template
  const handleUseTemplate = (template: TemplateItem) => {
    if (!landingAccess.canApplyTemplate(template)) {
      openUpgradeModal(
        "Template PRO",
        "Template PRO yêu cầu gói Pro trở lên. Nâng cấp để sử dụng mẫu này."
      );
      return;
    }
    setPendingTemplate(template);
    setIsCreateModalOpen(true);
  };


  // Handler for editing a page — navigate to the editor route
  const handleEditPage = useCallback(async (page: LandingPageItem) => {
    try {
      await openLandingBuilder({ pageId: page.id, mode: "new-tab", waitForPage: true });
    } catch (err) {
      console.error("Failed to open builder:", err);
      ladiToast.error(err instanceof Error ? err.message : "Không thể mở builder.");
    }
  }, []);


  // Handler for deleting a page
  const handleDeletePage = useCallback(async (page: LandingPageItem) => {
    try {
      await deleteLandingPage(page.id);
      const removedTagIds = (page.tags ?? []).map((tag) => tag.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      setSelectedIds((prev) => prev.filter((id) => id !== page.id));
      if (removedTagIds.length > 0) {
        const removedSet = new Set(removedTagIds);
        setTags((prev) =>
          prev.map((tag) =>
            removedSet.has(tag.id) ? { ...tag, count: Math.max(0, tag.count - 1) } : tag,
          ),
        );
      }
      ladiToast.success(`Đã xóa landing page "${page.name}"`);
    } catch (err) {
      console.error("Failed to delete page:", err);
      ladiToast.error("Không thể xóa landing page. Vui lòng thử lại.");
    }
  }, []);

  // Handler for deleting multiple selected pages
  const handleDeleteSelectedPages = useCallback(async (ids: string[]) => {
    try {
      await deleteLandingPages(ids);
      setPages((prev) => {
        const removedPages = prev.filter((p) => ids.includes(p.id));
        const removedTagCounts = new Map<string, number>();
        for (const page of removedPages) {
          for (const tag of page.tags ?? []) {
            removedTagCounts.set(tag.id, (removedTagCounts.get(tag.id) ?? 0) + 1);
          }
        }
        if (removedTagCounts.size > 0) {
          setTags((tagPrev) =>
            tagPrev.map((tag) => {
              const dec = removedTagCounts.get(tag.id);
              return dec ? { ...tag, count: Math.max(0, tag.count - dec) } : tag;
            }),
          );
        }
        return prev.filter((p) => !ids.includes(p.id));
      });
      setSelectedIds([]);
      ladiToast.success(`Đã xóa ${ids.length} landing page`);
    } catch (err) {
      console.error("Failed to delete selected pages:", err);
      ladiToast.error("Không thể xóa các landing page đã chọn. Vui lòng thử lại.");
    }
  }, []);


  // Handler when published from editor
  const handlePublishFromEditor = (updatedPage: LandingPageItem) => {
    setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
  };

  // Like action toggle
  const toggleLikeTemplate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedTemplates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Add a new Form configuration
  const handleAddFormConfig = async (name: string, type: "Google Forms" | "API" | "OTP") => {
    try {
      const result = await landingApiFetch<{ config: FormConfigItem }>("/api/landing-pages/form-configs", {
        method: "POST",
        body: JSON.stringify({ name, type }),
      });
      if (result.config) setFormConfigs((prev) => [result.config, ...prev]);
    } catch (err) {
      console.error("Failed to create form config:", err);
      ladiToast.error("Không thể tạo cấu hình form. Vui lòng thử lại.");
    }
  };

  const handleAddTag = async (name: string) => {
    const result = await landingApiFetch<{ tag: TagItem }>("/api/landing-pages/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (result.tag) setTags((prev) => [result.tag, ...prev]);
  };

  const handleUpdateTag = async (id: string, name: string) => {
    const result = await landingApiFetch<{ tag: TagItem }>("/api/landing-pages/tags", {
      method: "PATCH",
      body: JSON.stringify({ id, name }),
    });
    if (result.tag) {
      setTags((prev) => prev.map((tag) => (tag.id === id ? result.tag : tag)));
    }
  };

  const handleDeleteTag = async (id: string) => {
    await landingApiFetch<{ deleted: string[] }>("/api/landing-pages/tags", {
      method: "DELETE",
      body: JSON.stringify({ ids: [id] }),
    });
    setTags((prev) => prev.filter((tag) => tag.id !== id));
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        tags: (page.tags ?? []).filter((tag) => tag.id !== id),
      })),
    );
    if (selectedTagId === id) setSelectedTagId(null);
  };

  const handleDeleteTags = async (ids: string[]) => {
    await landingApiFetch<{ deleted: string[] }>("/api/landing-pages/tags", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
    const idSet = new Set(ids);
    setTags((prev) => prev.filter((tag) => !idSet.has(tag.id)));
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        tags: (page.tags ?? []).filter((tag) => !idSet.has(tag.id)),
      })),
    );
    if (selectedTagId && idSet.has(selectedTagId)) setSelectedTagId(null);
  };

  const handleToggleTagStatus = async (id: string, status: TagItem["status"]) => {
    const result = await landingApiFetch<{ tag: TagItem }>("/api/landing-pages/tags", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    if (result.tag) {
      setTags((prev) => prev.map((tag) => (tag.id === id ? result.tag : tag)));
    }
  };

  const handleAddDomain = async (name: string, platform: string) => {
    if (!landingAccess.canCreateDomain) {
      openUpgradePlan();
      return;
    }

    try {
      const result = await landingApiFetch<{ domain: DomainItem }>("/api/landing-pages/domains", {
        method: "POST",
        body: JSON.stringify({ name, platform }),
      });
      if (result.domain) setDomains((prev) => [result.domain, ...prev]);
    } catch (err) {
      console.error("Failed to create domain:", err);
      const message =
        err instanceof Error ? err.message : "Không thể tạo tên miền. Vui lòng thử lại.";
      // Re-throw so DomainsConfig modal can show the API error (quota / validation).
      throw new Error(message);
    }
  };

  // Derived lists can be expensive with many rows. Recompute only when their
  // actual inputs change (commerceVersion invalidates commerce-purpose badges).
  const filteredPages = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return pages.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "PUBLISHED" && p.status === "PUBLISHED")
        || (statusFilter === "UNPUBLISHED" && p.status === "UNPUBLISHED");
      const matchesTag =
        !selectedTagId || (p.tags ?? []).some((tag) => tag.id === selectedTagId);
      const profile = landingCommerceBindingsStore.getProfile(p.id, p.name);
      const matchesPurpose =
        purposeFilter === "ALL" ||
        (purposeFilter === "HAS_PRODUCT" && profile.bindings.length > 0) ||
        (purposeFilter !== "HAS_PRODUCT" && profile.purpose === purposeFilter);
      return matchesSearch && matchesStatus && matchesTag && matchesPurpose;
    });
  }, [commerceVersion, pages, purposeFilter, searchQuery, selectedTagId, statusFilter]);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = templateSearchQuery.toLowerCase();
    return templates.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const matchesTab = activeTemplateTab === "featured" ? t.is_featured === true : true;
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [activeCategory, activeTemplateTab, templateSearchQuery, templates]);

  const renderLandingPaywall = (featureName: string) => (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs font-black uppercase tracking-wider text-lime-500 dark:text-lime-300">
        Yêu cầu gói Pro
      </div>
      <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
        {featureName}
      </h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        Tính năng này cần quyền landing tương ứng và gói Pro trở lên.
      </p>
      <button
        type="button"
        onClick={handleUpgradeLanding}
        className="mt-5 rounded-xl bg-lime-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-lime-600"
      >
        Nâng cấp ngay
      </button>
    </div>
  );

  return (
    <>

      <div className="flex flex-col lg:flex-row gap-6 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 1. Secondary Sub-sidebar */}
      <SubSidebar 
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        tagSearchQuery={tagSearchQuery}
        setTagSearchQuery={setTagSearchQuery}
        tags={tags}
        selectedTagId={selectedTagId}
        onSelectTag={setSelectedTagId}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {activeSubTab === "templates" ? (
          <TemplatesLibrary 
            activeTemplateTab={activeTemplateTab}
            setActiveTemplateTab={setActiveTemplateTab}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            templateSearchQuery={templateSearchQuery}
            setTemplateSearchQuery={setTemplateSearchQuery}
            filteredTemplates={filteredTemplates}
            likedTemplates={likedTemplates}
            toggleLikeTemplate={toggleLikeTemplate}
            setSelectedTemplateForPreview={handlePreviewTemplate}
            handleUseTemplate={handleUseTemplate}
            canApplyTemplate={landingAccess.canApplyTemplate}
            isLoading={isTemplatesLoading}
            error={templatesError}
          />
        ) : activeSubTab === "forms" ? (
          <FormConfig 
            configs={formConfigs}
            onAddConfig={handleAddFormConfig}
          />
        ) : activeSubTab === "tags" ? (
          <TagManagement 
            tags={tags}
            onAddTag={handleAddTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
            onDeleteTags={handleDeleteTags}
            onToggleTagStatus={handleToggleTagStatus}
          />
        ) : activeSubTab === "domains" ? (
          landingAccess.canAccessDomains ? (
            <DomainsConfig
              domains={domains}
              domainsUsed={landingAccess.domainsUsed}
              domainsLimit={landingAccess.domainsLimit}
              subscriptionTier={landingAccess.subscriptionTier}
              canCreateDomain={landingAccess.canCreateDomain}
              onAddDomain={handleAddDomain}
              onUpgradePlan={openUpgradePlan}
            />
          ) : renderLandingPaywall("Tên miền riêng")
        ) : activeSubTab === "leads" ? (
          landingAccess.canAccessLeads
            ? <DataLeads leads={leads} errorLeads={errorLeads} />
            : renderLandingPaywall("Data Leads")
        ) : (
          <PagesList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            purposeFilter={purposeFilter}
            setPurposeFilter={setPurposeFilter}
            filteredPages={filteredPages}
            isLoading={isAuthenticated && pagesQuery.isPending}
            selectedIds={selectedIds}
            handleSelectAll={handleSelectAll}
            handleSelectRow={handleSelectRow}
            setIsCreateModalOpen={(open) => {
              if (open) setPendingTemplate(null);
              setIsCreateModalOpen(open);
            }}
            onEdit={handleEditPage}
            onDelete={handleDeletePage}
            onDeleteSelected={handleDeleteSelectedPages}
            onBindCommerce={(page) =>
              setBindTarget({ pageId: page.id, pageName: page.name })
            }
          />
        )}
      </div>

      <LandingProductBindModal
        isOpen={!!bindTarget}
        target={bindTarget}
        onClose={() => setBindTarget(null)}
      />

      {/* 3. Modal for creating a new Landing Page */}
      <CreatePageModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setPendingTemplate(null);
          setIsCreateModalOpen(false);
        }}
        isLoading={isCreating}
        tags={tags}
        onGenerate={handleGeneratePage}
      />

      {/* Background Simulation Progress Overlay */}
      {activeJob && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 text-center space-y-5 animate-scale-up">
            <div className="h-16 w-16 mx-auto relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-600 animate-spin"></div>
              <div className="h-11 w-11 bg-purple-100 dark:bg-purple-950/40 rounded-full flex items-center justify-center text-purple-600 font-extrabold text-sm">
                AI
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {activeJob.type === "ai"
                  ? "AI đang thiết kế Landing Page"
                  : activeJob.type === "clone"
                    ? "Đang Clone giao diện Website"
                    : "Đang tạo trang PPC Campaign"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] px-4 leading-relaxed font-semibold">
                {activeJob.statusText}
              </p>
            </div>

            <div className="space-y-1.5 px-4">
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${activeJob.progress}%` }}
                ></div>
              </div>
              <span className="text-xs font-extrabold text-purple-600">{activeJob.progress}%</span>
            </div>

            <button
              type="button"
              onClick={() => void handleCancelLandingAiJob()}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Hủy tiến trình
            </button>
          </div>
        </div>
      )}


      {/* 4. Modal for template preview */}
      <TemplatePreviewModal 
        template={selectedTemplateForPreview}
        onClose={() => setSelectedTemplateForPreview(null)}
        canApplyTemplate={landingAccess.canApplyTemplate}
        onUseTemplate={(temp) => {
          setSelectedTemplateForPreview(null);
          handleUseTemplate(temp);
        }}
      />

      <LandingUpgradeModal
        isOpen={upgradeModal.open}
        featureName={upgradeModal.feature}
        description={upgradeModal.description}
        onClose={() => setUpgradeModal({ open: false, feature: "" })}
        onUpgrade={handleUpgradeLanding}
      />
    </div>
  </>
  );
}

function LandingPagesPageContent() {
  const searchParams = useSearchParams();
  return <LandingPagesManagement initialSubTab={searchParams.get("tab") ?? "pages"} />;
}

export default function LandingPagesPage() {
  return (
    <Suspense fallback={null}>
      <LandingPagesPageContent />
    </Suspense>
  );
}
