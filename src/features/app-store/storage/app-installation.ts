export const APP_INSTALLATION_STORAGE_KEY = "ladipage.installed-apps";
export const APP_UNINSTALLED_STORAGE_KEY = "ladipage.uninstalled-apps";
export const APP_INSTALLATION_EVENT = "ladipage:installed-apps-changed";

function readStringArray(key: string) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function readInstalledAppIds(fallback: string[] = []) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(APP_INSTALLATION_STORAGE_KEY);
    const uninstalledIds = new Set(readStringArray(APP_UNINSTALLED_STORAGE_KEY));
    if (!raw) {
      return fallback.filter((id) => !uninstalledIds.has(id));
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback.filter((id) => !uninstalledIds.has(id));
    }

    const installedIds = parsed.filter((id): id is string => typeof id === "string");
    const defaultIds = fallback.filter((id) => !uninstalledIds.has(id));

    return Array.from(new Set([...installedIds, ...defaultIds]));
  } catch {
    return fallback;
  }
}

export function saveInstalledAppIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const uniqueIds = Array.from(new Set(ids));
  const installedIds = new Set(uniqueIds);
  const uninstalledIds = readStringArray(APP_UNINSTALLED_STORAGE_KEY).filter((id) => !installedIds.has(id));

  window.localStorage.setItem(APP_INSTALLATION_STORAGE_KEY, JSON.stringify(uniqueIds));
  window.localStorage.setItem(APP_UNINSTALLED_STORAGE_KEY, JSON.stringify(uninstalledIds));
  window.dispatchEvent(new CustomEvent(APP_INSTALLATION_EVENT, { detail: uniqueIds }));
}

export function markUninstalledAppId(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const uninstalledIds = Array.from(new Set([...readStringArray(APP_UNINSTALLED_STORAGE_KEY), id]));
  window.localStorage.setItem(APP_UNINSTALLED_STORAGE_KEY, JSON.stringify(uninstalledIds));
}
