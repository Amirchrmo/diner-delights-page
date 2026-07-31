import type {
  ApiError,
  CategoryDoc,
  CategoryInput,
  LoginResponse,
  MenuItem,
  MenuItemInput,
  UploadResponse,
} from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/$/,
  "",
);

const TOKEN_KEY = "bergeerd_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Custom error carrying the parsed body so callers can show field errors.
export class HttpError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 204 or empty body -> return null cast.
  if (res.status === 204) {
    return null as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new HttpError(res.status, data ?? null, message);
  }

  // The backend wraps payloads in { "data": ... }.
  return (data?.data ?? data) as T;
}

// ----- Auth -----
export function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );
}

// ----- Menu items (admin) -----
export function listMenuItems(): Promise<MenuItem[]> {
  return request<MenuItem[]>("/admin/menu");
}

export function getMenuItem(id: string): Promise<MenuItem> {
  return request<MenuItem>(`/admin/menu/${id}`);
}

export function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  return request<MenuItem>("/admin/menu", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMenuItem(id: string, input: MenuItemInput): Promise<MenuItem> {
  return request<MenuItem>(`/admin/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteMenuItem(id: string): Promise<void> {
  return request<void>(`/admin/menu/${id}`, { method: "DELETE" });
}

// ----- Categories (dynamic, managed from the admin panel) -----
// Public endpoint (no auth) returns the same ordered list as the admin one;
// we still use the admin route to keep things explicit for the panel.
export function listCategories(): Promise<CategoryDoc[]> {
  return request<CategoryDoc[]>("/admin/categories");
}

export function getCategory(id: string): Promise<CategoryDoc> {
  return request<CategoryDoc>(`/admin/categories/${id}`);
}

export function createCategory(input: CategoryInput): Promise<CategoryDoc> {
  return request<CategoryDoc>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<CategoryDoc> {
  return request<CategoryDoc>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return request<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

// ----- Image upload -----
export function uploadImage(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("image", file);
  return request<UploadResponse>("/admin/upload", {
    method: "POST",
    body: form,
  });
}
