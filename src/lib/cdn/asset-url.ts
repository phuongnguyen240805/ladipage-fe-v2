import {
  CDN_BASE_URL,
  CDN_ENABLED,
} from "./config";

const ABSOLUTE_URL_PATTERN =
  /^(?:https?:|data:|blob:|\/\/)/i;

export function assetUrl(
  input?: string | null,
): string {
  if (!input) {
    return "";
  }

  const value = input.trim();

  if (!value) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  const localPath = value.startsWith("/")
    ? value
    : `/${value}`;

  if (!CDN_ENABLED) {
    return localPath;
  }

  return `${CDN_BASE_URL}/${localPath.replace(/^\/+/, "")}`;
}