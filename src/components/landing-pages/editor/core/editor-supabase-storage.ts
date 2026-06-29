import { supabase } from "@/lib/supabase";
import { EditorData, createDefaultPageSettings } from "../types";
import { migrateEditorData, migrateTemplateFlatBlocks, CURRENT_EDITOR_SCHEMA_VERSION, getEditorDataFingerprint } from "./editor-migration";
import { LandingEditorSnapshot } from "./editor-export-html";
import { instantiateTemplateBlocks } from "../template-library";

/** Lấy JWT access token của người dùng hiện tại để gửi kèm API request */
async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export interface LocalAutosaveBackup {
  pageId: string;
  schemaVersion: number;
  editorData: EditorData;
  savedAt: string;
  source: "local";
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPageId(pageId: unknown): pageId is string {
  return typeof pageId === "string" && UUID_PATTERN.test(pageId);
}

export function assertValidPageId(pageId: unknown): asserts pageId is string {
  if (!isValidPageId(pageId)) {
    throw new Error(`Invalid landing page id: ${String(pageId)}`);
  }
}

export function getLocalBackupKey(pageId: string): string {
  assertValidPageId(pageId);
  return `landing-editor-autosave:${pageId}`;
}

export async function loadLandingPage(pageId: string): Promise<EditorData | null> {
  assertValidPageId(pageId);
  const localKey = getLocalBackupKey(pageId);
  const logLoad = (source: string, editorData: EditorData | null, extra?: Record<string, unknown>) => {
    console.info("[LandingEditor Load]", {
      routePageId: pageId,
      localStorageKey: localKey,
      source,
      schemaVersion: editorData?.schemaVersion ?? null,
      sectionsLength: editorData?.sections?.length ?? 0,
      fingerprint: editorData ? getEditorDataFingerprint(editorData) : "null",
      ...extra,
    });
  };

  // 1. Try to load from Supabase if configured
  let dbPage: any = null;
  let dbError: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", pageId)
        .maybeSingle();
      if (error) {
        dbError = error;
      } else {
        dbPage = data;
      }
    } catch (err) {
      dbError = err;
    }
  }

  // 2. Read from localStorage backup
  let localBackup: LocalAutosaveBackup | null = null;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localBackup = JSON.parse(raw) as LocalAutosaveBackup;
    }
  } catch (err) {
    console.warn("Failed to read local storage backup:", err);
  }

  // 3. Process outcomes
  if (dbError) {
    console.warn("Supabase load failed, falling back to local storage:", dbError);
    if (localBackup) {
      const localData = migrateEditorData(localBackup.editorData, pageId);
      logLoad("local-backup-after-supabase-error", localData, { dbError: dbError?.message ?? String(dbError) });
      return localData;
    }
    logLoad("supabase-error-no-local", null, { dbError: dbError?.message ?? String(dbError) });
    return null;
  }

  if (dbPage) {
    const dbData = migrateEditorData({ pageName: dbPage.name, ...(dbPage.editor_data || {}) }, pageId);
    const templateId = dbPage.editor_data?.templateId;
    if (
      templateId === "herb-tea" &&
      !dbData.sections.some((section) => section.type === "tea_landing")
    ) {
      dbData.sections = migrateTemplateFlatBlocks(instantiateTemplateBlocks("herb-tea"));
      console.info("[LandingEditor Repair:template-core]", {
        pageId,
        templateId,
        fingerprint: getEditorDataFingerprint(dbData),
      });
    }
    
    // If local backup is newer than database, we warn or return it
    if (localBackup && localBackup.savedAt) {
      const localTime = new Date(localBackup.savedAt).getTime();
      const dbTime = new Date(dbPage.updated_at || dbPage.created_at).getTime();
      
      if (localTime > dbTime + 1000) {
        console.info("A newer local backup was found compared to the database version.");
        // We attach a temporary metadata flag so the UI can prompt the user to recover it
        (dbData as any).hasNewerLocalBackup = true;
        (dbData as any).localBackupData = localBackup.editorData;
      }
    }
    logLoad("supabase", dbData, {
      supabaseRowId: dbPage.id,
      rowSchemaVersion: dbPage.editor_data?.schemaVersion ?? null,
    });
    return dbData;
  }

  if (supabase && !dbError && !dbPage) {
    try {
      localStorage.removeItem(localKey);
      console.info("[LandingEditor Clean] Cleaned local storage backup for page not found in Supabase:", pageId);
    } catch (err) {
      console.warn("Failed to delete local storage key:", err);
    }
  }

  if (!supabase && localBackup) {
    const localData = migrateEditorData(localBackup.editorData, pageId);
    logLoad("local-backup-no-supabase", localData);
    return localData;
  }

  logLoad(supabase ? "page-not-found" : "no-data", null);
  return null;
}

export async function saveLandingPage(pageId: string, editorData: EditorData): Promise<void> {
  assertValidPageId(pageId);
  const nowStr = new Date().toISOString();
  
  // 1. Always backup to localStorage
  const backup: LocalAutosaveBackup = {
    pageId,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    editorData,
    savedAt: nowStr,
    source: "local",
  };
  try {
    localStorage.setItem(getLocalBackupKey(pageId), JSON.stringify(backup));
    console.info("[LandingEditor Save:local]", {
      pageId,
      localStorageKey: getLocalBackupKey(pageId),
      fingerprint: getEditorDataFingerprint(editorData),
    });
  } catch (err) {
    console.warn("Failed to write local backup:", err);
  }

  // 2. Try to save to Supabase if configured
  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const updatePayload: any = {
        id: pageId,
        name: editorData.pageName || "Untitled Page",
        slug: editorData.pageSettings?.slug || editorData.pageName?.toLowerCase().replace(/\s+/g, "-") || `page-${pageId}`,
        status: "draft",
        editor_data: editorData,
        updated_at: nowStr,
      };

      if (userId) {
        updatePayload.user_id = userId;
      }

      // Lấy JWT để gửi Authorization header
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch("/api/landing-pages", {
        method: "PUT",
        headers,
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const errMsg = result?.error || "Supabase save failed.";
        // Handle unauthorized errors gracefully during local preview/testing without session
        if (response.status === 401 || errMsg.toLowerCase().includes("unauthorized") || errMsg.toLowerCase().includes("sign in")) {
          console.warn("User is unauthorized. Design saved to LocalStorage backup only.");
          return;
        }
        throw new Error(errMsg);
      }

      console.info("[LandingEditor Save:supabase]", {
        pageId,
        fingerprint: getEditorDataFingerprint(editorData),
      });
    } catch (err) {
      console.error("Failed to save to Supabase, local backup remains intact:", err);
      throw err;
    }
  } else {
    console.warn("Supabase is not configured. Saved to LocalStorage only.");
  }
}

export async function createLandingPage(input: {
  id?: string;
  name: string;
  slug: string;
  editor_data?: any;
}): Promise<any> {
  const nowStr = new Date().toISOString();
  const pageId = input.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "");
  assertValidPageId(pageId);
  const editorData = input.editor_data
    ? migrateEditorData({ ...input.editor_data, pageId, pageName: input.editor_data.pageName || input.name }, pageId)
    : {
        pageId,
        pageName: input.name,
        sections: [],
        pageSettings: {
          ...createDefaultPageSettings(input.name),
          seoDescription: "",
          bgColor: "#ffffff",
          fontFamily: "Inter, sans-serif",
          maxWidth: 1200,
        },
        schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
      };

  const pageData: any = {
    id: pageId,
    name: input.name,
    slug: input.slug,
    status: "draft",
    editor_data: editorData,
    created_at: nowStr,
    updated_at: nowStr,
  };

  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      pageData.user_id = userData.user.id;
    }

    // Lấy JWT để gửi Authorization header
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch("/api/landing-pages", {
      method: "POST",
      headers,
      body: JSON.stringify(pageData),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(result?.error || "Supabase create failed.");
    }

    const result = await response.json();
    return result.page;
  }

  // Local storage fallback for creation
  const backup: LocalAutosaveBackup = {
    pageId,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    editorData,
    savedAt: nowStr,
    source: "local",
  };
  localStorage.setItem(getLocalBackupKey(pageId), JSON.stringify(backup));
  return pageData;
}

export async function publishLandingPage(
  pageId: string,
  html: string
): Promise<void> {
  assertValidPageId(pageId);
  const nowStr = new Date().toISOString();

  if (supabase) {
    // 1. Fetch AI SEO connection if exists
    let finalHtml = html;
    try {
      const { data: connectedPage } = await supabase
        .from("ai_seo_project_pages")
        .select("ai_seo_project_id")
        .eq("website_page_id", pageId)
        .maybeSingle();

      if (connectedPage && connectedPage.ai_seo_project_id) {
        const scriptTag = `<script async src="https://api.otto-seo.com/sdk/${connectedPage.ai_seo_project_id}.js"></script>`;
        if (!finalHtml.includes(scriptTag)) {
          if (finalHtml.includes("</head>")) {
            finalHtml = finalHtml.replace("</head>", `${scriptTag}</head>`);
          } else {
            finalHtml = finalHtml + scriptTag;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to check AI SEO script connection:", err);
    }

    // 2. Fetch page slug for matching URLs
    let slug = pageId;
    try {
      const { data: lp } = await supabase
        .from("landing_pages")
        .select("slug")
        .eq("id", pageId)
        .maybeSingle();
      if (lp?.slug) {
        slug = lp.slug;
      }
    } catch (err) {
      console.warn("Failed to retrieve landing page slug:", err);
    }

    // 3. Update landing_pages
    const { error } = await supabase
      .from("landing_pages")
      .update({
        published_html: finalHtml,
        status: "published",
        visibility: "public",  // Xuất bản = công khai
        published_at: nowStr,
        updated_at: nowStr,
      })
      .eq("id", pageId);
    if (error) throw error;

    // 4. Update canonical website_pages table
    try {
      await supabase
        .from("website_pages")
        .update({
          status: "published",
          published_url: `/p/${slug}`,
          sync_status: "synced",
          last_synced_at: nowStr,
          updated_at: nowStr
        })
        .eq("id", pageId);
    } catch (syncErr) {
      console.warn("Failed to update sync_status on website_pages:", syncErr);
    }
  } else {
    console.warn("Supabase not configured, cannot publish page to remote DB.");
  }
}

/**
 * Thu hồi xuất bản: đưa page về trạng thái draft/private.
 * Public link sẽ ngay lập tức trả về 404.
 */
export async function unpublishLandingPage(pageId: string): Promise<void> {
  assertValidPageId(pageId);
  if (supabase) {
    const { error } = await supabase
      .from("landing_pages")
      .update({
        status: "draft",
        visibility: "private",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId);
    if (error) throw error;
  } else {
    console.warn("Supabase not configured, cannot unpublish page.");
  }
}

/**
 * Lấy trạng thái bảo mật của page (status + visibility + slug).
 * Dùng trong EditorTopBar để hiển thị badge và public link.
 */
export async function getPageSecurityInfo(
  pageId: string
): Promise<{ status: string; visibility: string; slug: string | null } | null> {
  assertValidPageId(pageId);
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("landing_pages")
    .select("status, visibility, slug")
    .eq("id", pageId)
    .maybeSingle();
  if (error || !data) return null;
  return data as { status: string; visibility: string; slug: string | null };
}

export async function createLandingPageVersion(
  pageId: string,
  editorData: EditorData,
  versionName: string
): Promise<void> {
  assertValidPageId(pageId);
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const payload: any = {
      page_id: pageId,
      editor_data: editorData,
      version_name: versionName,
    };
    if (userId) {
      payload.user_id = userId;
    }

    const { error } = await supabase
      .from("landing_page_versions")
      .insert([payload]);
    if (error) throw error;
  } else {
    // Local revision backup fallback
    const key = `landing-revisions:${pageId}`;
    let revisions: any[] = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) revisions = JSON.parse(raw);
    } catch {}
    revisions.unshift({
      id: Math.random().toString(36).substring(2, 9),
      page_id: pageId,
      editor_data: editorData,
      version_name: versionName,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(revisions.slice(0, 30)));
  }
}

export async function listLandingPageVersions(pageId: string): Promise<any[]> {
  assertValidPageId(pageId);
  if (supabase) {
    const { data, error } = await supabase
      .from("landing_page_versions")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const key = `landing-revisions:${pageId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function restoreLandingPageVersion(
  pageId: string,
  versionId: string,
  currentEditorData: EditorData
): Promise<EditorData> {
  assertValidPageId(pageId);
  // 1. Create a backup first
  await createLandingPageVersion(pageId, currentEditorData, "Before restore");

  // 2. Load the target version
  if (supabase) {
    const { data, error } = await supabase
      .from("landing_page_versions")
      .select("*")
      .eq("id", versionId)
      .single();
    if (error) throw error;
    return migrateEditorData(data.editor_data, pageId);
  }

  const key = `landing-revisions:${pageId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    const revisions = JSON.parse(raw) as any[];
    const rev = revisions.find((r) => r.id === versionId);
    if (rev) {
      return migrateEditorData(rev.editor_data, pageId);
    }
  }
  throw new Error("Version not found");
}

export async function deleteLandingPage(pageId: string): Promise<void> {
  assertValidPageId(pageId);
  if (supabase) {
    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .eq("id", pageId);
    if (error) throw error;
  }
  try {
    localStorage.removeItem(getLocalBackupKey(pageId));
    console.info("[LandingEditor Delete] Deleted local storage backup for page:", pageId);
  } catch (err) {
    console.warn("Failed to delete local storage key:", err);
  }
}

export async function deleteLandingPages(pageIds: string[]): Promise<void> {
  if (pageIds.length === 0) return;
  pageIds.forEach(assertValidPageId);
  if (supabase) {
    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .in("id", pageIds);
    if (error) throw error;
  }
  pageIds.forEach((id) => {
    try {
      localStorage.removeItem(getLocalBackupKey(id));
    } catch (err) {
      console.warn("Failed to delete local storage key for:", id, err);
    }
  });
}
