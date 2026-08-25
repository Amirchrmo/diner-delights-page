import { useMemo } from "react";
import Hero from "@/components/Hero";
import CategoryNav, { type CategoryNavEntry } from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import GameSection from "@/components/GameSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMenu } from "@/lib/menuApi";
import { Flame } from "lucide-react";

/**
 * Main page.
 *
 * Loads the menu from the API (with the static fallback), wires up the
 * scroll-spy nav and scroll-reveal animations, and lays out the experience:
 * Hero → sticky category nav → menu sections → entertainment game →
 * location → footer.
 */
const Index = () => {
  const { data: sections = [] } = useMenu();
  useScrollReveal();

  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => section.items.length > 0)
        .slice()
        .sort(
          (a, b) =>
            (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER),
        ),
    [sections],
  );

  // Build nav entries from the rendered sections. The id must match what
  // MenuSection renders (it defaults to `section-<slugified-title>` when no
  // explicit sectionId is provided).
  const navCategories: CategoryNavEntry[] = useMemo(
    () =>
      visibleSections.map((s) => ({
        id: `section-${slugify(s.title)}`,
        label: s.title,
      })),
    [visibleSections],
  );

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      {/* Sticky category navigation appears after hero */}
      <CategoryNav categories={navCategories} />

      {/* Menu */}
      <main id="menu" className="container mx-auto scroll-mt-24 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-persian text-xs text-primary-light">
              <Flame className="h-3.5 w-3.5" />
              منوی برگرد
            </span>
            <h2 className="font-persian text-4xl font-black text-foreground md:text-6xl">
              چی <span className="text-gradient-red">می‌خوای</span>؟
            </h2>
          </div>

          {visibleSections.map((section, i) => (
            <MenuSection
              key={section.title}
              title={section.title}
              items={section.items}
              index={i}
            />
          ))}
        </div>
      </main>

      {/* Entertainment */}
      <GameSection />

      {/* Location */}
      <LocationSection />

      <Footer />
    </div>
  );
};

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\w-]/g, "");
}

export default Index;
