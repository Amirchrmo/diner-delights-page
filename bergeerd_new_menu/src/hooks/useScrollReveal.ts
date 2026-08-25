import { useEffect } from "react";

/**
 * Scroll-reveal system.
 *
 * Any element with the `reveal` class (optionally combined with
 * `reveal-left` / `reveal-right` / `reveal-scale`) is animated into view the
 * first time it intersects the viewport. A per-element stagger is supported via
 * the inline CSS variable `--reveal-delay`.
 *
 * IMPORTANT — why this uses a long-lived MutationObserver:
 * The menu is loaded asynchronously from the API (`GET /api/menu`). At first
 * paint React Query shows the static `initialData`, but the real items arrive
 * shortly after, with different keys (Mongo ObjectIDs), so the menu cards are
 * remounted as brand-new DOM nodes AFTER the page has already rendered.
 *
 * A reveal hook that only scans once on mount (+ a fixed short retry) misses
 * those late-arriving nodes: they render with `opacity: 0` (`.reveal`) and are
 * never observed, so the API-driven menu stays permanently invisible even
 * though the request succeeded. The 300 ms retry was too short for real-world
 * network latency, and is fundamentally a race.
 *
 * Instead we keep a single IntersectionObserver for the whole page lifetime and
 * a MutationObserver that registers any newly-added `.reveal` element the
 * moment it enters the DOM — no matter when that happens. This is still O(1)
 * teardown/observer (no per-render churn) and makes the reveal system
 * inherently compatible with async, API-driven content.
 */
export function useScrollReveal() {
  useEffect(() => {
    // No IntersectionObserver (very old browsers / SSR): reveal everything
    // immediately and bail out — nothing to observe.
    if (typeof IntersectionObserver === "undefined") {
      const markAll = () =>
        document
          .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
          .forEach((el) => el.classList.add("is-visible"));
      markAll();
      // Still catch late nodes without IO support.
      const mo = new MutationObserver(markAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    // Safety-net timers: once an element is observed, it must become visible
    // within REVEAL_TIMEOUT ms regardless of whether the IntersectionObserver
    // fires. This is a hard guarantee that content is NEVER permanently trapped
    // at opacity:0 (e.g. if an element never scrolls into view, a layout/zoom
    // edge case, or a browser/automation context with no real viewport). Under
    // normal scrolling the observer reveals elements first and clears the timer.
    const REVEAL_TIMEOUT = 1200;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const revealNow = (el: HTMLElement) => {
      if (!el.classList.contains("is-visible")) el.classList.add("is-visible");
    };

    // A single IntersectionObserver shared for the lifetime of the page. New
    // `.reveal` nodes are registered here as they appear.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            revealNow(el);
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    /** Registers a node if it's a revealable element that isn't visible yet. */
    const observeNode = (el: HTMLElement) => {
      if (el.classList?.contains("reveal") && !el.classList.contains("is-visible")) {
        io.observe(el);
        // Safety net: force-reveal shortly after the element enters the DOM so a
        // non-intersecting element can never stay hidden forever.
        const t = setTimeout(() => {
          timers.delete(t);
          revealNow(el);
          io.unobserve(el);
        }, REVEAL_TIMEOUT);
        timers.add(t);
      }
    };

    /** Registers any revealable descendants of `root` (inclusive). */
    const scanSubtree = (root: Node) => {
      if (root.nodeType !== Node.ELEMENT_NODE &&
          root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        return;
      }
      const ctx = root as ParentNode;
      observeNode(ctx as HTMLElement);
      ctx
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => observeNode(el));
    };

    // Initial pass over everything present at mount time.
    scanSubtree(document.body);

    // Watch for DOM mutations so asynchronously-rendered content (the API menu,
    // lazy sections, future dynamic blocks) is revealed too. We only react to
    // added nodes (filtering for revealable elements) — not to attribute/character
    // changes — so there is no per-render churn from state updates elsewhere.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(scanSubtree);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);
}
