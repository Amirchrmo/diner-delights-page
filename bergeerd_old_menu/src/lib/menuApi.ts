import { useQuery } from "@tanstack/react-query";

import {
  burgers,
  sandwiches,
  fries,
  toppings,
  drinks,
  type MenuItem,
} from "@/data/menuData";

/**
 * Public menu API integration for the bergeerd website.
 *
 * The website reads menu content from the Go backend (`bergeerd_api`) via
 * `GET /api/menu`. If the API is unreachable (e.g. during local development
 * before the backend is running, or a temporary outage), the existing static
 * data in `menuData.ts` is used so the menu is *always* visible to visitors.
 *
 * Configure the backend location with `VITE_API_URL` (see `.env.example`).
 * When unset, the static data is used directly with no network calls.
 */

// Base URL of the public API, e.g. "http://localhost:8080/api" or
// "https://bergeerd.ir/api". Trailing slash is stripped for safe concatenation.
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/** A single menu item as returned by the API (snake_case JSON). */
export interface ApiMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  image_alt: string;
  category: string;
  order: number;
  is_active: boolean;
}

/** A category group returned by `GET /api/menu`. */
interface ApiCategoryGroup {
  category: string;
  /** Human-friendly section title (e.g. "برگرها") from the dynamic categories. */
  title?: string;
  /** Category display priority — lower values render first on the website. */
  order?: number;
  items: ApiMenuItem[];
}

/** A render-ready menu section: a Persian title plus mapped menu items. */
export interface MenuSectionData {
  title: string;
  /** Category priority used for section ordering (lower first). */
  order?: number;
  items: MenuItem[];
}

/** Maps API category keys to the Persian section titles shown on the site. */
const CATEGORY_TITLES: Record<string, string> = {
  burgers: "برگرها",
  sandwiches: "ساندویچ‌ها",
  fries: "سیب‌زمینی",
  toppings: "میتونی اضافه کنی...",
  drinks: "نوشیدنی‌ها",
};

/**
 * Static fallback used when the API is not configured or unreachable.
 * Mirrors the original hardcoded menu so the site never shows an empty menu.
 */
const STATIC_FALLBACK: MenuSectionData[] = [
  { title: CATEGORY_TITLES.burgers, order: 1, items: burgers },
  { title: CATEGORY_TITLES.sandwiches, order: 2, items: sandwiches },
  { title: CATEGORY_TITLES.fries, order: 3, items: fries },
  { title: CATEGORY_TITLES.toppings, order: 4, items: toppings },
  { title: CATEGORY_TITLES.drinks, order: 5, items: drinks },
];

/** Converts an API menu item into the shape expected by MenuCard/MenuSection. */
function mapApiItem(it: ApiMenuItem): MenuItem {
  return {
    id: it.id,
    name: it.name,
    description: it.description,
    price: it.price,
    image: it.image_url,
    imageAlt: it.image_alt,
    // Preserve the order field so the website can sort explicitly (see
    // mapApiToSections) instead of relying solely on the API's response order.
    order: it.order,
  };
}

/** Converts the API response into render-ready menu sections. */
function mapApiToSections(groups: ApiCategoryGroup[]): MenuSectionData[] {
  // Sort sections by category priority (ascending = higher priority first).
  // Items within each section are also sorted ascending by `order` so the
  // website grid (RTL) can place the highest-priority item on the far right
  // and continue descending toward the left.
  return groups
    .map((g, groupIdx) => ({ g, groupIdx }))
    .sort(
      (a, b) =>
        (a.g.order ?? a.groupIdx) - (b.g.order ?? b.groupIdx) ||
        a.groupIdx - b.groupIdx,
    )
    .map(({ g }) => {
      const sorted = g.items
        .map((it, idx) => ({ it, idx }))
        .sort(
          (a, b) =>
            (a.it.order ?? 0) - (b.it.order ?? 0) || a.idx - b.idx,
        )
        .map(({ it }) => mapApiItem(it));

      return {
        title: g.title || CATEGORY_TITLES[g.category] || g.category,
        order: g.order,
        items: sorted,
      };
    });
}

/**
 * Fetches the menu from the API, returning the static fallback on any error.
 * Errors are logged but never thrown so the UI always has data to render.
 */
async function fetchMenu(): Promise<MenuSectionData[]> {
  if (!API_URL) {
    return STATIC_FALLBACK;
  }

  try {
    // cache: "no-store" tells the browser to ALWAYS go to the network and
    // never serve a cached copy. This is a belt-and-suspenders measure: the
    // backend also sends no-cache headers, but "no-store" guarantees the
    // website reflects the latest ordering/content the moment React Query
    // refetches (on mount and on window focus), even through proxies that
    // might strip Cache-Control.
    const res = await fetch(`${API_URL}/menu`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`menu API returned ${res.status}`);
    }
    const json = (await res.json()) as { data?: ApiCategoryGroup[] };
    const groups = json.data;
    if (!Array.isArray(groups) || groups.length === 0) {
      return STATIC_FALLBACK;
    }
    return mapApiToSections(groups);
  } catch (err) {
    // Network error, CORS, backend down, malformed JSON, etc.
    console.warn("[menu] API unavailable, using static fallback:", err);
    return STATIC_FALLBACK;
  }
}

/**
 * React Query hook that loads the menu.
 *
 * - Shows static data instantly (`initialData`) while the API loads.
 * - staleTime: 0 means data is always considered stale, so focusing the
 *   tab (refetchOnWindowFocus) ALWAYS refetches — admin edits appear on
 *   the website the moment you switch back to its tab.
 * - refetchOnMount ensures a fresh fetch whenever the page (re)mounts.
 */
export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: fetchMenu,
    initialData: STATIC_FALLBACK,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
