import { useRef, useState } from "react";
import type { MenuItem, MenuItemInput } from "../types";
import { CATEGORIES } from "../types";
import { HttpError, uploadImage } from "../api";

interface CategoryOption {
  value: string;
  label: string;
}

interface ItemFormProps {
  item: MenuItem | null; // null = create mode
  onSubmit: (input: MenuItemInput) => Promise<void>;
  onCancel: () => void;
  /** Dynamic categories fetched from the API. Falls back to CATEGORIES. */
  categories?: CategoryOption[];
  /** Suggested order for new items (next available in the active category). */
  defaultOrder?: number;
}

export default function ItemForm({
  item,
  onSubmit,
  onCancel,
  categories,
  defaultOrder,
}: ItemFormProps) {
  const catOptions = categories && categories.length > 0 ? categories : CATEGORIES;
  const [form, setForm] = useState<MenuItemInput>(
    item
      ? {
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          image_alt: item.image_alt,
          category: item.category,
          order: item.order,
          is_active: item.is_active,
        }
      : {
          name: "",
          description: "",
          price: "",
          image_url: "",
          image_alt: "",
          category: catOptions[0]?.value || "burgers",
          order: defaultOrder ?? 1,
          is_active: true,
        },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof MenuItemInput>(key: K, value: MenuItemInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadImage(file);
      set("image_url", res.url);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      if (err instanceof HttpError && err.body?.fields) {
        setFieldErrors(err.body.fields);
      } else {
        setError(err instanceof HttpError ? err.message : "خطا در ذخیره‌سازی");
      }
    } finally {
      setSaving(false);
    }
  }

  const isEdit = !!item;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-menu w-full max-w-lg my-8 animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-gradient-to-l from-brand/5 to-transparent rounded-t-2xl">
          <h2 className="text-lg font-bold text-charcoal">
            {isEdit ? "ویرایش آیتم" : "افزودن آیتم جدید"}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg grid place-items-center text-warm-gray/60 hover:bg-black/5 hover:text-charcoal transition-colors"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              تصویر
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/5 border border-black/5 flex-shrink-0 shadow-sm">
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-warm-gray/40 text-xs">
                    بدون تصویر
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={uploading}
                  className="block w-full text-sm text-warm-gray file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand file:text-white file:cursor-pointer file:hover:bg-brand-dark"
                />
                {uploading && (
                  <p className="text-xs text-warm-gray/60 mt-1">در حال آپلود...</p>
                )}
                <input
                  type="text"
                  value={form.image_url || ""}
                  onChange={(e) => set("image_url", e.target.value)}
                  placeholder="یا وارد کنید URL"
                  className="mt-2 w-full px-3 py-1.5 text-sm rounded-xl border border-black/10 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                />
              </div>
            </div>
          </div>

          <Field label="نام" error={fieldErrors.name} required>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => set("name", e.target.value)}
              required
              className={inputCls(fieldErrors.name)}
              placeholder="برگر کلاسیک"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="دسته" error={fieldErrors.category} required>
              <div
                role="radiogroup"
                aria-label="دسته"
                className="flex flex-wrap gap-1.5"
              >
                {catOptions.map((c) => {
                  const active = (form.category || "burgers") === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set("category", c.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                        active
                          ? "bg-brand text-white border-brand shadow-menu"
                          : "bg-white text-warm-gray border-black/10 hover:border-brand hover:text-brand"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-warm-gray/50 mt-1.5">
                برای افزودن یا ویرایش دسته به صفحهٔ «دسته‌بندی‌ها» بروید.
              </p>
            </Field>
            <Field label="قیمت (تومان)" error={fieldErrors.price} required>
              <input
                type="text"
                value={form.price || ""}
                onChange={(e) => set("price", e.target.value)}
                required
                className={inputCls(fieldErrors.price)}
                placeholder="۵۹۰"
              />
            </Field>
          </div>

          <Field label="توضیحات" error={fieldErrors.description}>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={inputCls(fieldErrors.description)}
              placeholder="توضیحات آیتم..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="متن جایگزین تصویر" error={fieldErrors.image_alt}>
              <input
                type="text"
                value={form.image_alt || ""}
                onChange={(e) => set("image_alt", e.target.value)}
                className={inputCls(fieldErrors.image_alt)}
                placeholder="برگر کلاسیک"
              />
            </Field>
            <Field
              label="ترتیب نمایش"
              error={fieldErrors.order}
              hint="عدد کوچک‌تر = نمایش بالاتر در سایت"
            >
              <input
                type="number"
                min={0}
                value={form.order ?? 0}
                onChange={(e) => set("order", Number(e.target.value))}
                className={inputCls(fieldErrors.order)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => set("is_active", e.target.checked)}
              className="w-4 h-4 rounded accent-brand"
            />
            <span className="text-sm text-charcoal">فعال (نمایش در سایت)</span>
          </label>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-black/10 text-warm-gray hover:bg-black/[0.03]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-60 shadow-menu"
            >
              {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-warm-gray/50 mt-1">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error?: string): string {
  return `w-full px-3 py-2.5 rounded-xl border ${
    error ? "border-red-400" : "border-black/10"
  } focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition bg-white`;
}
