const rawCdnBaseUrl =
  process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim() ?? "";

export const CDN_BASE_URL =
  rawCdnBaseUrl.replace(/\/+$/, "");

export const CDN_ENABLED =
  CDN_BASE_URL.length > 0;