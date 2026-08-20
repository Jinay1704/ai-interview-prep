// ── In-Memory Cache ───────────────────────────────────────────────────────────
// A lightweight TTL-based cache using a plain Map.
// No Redis server, no external URL — lives inside the Node.js process.
// Perfect for development and single-instance deployments.
// ─────────────────────────────────────────────────────────────────────────────

const store = new Map(); // key → { value, expiresAt }

// Periodically clean up expired keys to prevent memory leaks (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt && now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref(); // .unref() so the interval doesn't block process exit

/**
 * Get a cached value by key.
 * Returns null if the key doesn't exist or has expired.
 * @param {string} key
 * @returns {any|null}
 */
export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a value in the cache with a TTL (time-to-live) in seconds.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export function setCache(key, value, ttlSeconds) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete one or more keys from the cache.
 * @param {...string} keys
 */
export function delCache(...keys) {
  for (const key of keys) store.delete(key);
}

/**
 * Returns the number of active (non-expired) keys in the cache.
 * Useful for debugging/health checks.
 */
export function cacheSize() {
  const now = Date.now();
  let count = 0;
  for (const entry of store.values()) {
    if (!entry.expiresAt || now <= entry.expiresAt) count++;
  }
  return count;
}
