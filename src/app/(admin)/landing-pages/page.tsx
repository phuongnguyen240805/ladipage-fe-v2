"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPageItem, TemplateItem, FormConfigItem, TagItem, DomainItem } from "@/components/landing-pages/dung-chung/types";
import { SubSidebar } from "@/components/landing-pages/sidebar/SubSidebar";
import { PagesList } from "@/components/landing-pages/pages/PagesList";
import { FormConfig } from "@/components/landing-pages/form-config/FormConfig";
import { TagManagement } from "@/components/landing-pages/tags/TagManagement";
import { DomainsConfig } from "@/components/landing-pages/domains/DomainsConfig";
import { DataLeads } from "@/components/landing-pages/leads/DataLeads";
import { CreatePageModal } from "@/components/landing-pages/pages/CreatePageModal";
import { createLandingPage, deleteLandingPage, deleteLandingPages, isValidPageId } from "@/components/landing-pages/editor/core/editor-supabase-storage";
import { LANDING_TEMPLATE_PRESETS, resolveTemplatePresetId, instantiateTemplateBlocks } from "@/components/landing-pages/editor/template-library";
import { migrateTemplateFlatBlocks, migrateEditorData, recalculateSectionHeights } from "@/components/landing-pages/editor/core/editor-migration";
import { createDefaultPageSettings, ensureOnlookBlockMeta, EditorBlock, EditorData } from "@/components/landing-pages/editor/types";
import { parseHtmlToImportedPageSchema, parseHtmlToPreservedHtmlSchema } from "@/features/landing-pages/import/html-to-landing-schema";
import { importZipLandingPage } from "@/features/landing-pages/import/zip-importer";
import { openLandingBuilder } from "@/features/landing-builder/sdk/open-builder";
import { CURRENT_EDITOR_SCHEMA_VERSION } from "@/components/landing-pages/editor/core/editor-migration";
import { supabase } from "@/lib/supabase";
import {
  incrementTemplateDownloads,
  listTemplates,
  TemplatePreviewModal,
  TemplatesLibrary,
} from "@/features/landing-templates/admin";



const initialPages: LandingPageItem[] = [];

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
};

type LandingEditorDraft = EditorData & {
  assets?: unknown[];
  globalCss?: string;
  templateId?: string | null;
};

interface LandingPageRow {
  id: string;
  name?: string | null;
  editor_data?: { templateId?: string | null } | null;
  status?: string | null;
  updated_at?: string | null;
}

interface LandingTemplateRow {
  id: string;
  template_key?: string | null;
  name?: string | null;
  thumbnail_url?: string | null;
  preview_image_url?: string | null;
  category?: string | null;
  price_type?: string | null;
  views_count?: number | null;
  downloads_count?: number | null;
  editor_data?: TemplateItem["editor_data"];
}

function formatLandingPageRow(item: LandingPageRow): LandingPageItem {
  return {
    id: item.id,
    name: item.name || "Untitled Page",
    templateId: item.editor_data?.templateId || undefined,
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



const initialTags: TagItem[] = [
  {
    id: "1",
    name: "oke",
    count: 0,
    createdAt: "17:20, 13/06/2026",
    status: "UNLOCKED",
    updatedAt: "17:20, 13/06/2026",
  },
];




interface LandingPagesManagementProps {
  initialSubTab?: string;
}

export function LandingPagesManagement({ initialSubTab = "pages" }: LandingPagesManagementProps) {
  const router = useRouter();
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Redirect check disabled for development bypass



  // Dynamic pages loading effect
  useEffect(() => {
    async function loadPages() {
      // 1. Try Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("landing_pages")
            .select("id, name, status, updated_at, editor_data")
            .order("updated_at", { ascending: false });

          if (!error && data) {
            const dbPages: LandingPageItem[] = data.map(formatLandingPageRow);
            const migratedPages = await syncLocalBackupsToSupabase(new Set(dbPages.map((page) => page.id)));
            setPages([...migratedPages, ...dbPages]);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch pages failed, falling back to local storage:", err);
        }
      }

      // 2. Local storage fallback: scan all landing-editor-autosave: keys
      const localPages: LandingPageItem[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("landing-editor-autosave:")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const backup = JSON.parse(raw);
              const pageId = key.replace("landing-editor-autosave:", "");
              localPages.push({
                id: pageId,
                name: backup?.editorData?.pageName || "Untitled Page",
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
            }
          }
        }
      } catch (err) {
        console.warn("Failed to read local storage pages:", err);
      }



      // Sort by updatedAt descending
      localPages.sort((a, b) => {
        const timeA = new Date(a.updatedAt.split(", ")[1]?.split("/").reverse().join("-") + "T" + a.updatedAt.split(", ")[0]).getTime() || 0;
        const timeB = new Date(b.updatedAt.split(", ")[1]?.split("/").reverse().join("-") + "T" + b.updatedAt.split(", ")[0]).getTime() || 0;
        return timeB - timeA;
      });

      setPages(localPages);
    }

    void loadPages();
  }, []);

  // Creating page state
  const [isCreating, setIsCreating] = useState(false);


  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateItem | null>(null);
  const [activeJob, setActiveJob] = useState<{
    id: string;
    type: "blank" | "ai" | "clone" | "import" | "ppc";
    progress: number;
    statusText: string;
    pageName: string;
  } | null>(null);

  // Templates Sub-View States
  const [activeTemplateTab, setActiveTemplateTab] = useState("sample"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<TemplateItem | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>({});
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setIsTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const data = await listTemplates();
        if (cancelled) return;

        const mapped: TemplateItem[] = (data as LandingTemplateRow[]).map((t) => ({
          id: t.id,
          templateId: t.template_key || undefined,
          name: t.name || "Untitled Template",
          image: t.thumbnail_url || t.preview_image_url || "/images/grid-image/image-01.png",
          category: t.category === "ecommerce" || t.category === "Bán hàng" ? "ecommerce" : t.category === "service" || t.category === "Dịch vụ" ? "service" : "others",
          isPro: t.price_type === "pro",
          views: t.views_count || 0,
          likes: t.downloads_count || 0,
          scrollDist: "calc(-100% + 260px)",
          editor_data: t.editor_data,
        }));

        setTemplates(mapped);
      } catch (err) {
        console.error("Failed to load templates from Supabase:", err);
        if (!cancelled) {
          setTemplatesError(err instanceof Error ? err.message : "Không thể tải kho giao diện");
        }
      } finally {
        if (!cancelled) {
          setIsTemplatesLoading(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  // Form Config Sub-View States
  const [formConfigs, setFormConfigs] = useState<FormConfigItem[]>([]);

  // Tag Management Sub-View States
  const [tags, setTags] = useState<TagItem[]>(initialTags);

  // Domains Sub-View States
  const [domains, setDomains] = useState<DomainItem[]>([]);

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

  // Helper: Chọn template theo ngành nghề & phong cách của AI Builder
  const getTemplateIdByIndustryAndStyle = (industry: string, style: string): string => {
    const ind = (industry || "").toLowerCase();
    if (ind.includes("spa") || ind.includes("beauty") || ind.includes("mỹ phẩm") || ind.includes("cosmetic") || ind.includes("làm đẹp")) {
      return "beauty-spa";
    }
    if (ind.includes("cưới") || ind.includes("wedding") || ind.includes("marry")) {
      return "wedding-invite";
    }
    if (ind.includes("trà") || ind.includes("tea") || ind.includes("thảo mộc") || ind.includes("herb")) {
      return "herb-tea";
    }
    if (ind.includes("đồng hồ") || ind.includes("watch") || ind.includes("smartwatch")) {
      return "smartwatch-performance";
    }
    if (ind.includes("tài chính") || ind.includes("finance") || ind.includes("consult") || ind.includes("tư vấn")) {
      return "finance-lead";
    }
    if (ind.includes("khóa học") || ind.includes("course") || ind.includes("học") || ind.includes("education") || ind.includes("dạy")) {
      return "online-course";
    }
    if (ind.includes("bất động sản") || ind.includes("real estate") || ind.includes("nhà") || ind.includes("căn hộ")) {
      return "real-estate-premium";
    }
    if (ind.includes("nhà hàng") || ind.includes("restaurant") || ind.includes("ăn") || ind.includes("food") || ind.includes("quán")) {
      return "restaurant-menu";
    }
    if (ind.includes("app") || ind.includes("mobile") || ind.includes("phần mềm") || ind.includes("crm") || ind.includes("saas")) {
      return "saas-minimal";
    }
    if (style === "premium") return "clinic-trust";
    if (style === "bold") return "ecommerce-bold";
    if (style === "friendly") return "local-service";
    return "saas-minimal";
  };

  // Helper: Cá nhân hóa nội dung các block dựa trên form nhập liệu của người dùng
  const customizeGeneratedSections = (
    sections: EditorBlock[],
    type: "ai" | "clone" | "ppc",
    name: string,
    params: GeneratorParams
  ): EditorBlock[] => {
    return sections.map((section) => {
      const newSection = { ...section, props: { ...section.props } };

      if (type === "ai") {
        const { businessName, industry, location, goal } = params;
        if (newSection.type === "hero" || newSection.type === "tea_landing" || newSection.type === "smartwatch_landing") {
          if (newSection.props.headline) {
            newSection.props.headline = `Giải pháp ${industry} đột phá cùng ${businessName}`;
          }
          if (newSection.props.subheadline) {
            newSection.props.subheadline = `Chúng tôi tự hào cung cấp dịch vụ ${industry} chuyên nghiệp ${location ? `tại ${location}` : "hàng đầu"}.`;
          }
          if (newSection.props.title) {
            newSection.props.title = `${businessName} - ${industry}`;
          }
        }
        if (newSection.type === "button" || newSection.type === "form_capture") {
          if (goal === "sell_products") {
            newSection.props.label = "Mua sản phẩm ngay";
            newSection.props.buttonText = "Mua ngay";
          } else if (goal === "brand_intro") {
            newSection.props.label = "Đăng ký tư vấn";
            newSection.props.buttonText = "Gửi yêu cầu";
          }
        }
      } else if (type === "clone") {
        const { url, keyword } = params;
        const sourceUrl = url || "";
        const domain = sourceUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
        if (newSection.type === "hero") {
          newSection.props.headline = `Bản sao giao diện từ ${domain}`;
          newSection.props.subheadline = keyword 
            ? `Giao diện tối ưu hóa SEO cho từ khóa: "${keyword}"`
            : `Giao diện được cấu trúc lại từ trang nguồn: ${sourceUrl}`;
        }
      } else if (type === "ppc") {
        const { keyword, offer, cta } = params;
        if (newSection.type === "hero") {
          if (keyword) newSection.props.headline = `Dịch vụ ${keyword} chất lượng cao`;
          if (offer) newSection.props.subheadline = `🔥 Ưu đãi cực khủng: ${offer}`;
        }
        if (newSection.type === "button" || newSection.type === "form_capture") {
          if (cta) {
            newSection.props.label = cta;
            newSection.props.buttonText = cta;
          }
        }
      }

      if (Array.isArray(newSection.children)) {
        newSection.children = customizeGeneratedSections(newSection.children, type, name, params);
      }

      return newSection;
    });
  };

  // Main Generator Handler — thay thế handleCreatePage cũ
  const handleGeneratePage = useCallback(async (payload: {
    type: "blank" | "ai" | "clone" | "import" | "ppc";
    name: string;
    params: GeneratorParams;
  }) => {
    const { type, name, params } = payload;
    setIsCreateModalOpen(false);

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
        });

        if (pendingTemplate?.id) {
          await incrementTemplateDownloads(pendingTemplate.id);
        }

        if (created?.id) {
          const newPg: LandingPageItem = {
            id: created.id,
            name: created.name,
            templateId: pendingTemplate?.templateId || undefined,
            status: "UNPUBLISHED",
            updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
            views: 0,
            conversions: 0,
            revenue: 0,
          };
          setPages((prev) => [newPg, ...prev]);
          setPendingTemplate(null);
          void openLandingBuilder({ pageId: created.id, mode: "same-tab" });
        }
      } catch (err) {
        console.error("Failed to create landing page:", err);
        alert(`Không thể tạo landing page trống: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsCreating(false);
      }
      return;
    }

    // Khởi tạo tiến trình giả lập
    setActiveJob({
      id: `job_${Date.now()}`,
      type,
      progress: 0,
      statusText: "Khởi động tiến trình...",
      pageName: name,
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        void (async () => {
          try {
            const pageId = crypto.randomUUID();
            let initialEditorData: LandingEditorDraft = {
              pageId,
              pageName: name,
              sections: [],
              pageSettings: createDefaultPageSettings(name),
              schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
            };

            if (type === "ai") {
              const templateId = getTemplateIdByIndustryAndStyle(params.industry || "", params.style || "");
              const flatBlocks = instantiateTemplateBlocks(templateId).map(ensureOnlookBlockMeta);
              const sections = migrateTemplateFlatBlocks(flatBlocks);
              const customized = customizeGeneratedSections(sections, "ai", name, params);

              const primaryBgColors: Record<string, string> = {
                modern: "#3B82F6",
                premium: "#1F2937",
                bold: "#EC4899",
                friendly: "#10B981",
              };
              const selectedStyle = params.style || "modern";

              initialEditorData = {
                pageId,
                pageName: name,
                sections: recalculateSectionHeights(customized),
                pageSettings: {
                  ...createDefaultPageSettings(name),
                  bgColor: selectedStyle === "premium" ? "#09090b" : "#ffffff",
                  primaryColor: primaryBgColors[selectedStyle] || "#3B82F6",
                  seoTitle: `${name} - ${params.industry || "landing page"}`,
                  seoDescription: `Website giới thiệu về ${params.businessName || name} trong lĩnh vực ${params.industry || "kinh doanh"}.`,
                },
                schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
              };
            } else if (type === "clone") {
              const templateId = "saas-minimal";
              const flatBlocks = instantiateTemplateBlocks(templateId).map(ensureOnlookBlockMeta);
              const sections = migrateTemplateFlatBlocks(flatBlocks);
              const customized = customizeGeneratedSections(sections, "clone", name, params);

              initialEditorData = {
                pageId,
                pageName: name,
                sections: recalculateSectionHeights(customized),
                pageSettings: {
                  ...createDefaultPageSettings(name),
                  primaryColor: "#8B5CF6",
                  seoTitle: `Bản sao giao diện từ ${(params.url || "").replace(/https?:\/\/(www\.)?/, "").split("/")[0]}`,
                },
                schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
              };
            } else if (type === "import") {
              let parsedSections: EditorBlock[] = [];
              let parsedGlobalCss = "";
              let parsedAssets: unknown[] = [];

              if (params.file) {
                try {
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
                } catch (readErr) {
                  console.error("Failed to process imported file:", readErr);
                }
              }

              if (parsedSections.length === 0) {
                const fallbackHtml = `<div style="padding: 60px 20px; text-align: center; font-family: sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">\n  <h1>Trang thiết kế nhập từ ZIP/HTML</h1>\n  <p>Chào mừng đến với trang ${name}</p>\n</div>`;
                const htmlBlock = ensureOnlookBlockMeta({
                  id: `html_${Date.now()}`,
                  type: "html_code",
                  label: "Mã HTML Nhập khẩu",
                  props: {
                    code: fallbackHtml,
                    height: 800
                  }
                });
                parsedSections = [htmlBlock];
              }

              initialEditorData = {
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
            } else if (type === "ppc") {
              const templateId = "finance-lead";
              const flatBlocks = instantiateTemplateBlocks(templateId).map(ensureOnlookBlockMeta);
              const sections = migrateTemplateFlatBlocks(flatBlocks);
              const customized = customizeGeneratedSections(sections, "ppc", name, params);

              initialEditorData = {
                pageId,
                pageName: name,
                sections: recalculateSectionHeights(customized),
                pageSettings: {
                  ...createDefaultPageSettings(name),
                  primaryColor: "#E11D48",
                  seoTitle: `Landing Page Quảng cáo cho ${params.keyword}`,
                },
                schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
              };
            }

            const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`;
            const created = await createLandingPage({
              id: pageId,
              name,
              slug,
              editor_data: initialEditorData,
            });

            if (created?.id) {
              const newPg: LandingPageItem = {
                id: created.id,
                name: created.name,
                status: "UNPUBLISHED",
                updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
                views: 0,
                conversions: 0,
                revenue: 0,
              };
              setPages((prev) => [newPg, ...prev]);
              setActiveJob(null);
              void openLandingBuilder({ pageId: created.id, mode: "same-tab" });
            }
          } catch (err) {
            console.error("Failed to complete page generation:", err);
            alert(`Lỗi hoàn thành tiến trình khởi tạo: ${err instanceof Error ? err.message : String(err)}`);
            setActiveJob(null);
          }
        })();
      } else {
        let statusText = "Đang xử lý...";
        if (type === "ai") {
          if (currentProgress < 25) statusText = "Đang phân tích ý tưởng website và ngành nghề...";
          else if (currentProgress < 50) statusText = "Đang khởi tạo các khối giao diện chuyên nghiệp...";
          else if (currentProgress < 75) statusText = "Đang viết nội dung mô tả sản phẩm và dịch vụ bằng AI...";
          else if (currentProgress < 95) statusText = "Đang thiết lập màu sắc phối màu và kiểu chữ...";
          else statusText = "Đang tối ưu hóa giao diện di động...";
        } else if (type === "clone") {
          if (currentProgress < 25) statusText = `Đang kết nối tới URL nguồn...`;
          else if (currentProgress < 50) statusText = "Đang phân tích cấu trúc DOM và file CSS...";
          else if (currentProgress < 75) statusText = "Đang chuyển đổi cấu trúc DOM sang JSON Blocks...";
          else if (currentProgress < 95) statusText = "Đang tải ảnh và asset giả lập...";
          else statusText = "Đang hoàn thiện bản sao...";
        } else if (type === "import") {
          if (currentProgress < 25) statusText = "Đang giải nén tập tin ZIP thiết kế...";
          else if (currentProgress < 55) statusText = "Đang quét các file HTML và tài nguyên media...";
          else if (currentProgress < 85) statusText = "Đang chuyển đổi mã HTML sang khối Visual Editor...";
          else statusText = "Đang định hình canvas...";
        } else if (type === "ppc") {
          if (currentProgress < 25) statusText = `Đang liên kết chiến dịch quảng cáo ${params.source}...`;
          else if (currentProgress < 50) statusText = "Đang tối ưu tiêu đề chính theo từ khóa quảng cáo...";
          else if (currentProgress < 75) statusText = "Đang chuẩn bị form thu thập thông tin khách hàng tiềm năng...";
          else statusText = "Đang cấu hình nút kêu gọi hành động CTA...";
        }

        setActiveJob((prev) => prev ? { ...prev, progress: currentProgress, statusText } : null);
      }
    }, 900);
  }, [pendingTemplate, router]);

  // Create page from template
  const handleUseTemplate = (template: TemplateItem) => {
    setPendingTemplate(template);
    setIsCreateModalOpen(true);
  };


  // Handler for editing a page — navigate to the editor route
  const handleEditPage = useCallback(async (page: LandingPageItem) => {
    try {
      await openLandingBuilder({ pageId: page.id, mode: "same-tab" });
    } catch (err) {
      console.error("Failed to open builder:", err);
      alert(err instanceof Error ? err.message : "Không thể mở builder.");
    }
  }, []);


  // Handler for deleting a page
  const handleDeletePage = useCallback(async (page: LandingPageItem) => {
    try {
      await deleteLandingPage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      setSelectedIds((prev) => prev.filter((id) => id !== page.id));
    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("Không thể xóa landing page. Vui lòng thử lại.");
    }
  }, []);

  // Handler for deleting multiple selected pages
  const handleDeleteSelectedPages = useCallback(async (ids: string[]) => {
    try {
      await deleteLandingPages(ids);
      setPages((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to delete selected pages:", err);
      alert("Không thể xóa các landing page đã chọn. Vui lòng thử lại.");
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
  const handleAddFormConfig = (name: string, type: "Google Forms" | "API" | "OTP") => {
    const newConfig: FormConfigItem = {
      id: String(Date.now()),
      name,
      linkedAccounts: 1, // mock count
      type,
      status: "ACTIVE",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setFormConfigs(prev => [newConfig, ...prev]);
  };

  // Add a new Tag
  const handleAddTag = (name: string) => {
    const newTag: TagItem = {
      id: String(Date.now()),
      name,
      count: 0,
      createdAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
      status: "UNLOCKED",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setTags(prev => [newTag, ...prev]);
  };

  // Add a new Domain
  const handleAddDomain = (name: string, platform: string) => {
    const newDomain: DomainItem = {
      id: String(Date.now()),
      name,
      status: "VERIFIED",
      platform,
      sslStatus: "ACTIVE",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setDomains(prev => [newDomain, ...prev]);
  };

  // Filter calculation for pages
  const filteredPages = pages.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" 
      || (statusFilter === "PUBLISHED" && p.status === "PUBLISHED")
      || (statusFilter === "UNPUBLISHED" && p.status === "UNPUBLISHED");
    return matchesSearch && matchesStatus;
  });

  // Filter calculation for templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>

      <div className="flex flex-col lg:flex-row gap-6 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 1. Secondary Sub-sidebar */}
      <SubSidebar 
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        tagSearchQuery={tagSearchQuery}
        setTagSearchQuery={setTagSearchQuery}
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
            setSelectedTemplateForPreview={setSelectedTemplateForPreview}
            handleUseTemplate={handleUseTemplate}
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
          />
        ) : activeSubTab === "domains" ? (
          <DomainsConfig 
            domains={domains}
            onAddDomain={handleAddDomain}
          />
        ) : activeSubTab === "leads" ? (
          <DataLeads />
        ) : (
          <PagesList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredPages={filteredPages}
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
          />
        )}
      </div>

      {/* 3. Modal for creating a new Landing Page */}
      <CreatePageModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setPendingTemplate(null);
          setIsCreateModalOpen(false);
        }}
        isLoading={isCreating}
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
                {activeJob.type === "ai" ? "AI đang thiết kế Landing Page" :
                 activeJob.type === "clone" ? "Đang Clone giao diện Website" :
                 activeJob.type === "import" ? "Đang Import tệp thiết kế" :
                 "Đang tạo trang PPC Campaign"}
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
          </div>
        </div>
      )}


      {/* 4. Modal for template preview */}
      <TemplatePreviewModal 
        template={selectedTemplateForPreview}
        onClose={() => setSelectedTemplateForPreview(null)}
        onUseTemplate={(temp) => {
          setSelectedTemplateForPreview(null);
          handleUseTemplate(temp);
        }}
      />
    </div>
  </>
  );
}

export default function LandingPagesPage() {
  return <LandingPagesManagement />;
}
