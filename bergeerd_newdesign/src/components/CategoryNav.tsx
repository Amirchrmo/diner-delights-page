import { useEffect, useState } from "react";
import LOGOSmall from "@/assets/LOGO-header.png";
import { Gamepad2, Home } from "lucide-react";

export interface CategoryNavEntry {
  /** Stable id used as the scroll target (`#id`). */
  id: string;
  /** Persian label shown in the pill. */
  label: string;
}

interface CategoryNavProps {
  categories: CategoryNavEntry[];
}

/**
 * Sticky top navigation with scroll-spy.
 *
 * - Stays pinned at the top once the user scrolls past the hero.
 * - Shows a compact logo + horizontally scrollable category pills.
 * - Highlights the section currently in view (scroll-spy via IntersectionObserver).
 * - Provides quick links to the top and the entertainment game.
 */
const CategoryNav = ({ categories }: CategoryNavProps) => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Show the bar after scrolling a little past the hero.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: track which menu section is centered in the viewport.
  useEffect(() => {
    if (categories.length === 0) return;
    const targets = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top that's intersecting.
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActive(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [categories]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="glass-strong border-b border-white/10">
        <div className="container mx-auto flex items-center gap-3 px-4 py-2.5">
          {/* Compact logo / home */}
          <button
            onClick={scrollTop}
            className="flex shrink-0 items-center gap-2"
            aria-label="بازگشت به بالا"
          >
            <img
              src={LOGOSmall}
              alt="برگرد"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/40"
            />
            <span className="hidden font-persian text-lg font-bold text-white sm:block">
              برگرد
            </span>
          </button>

          {/* Pills (scrollable on mobile) */}
          <nav className="flex flex-1 items-center gap-1.5 overflow-x-auto px-1 no-scrollbar">
            {categories.map((c) => {
              const isActive = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => go(c.id)}
                  className={`relative shrink-0 rounded-full px-4 py-1.5 font-persian text-sm transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: "var(--gradient-fire)" }}
                    />
                  )}
                  {c.label}
                </button>
              );
            })}
          </nav>

          {/* Quick action: game */}
          <button
            onClick={() => go("entertainment")}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-persian text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <Gamepad2 className="h-4 w-4 text-gold" />
            <span className="hidden sm:block">بازی</span>
          </button>

          <button
            onClick={scrollTop}
            className="hidden shrink-0 rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 sm:block"
            aria-label="بالا"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
