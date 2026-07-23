// Client-only prefs in localStorage: recently-opened tools + favorites.
// SSR-safe (all guarded); tiny enough that a hook/library would be overkill.
const RECENTS = "tt-recents";
const FAVS = "tt-favs";
const MAX_RECENTS = 6;

function read(key: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(key: string, v: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export function getRecents(): string[] {
  return read(RECENTS);
}

export function pushRecent(slug: string) {
  const next = [slug, ...read(RECENTS).filter((s) => s !== slug)].slice(0, MAX_RECENTS);
  write(RECENTS, next);
}

export function getFavorites(): string[] {
  return read(FAVS);
}

export function isFavorite(slug: string): boolean {
  return read(FAVS).includes(slug);
}

// Returns the new state (true = now favorited).
export function toggleFavorite(slug: string): boolean {
  const cur = read(FAVS);
  const on = cur.includes(slug);
  write(FAVS, on ? cur.filter((s) => s !== slug) : [slug, ...cur]);
  return !on;
}
