import { useEffect, useState } from "react";
import { listCategories } from "../api";
import { CATEGORIES, type CategoryDoc } from "../types";

/**
 * Fetches the dynamic categories from the backend and exposes them together
 * with a derived `{ value, label }` list that the existing UI (Dashboard tabs,
 * ItemForm segmented buttons) consumes.
 *
 * On any error we fall back to the static `CATEGORIES` seed defaults so the
 * panel keeps working even if the backend is unreachable on first load.
 */
export function useCategories() {
  const [cats, setCats] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listCategories();
      setCats(data);
    } catch {
      // Keep whatever we had; the derived list below falls back to seed defaults.
      setCats((prev) => prev);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Derived { value, label } list sorted by category priority (ascending),
  // matching website section order. Prefer the API; fall back to static seed
  // defaults when the API hasn't returned anything yet.
  const options =
    cats.length > 0
      ? [...cats]
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fa"))
          .map((c) => ({ value: c.slug, label: c.title || c.slug }))
      : CATEGORIES;

  // Quick lookup: slug -> human title (used for table cells, etc.).
  const titleBySlug = (slug: string): string => {
    const found = cats.find((c) => c.slug === slug);
    if (found) return found.title || found.slug;
    const fallback = CATEGORIES.find((c) => c.value === slug);
    return fallback ? fallback.label : slug;
  };

  return { categories: cats, options, titleBySlug, loading, refresh };
}
