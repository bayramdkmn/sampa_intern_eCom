const STORAGE_KEY = "recently_viewed_product_ids";

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x) => typeof x === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedId(id: string, maxItems: number = 20): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewedIds();
    const without = current.filter((x) => x !== id);
    const updated = [id, ...without].slice(0, maxItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // no-op
  }
}


