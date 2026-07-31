import { useEffect, useMemo, useState } from "react";
import type { MenuItem, MenuItemInput } from "../types";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem,
} from "../api";
import ItemForm from "../components/ItemForm";
import { useCategories } from "../hooks/useCategories";

export default function Dashboard() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const { options: catOptions, titleBySlug, categories } = useCategories();

  const catOrderBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categories) {
      map[c.slug] = c.order;
    }
    // Fallback defaults keep tabs stable before categories load.
    for (const c of catOptions) {
      if (map[c.value] === undefined) {
        map[c.value] = Number.MAX_SAFE_INTEGER;
      }
    }
    return map;
  }, [categories, catOptions]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listMenuItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Sort by category priority, then item priority — same rule as the website.
  const filtered = useMemo(() => {
    const list =
      activeCat === "all"
        ? items
        : items.filter((i) => i.category === activeCat);
    return [...list].sort((a, b) => {
      const ca = catOrderBySlug[a.category] ?? Number.MAX_SAFE_INTEGER;
      const cb = catOrderBySlug[b.category] ?? Number.MAX_SAFE_INTEGER;
      if (ca !== cb) return ca - cb;
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, "fa");
    });
  }, [items, activeCat, catOrderBySlug]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const c of catOptions) {
      map[c.value] = items.filter((i) => i.category === c.value).length;
    }
    return map;
  }, [items, catOptions]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setShowForm(true);
  }

  async function handleSubmit(input: MenuItemInput) {
    if (editing) {
      await updateMenuItem(editing.id, input);
    } else {
      await createMenuItem(input);
    }
    setShowForm(false);
    setEditing(null);
    await load();
    setActiveCat("all");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMenuItem(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
      setDeleteTarget(null);
    }
  }

  const nextOrderHint = useMemo(() => {
    const inCat =
      activeCat === "all"
        ? items
        : items.filter((i) => i.category === activeCat);
    if (inCat.length === 0) return 1;
    return Math.max(...inCat.map((i) => i.order)) + 1;
  }, [items, activeCat]);

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            مدیریت منو
          </h1>
          <p className="text-warm-gray/70 text-sm mt-1">
            ترتیب نمایش با عدد کوچک‌تر = بالاتر در سایت. تغییرات بلافاصله اعمال
            می‌شود.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors shadow-menu shrink-0"
        >
          + افزودن آیتم
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-5 border-b border-black/5 overflow-x-auto pb-px">
        <Tab
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
          label="همه"
          count={counts.all}
        />
        {catOptions.map((c) => (
          <Tab
            key={c.value}
            active={activeCat === c.value}
            onClick={() => setActiveCat(c.value)}
            label={c.label}
            count={counts[c.value] ?? 0}
          />
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-warm-gray/50">در حال بارگذاری...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-warm-gray/50 bg-white rounded-2xl border border-black/5 shadow-card">
          آیتمی وجود ندارد. روی «افزودن آیتم» بزنید.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-l from-brand/5 to-transparent text-warm-gray">
                <tr>
                  <th className="text-right px-4 py-3.5 font-medium">تصویر</th>
                  <th className="text-right px-4 py-3.5 font-medium">نام</th>
                  <th className="text-right px-4 py-3.5 font-medium">دسته</th>
                  <th className="text-right px-4 py-3.5 font-medium">قیمت</th>
                  <th className="text-right px-4 py-3.5 font-medium">ترتیب</th>
                  <th className="text-right px-4 py-3.5 font-medium">وضعیت</th>
                  <th className="text-right px-4 py-3.5 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 shadow-sm">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.image_alt}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-warm-gray/80">
                      {titleBySlug(item.category)}
                    </td>
                    <td className="px-4 py-3 text-charcoal tabular-nums">
                      {item.price} تومان
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-[2rem] justify-center px-2 py-0.5 rounded-lg bg-brand/10 text-brand text-xs font-medium tabular-nums">
                        {item.order}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.is_active ? (
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
                          onClick={() => openEdit(item)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-black/10 text-warm-gray hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
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
        <ItemForm
          item={editing}
          categories={catOptions}
          defaultOrder={editing ? undefined : nextOrderHint}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="حذف آیتم"
          message={`آیا از حذف «${deleteTarget.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
          confirmLabel="حذف"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
        active
          ? "border-brand text-brand"
          : "border-transparent text-warm-gray/70 hover:text-charcoal"
      }`}
    >
      {label}{" "}
      <span className={`text-xs ${active ? "opacity-70" : "opacity-50"}`}>
        ({count})
      </span>
    </button>
  );
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
