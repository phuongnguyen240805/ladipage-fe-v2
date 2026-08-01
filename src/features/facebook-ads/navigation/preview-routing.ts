export const DEFAULT_FACEBOOK_ADS_PATH = "/facebook-ads/manager";
export const FACEBOOK_ADS_BASE_PATH = "/facebook-ads/";

export const FACEBOOK_ADS_PREVIEW_PATHS = new Set([
  DEFAULT_FACEBOOK_ADS_PATH,
  "/facebook-ads/create",
  "/facebook-ads/drafts",
  "/facebook-ads/reports",
  "/facebook-ads/connections",
  "/facebook-ads/assets",
  "/facebook-ads/rules",
  "/facebook-ads/permissions",
  "/facebook-ads/policy",
  "/facebook-ads/support",
  "/facebook-ads/tools",
  "/facebook-ads/tai-khoan-qc",
  "/facebook-ads/tai-khoan-bm",
  "/facebook-ads/fanpage",
  "/facebook-ads/email-tam-thoi",
  "/facebook-ads/guide",
  "/facebook-ads/cai-dat",
]);

export function normalizeFacebookAdsPreviewPath(path: string | null): string {
  if (!path) return DEFAULT_FACEBOOK_ADS_PATH;

  let normalizedPath = path.trim();
  try {
    normalizedPath = decodeURIComponent(normalizedPath);
  } catch {
    return DEFAULT_FACEBOOK_ADS_PATH;
  }

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `${FACEBOOK_ADS_BASE_PATH}${normalizedPath.replace(/^\/+/, "")}`;
  }

  normalizedPath = normalizedPath.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  if (FACEBOOK_ADS_PREVIEW_PATHS.has(normalizedPath)) return normalizedPath;

  if (normalizedPath.startsWith("/facebook-ads/tools/")) {
    const slug = normalizedPath.slice("/facebook-ads/tools/".length);
    return slug && !slug.includes("/") ? normalizedPath : "/facebook-ads/tools";
  }

  return DEFAULT_FACEBOOK_ADS_PATH;
}

