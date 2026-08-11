const BASE_URL = "https://api.are.na/v3";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = "arena:";

// ─── In-flight dedup + sessionStorage cache ──────────────
// Clear stale arena entries on every full page load so a refresh
// always fetches fresh data. The cache still works within a session
// (SPA navigations) since modules only re-execute on hard reloads.
try {
  const toRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) toRemove.push(key);
  }
  toRemove.forEach((key) => sessionStorage.removeItem(key));
} catch {
  /* private browsing or storage unavailable */
}

const inflight = new Map();

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return data;
  } catch {
    return undefined;
  }
}

function cacheSet(key, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    /* quota exceeded — silently skip */
  }
}

function getAuthHeaders() {
  const token = import.meta.env.VITE_ARENA_API_KEY;
  if (!token) throw new Error("VITE_ARENA_API_KEY is not set");
  return { Authorization: `Bearer ${token}` };
}

function getGroupSlug() {
  const slug = import.meta.env.VITE_GROUP_SLUG;
  if (!slug) throw new Error("VITE_GROUP_SLUG is not set");
  return slug;
}

async function fetchArena(
  path,
  { params, authenticated = true, skipCache = false } = {},
) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const cacheKey = url.toString();

  if (!skipCache) {
    const cached = cacheGet(cacheKey);
    if (cached !== undefined) return cached;
  }

  // Deduplicate identical in-flight requests
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const promise = (async () => {
    const headers = { "Content-Type": "application/json" };
    if (authenticated) Object.assign(headers, getAuthHeaders());

    const res = await fetch(url.toString(), { headers });

    if (res.status === 304) return null;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.details?.message || body?.error || res.statusText;
      const err = new Error(`Arena API ${res.status}: ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const data = await res.json();
    cacheSet(cacheKey, data);
    return data;
  })();

  inflight.set(cacheKey, promise);
  promise.finally(() => inflight.delete(cacheKey));

  return promise;
}

export { BASE_URL, getAuthHeaders, getGroupSlug, fetchArena };
