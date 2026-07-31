import { useEffect, useMemo, useState } from "react";
import type { CategoryDoc, CategoryInput } from "../types";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  HttpError,
} from "../api";

export default function Categories() {
  const [cats, setCats] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<CategoryDoc | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDoc | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listCategories();
      setCats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Always display categories by priority (ascending) so the admin list
  // mirrors the website section order.
  const sortedCats = useMemo(
    () =>
      [...cats].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title, "fa");
      }),
    [cats],
  );

  const nextOrder = useMemo(() => {
    if (cats.length === 0) return 1;
    return Math.max(...cats.map((c) => c.order)) + 1;
  }, [cats]);

  async function handleSubmit(input: CategoryInput) {
    if (editing) {
      await updateCategory(editing.id, input);
      setSuccess(`دستهٔ «${input.title || editing.title}» با موفقیت ویرایش شد.`);
    } else {
      await createCategory(input);
      setSuccess(`دستهٔ «${input.title}» با موفقیت ساخته شد.`);
    }
    setShowForm(false);
    setEditing(null);
    load().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری مجدد");
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setSuccess(`دستهٔ «${deleteTarget.title}» حذف شد.`);
      setDeleteTarget(null);
      load().catch((err) => {
        setError(err instanceof Error ? err.message : "خطا در بارگذاری مجدد");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
      setDeleteTarget(null);
    }
  }

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            دسته‌بندی‌ها
          </h1>
          <p className="text-warm-gray/70 text-sm mt-1">
            ترتیب نمایش در سایت مطابق ستون «ترتیب» است (عدد کوچک‌تر = بالاتر).
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors shadow-menu shrink-0"
        >
          + افزودن دسته
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-warm-gray/50">
          در حال بارگذاری...
        </div>
      ) : sortedCats.length === 0 ? (
        <div className="text-center py-20 text-warm-gray/50 bg-white rounded-2xl border border-black/5 shadow-card">
          دسته‌ای وجود ندارد. روی «افزودن دسته» بزنید.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-l from-brand/5 to-transparent text-warm-gray">
                <tr>
                  <th className="text-right px-4 py-3.5 font-medium">عنوان</th>
                  <th className="text-right px-4 py-3.5 font-medium">
                    شناسه (slug)
                  </th>
                  <th className="text-right px-4 py-3.5 font-medium">ترتیب</th>
                  <th className="text-right px-4 py-3.5 font-medium">وضعیت</th>
                  <th className="text-right px-4 py-3.5 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {sortedCats.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-brand/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {cat.title}
                    </td>
                    <td className="px-4 py-3 text-warm-gray/70 ltr-text font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-[2rem] justify-center px-2 py-0.5 rounded-lg bg-brand/10 text-brand text-xs font-medium tabular-nums">
                        {cat.order}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {cat.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-black/5 text-warm-gray/70 border border-black/5">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(cat);
                            setShowForm(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs border border-black/10 text-warm-gray hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <CategoryForm
          category={editing}
          defaultOrder={editing ? undefined : nextOrder}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="حذف دسته"
          message={`آیا از حذف دسته «${deleteTarget.title}» مطمئن هستید؟ آیتم‌های منو با این دسته حذف نمی‌شوند اما دیگر در سایت نمایش داده نمی‌شوند.`}
          confirmLabel="حذف"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  defaultOrder,
  onSubmit,
  onCancel,
}: {
  category: CategoryDoc | null;
  defaultOrder?: number;
  onSubmit: (input: CategoryInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CategoryInput>(
    category
      ? {
          slug: category.slug,
          title: category.title,
          order: category.order,
          is_active: category.is_active,
        }
      : { slug: "", title: "", order: defaultOrder ?? 1, is_active: true },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
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

  const isEdit = !!category;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-menu w-full max-w-lg my-8 animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-gradient-to-l from-brand/5 to-transparent rounded-t-2xl">
          <h2 className="text-lg font-bold text-charcoal">
            {isEdit ? "ویرایش دسته" : "افزودن دسته جدید"}
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
          <Field label="عنوان" error={fieldErrors.title} required>
            <input
              type="text"
              value={form.title || ""}
              onChange={(e) => set("title", e.target.value)}
              required
              className={inputCls(fieldErrors.title)}
              placeholder="برگرها"
            />
          </Field>

          <Field
            label="شناسه (slug)"
            error={fieldErrors.slug}
            required
            hint="حروف کوچک انگلیسی، اعداد و خط تیره. مثال: burgers"
          >
            <input
              type="text"
              value={form.slug || ""}
              onChange={(e) => set("slug", e.target.value)}
              required
              dir="ltr"
              className={inputCls(fieldErrors.slug)}
              placeholder="burgers"
            />
          </Field>

          {isEdit && category && (form.slug || "") !== category.slug && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              توجه: با تغییر شناسه (slug)، آیتم‌های منویی که از شناسهٔ قدیمی
              («{category.slug}») استفاده می‌کنند دیگر در این دسته نمایش داده
              نمی‌شوند. بهتر است فقط عنوان یا ترتیب را تغییر دهید، مگر اینکه
              قصد دارید آیتم‌ها را هم به‌صورت دستی به‌روزرسانی کنید.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Field label="وضعیت">
              <label className="flex items-center gap-2 cursor-pointer h-full pt-2">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="w-4 h-4 rounded accent-brand"
                />
                <span className="text-sm text-charcoal">
                  فعال (نمایش در سایت)
                </span>
              </label>
            </Field>
          </div>

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

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-menu w-full max-w-sm p-6 animate-fade-up">
        <h3 className="text-lg font-bold text-charcoal mb-2">{title}</h3>
        <p className="text-sm text-warm-gray mb-5 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-black/10 text-warm-gray hover:bg-black/[0.03]"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
