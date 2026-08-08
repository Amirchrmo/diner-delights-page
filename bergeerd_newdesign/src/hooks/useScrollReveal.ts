import { useEffect } from "react";

/**
 * Scroll-reveal system.
 *
 * Any element with the `reveal` class (optionally combined with
 * `reveal-left` / `reveal-right` / `reveal-scale`) is animated into view the
 * first time it intersects the viewport. A per-element stagger is supported via
 * the inline CSS variable `--reveal-delay`.
 *
 * IMPORTANT: this effect runs ONCE on mount (empty deps). Running it on every
 * render previously caused the IntersectionObserver to be torn down and rebuilt
 * on each commit — including every game-timer tick and every menu refetch —
 * which produced repeated errors/observer churn. The static menu is present at
 * first paint (initialData fallback), so a single mount pass is sufficient.
 */
export function useScrollReveal() {
  useEffect(() => {
    const scan = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
      );
      if (els.length === 0) return;

      if (typeof IntersectionObserver === "undefined") {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

      els.forEach((el) => io.observe(el));
      return io;
    };

    const io = scan();

    // Also re-scan shortly after mount in case async menu content rendered
    // just after the first pass (belt-and-suspenders), without looping.
    const retry = setTimeout(() => scan(), 300);

    return () => {
      clearTimeout(retry);
      io?.disconnect();
    };
  }, []);
}
