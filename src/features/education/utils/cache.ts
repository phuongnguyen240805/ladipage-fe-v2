// In-memory cache fallback for SSR or environments without sessionStorage
const memoryCache = new Map<string, { data: any; expiry: number }>();

const STORAGE_PREFIX = 'ems_lookup_cache_';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes / 300000ms)
}

function getSessionItem(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

function setSessionItem(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // Ignore quota errors
  }
}

/**
 * Wraps an async function with a caching layer (sessionStorage with in-memory fallback).
 * If the cache is valid and not expired, returns the cached data immediately.
 * Otherwise, executes the fetcher, updates the cache, and returns the data.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
  const now = Date.now();

  // Try sessionStorage cache first
  const cachedSession = getSessionItem(key);
  if (cachedSession && cachedSession.expiry > now) {
    return cachedSession.data as T;
  }

  // Try memory cache fallback
  const cachedMemory = memoryCache.get(key);
  if (cachedMemory && cachedMemory.expiry > now) {
    return cachedMemory.data as T;
  }

  // Fetch new data
  const data = await fetcher();

  const cacheEntry = {
    data,
    expiry: Date.now() + ttl,
  };

  // Save to both
  setSessionItem(key, cacheEntry);
  memoryCache.set(key, cacheEntry);

  return data;
}

/**
 * Clears the cache. If a prefix is provided, clears all keys starting with that prefix.
 * Otherwise, clears the entire cache.
 */
export function clearCache(prefix?: string) {
  // Clear memory cache
  if (prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }

  // Clear sessionStorage cache
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    if (prefix) {
      const searchPrefix = STORAGE_PREFIX + prefix;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(searchPrefix)) {
          keysToRemove.push(key);
        }
      }
    } else {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (e) {
    // Ignore
  }
}
