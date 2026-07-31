// Shared types mirroring the Go backend models.

// Category is now a dynamic string slug (e.g. "burgers") managed in the
// database via the admin Categories page. The canonical defaults are seeded
// into MongoDB on first run; CATEGORIES below is only a fallback used before
// the API responds (e.g. while loading or if the backend is unreachable).
export type Category = string;

// Fallback categories — must match the seed defaults in
// bergeerd_api/internal/seeder/seeder.go (DefaultCategories).
export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "burgers", label: "برگرها" },
  { value: "sandwiches", label: "ساندویچ‌ها" },
  { value: "fries", label: "سیب‌زمینی" },
  { value: "toppings", label: "میتونی اضافه کنی..." },
  { value: "drinks", label: "نوشیدنی‌ها" },
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  image_alt: string;
  category: Category;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payload for create/update — all fields optional for partial updates.
export interface MenuItemInput {
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  image_alt?: string;
  category?: Category;
  order?: number;
  is_active?: boolean;
}

// A dynamic category as returned by GET /api/categories.
export interface CategoryDoc {
  id: string;
  slug: string;
  title: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payload for category create/update — all fields optional for partial updates.
export interface CategoryInput {
  slug?: string;
  title?: string;
  order?: number;
  is_active?: boolean;
}

export interface LoginResponse {
  token: string;
  admin: { username: string };
}

export interface UploadResponse {
  url: string;
  object: string;
  size: number;
  mime_type: string;
}

// Normalized API error returned by the backend.
export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}
