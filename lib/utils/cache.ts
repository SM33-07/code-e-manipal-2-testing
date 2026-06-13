type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// Simple global in-memory cache map
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Get item from cache
 */
export function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  // Check TTL expiration
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Save item in cache with a TTL in milliseconds
 */
export function setCached<T>(key: string, value: T, ttlMs: number): void {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Remove an item from the cache manually (e.g. on database update)
 */
export function clearCache(key: string): void {
  cacheStore.delete(key);
}

/**
 * Clear all cached items
 */
export function clearAllCache(): void {
  cacheStore.clear();
}
